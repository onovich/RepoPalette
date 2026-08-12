import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runAction } from "../src/action-runner.mjs";

test("runs from GitHub context without a personal access token", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-action-"));
  const outputFile = join(workspace, "github-output.txt");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  const result = await runAction({
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      GITHUB_REPOSITORY_OWNER: "onovich",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse(),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const svg = await readFile(join(workspace, "assets", "top-langs.svg"), "utf8");
  const audit = JSON.parse(
    await readFile(join(workspace, "assets", "top-langs-data.json"), "utf8")
  );
  const outputs = await readFile(outputFile, "utf8");

  assert.match(svg, /Most Used Languages/);
  assert.equal(audit.username, "onovich");
  assert.equal(audit.repositoryCount, 1);
  assert.equal(result.includedRepositoryCount, 1);
  assert.match(outputs, /^svg-path=.*top-langs\.svg$/m);
  assert.match(outputs, /^data-path=.*top-langs-data\.json$/m);
  assert.match(outputs, /^repository-count=1$/m);
  assert.doesNotMatch(outputs, /automatic-workflow-token/);
});

test("passes a selected style and theme through to the generated card", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-style-"));
  const outputFile = join(workspace, "github-output.txt");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  await runAction({
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      INPUT_USERNAME: "onovich",
      INPUT_STYLE: "voronoi",
      INPUT_THEME: "paper",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse(),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const svg = await readFile(join(workspace, "assets", "top-langs.svg"), "utf8");
  assert.match(svg, /data-style="voronoi"/);
  assert.match(svg, /data-theme="paper"/);
  assert.match(svg, /data-shape-role="voronoi-part"/);
});

test("splits user-declared manual languages into two Action outputs", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-split-"));
  const outputFile = join(workspace, "github-output.txt");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  const result = await runAction({
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      INPUT_USERNAME: "onovich",
      "INPUT_CODING-MODE": "split",
      "INPUT_MANUAL-LANGUAGES": "C#, ShaderLab, HLSL, GLSL",
      "INPUT_SHOW-BRANDING": "false",
      INPUT_STYLE: "ribbon",
      INPUT_THEME: "paper",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse({
      languages: [
        { name: "TypeScript", size: 400, color: "#3178c6" },
        { name: "C#", size: 300, color: "#178600" },
        { name: "Python", size: 200, color: "#3572A5" },
        { name: "ShaderLab", size: 100, color: "#222c37" }
      ]
    }),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const manualSvg = await readFile(
    join(workspace, "assets", "top-langs-manual.svg"),
    "utf8"
  );
  const vibeSvg = await readFile(
    join(workspace, "assets", "top-langs-vibe.svg"),
    "utf8"
  );
  const audit = JSON.parse(
    await readFile(join(workspace, "assets", "top-langs-data.json"), "utf8")
  );
  const outputs = await readFile(outputFile, "utf8");

  assert.match(manualSvg, /<title id="title">Manual Coding<\/title>/);
  assert.match(manualSvg, />C#<\/text>/);
  assert.match(manualSvg, />ShaderLab<\/text>/);
  assert.doesNotMatch(manualSvg, />TypeScript<\/text>/);
  assert.match(manualSvg, />75\.0%<\/text>/);
  assert.match(manualSvg, /40\.0% OF BYTES/);
  assert.doesNotMatch(manualSvg, />RepoPalette<\/text>/);

  assert.match(vibeSvg, /<title id="title">Vibe Coding<\/title>/);
  assert.match(vibeSvg, />TypeScript<\/text>/);
  assert.match(vibeSvg, />Python<\/text>/);
  assert.doesNotMatch(vibeSvg, />C#<\/text>/);
  assert.match(vibeSvg, />66\.7%<\/text>/);
  assert.match(vibeSvg, /60\.0% OF BYTES/);

  assert.equal(audit.schemaVersion, 3);
  assert.deepEqual(audit.classification, {
    mode: "split",
    source: "user-declared",
    manualLanguages: ["C#", "ShaderLab", "HLSL", "GLSL"],
    groups: {
      manual: {
        totalBytes: 400,
        percentage: 40,
        languages: ["C#", "ShaderLab"]
      },
      vibe: {
        totalBytes: 600,
        percentage: 60,
        languages: ["TypeScript", "Python"]
      }
    }
  });
  assert.equal(result.svgPath, "");
  assert.match(result.manualSvgPath, /top-langs-manual\.svg$/);
  assert.match(result.vibeSvgPath, /top-langs-vibe\.svg$/);
  assert.match(outputs, /^svg-path=$/m);
  assert.match(outputs, /^manual-svg-path=.*top-langs-manual\.svg$/m);
  assert.match(outputs, /^vibe-svg-path=.*top-langs-vibe\.svg$/m);
});

test("rejects an unknown renderer instead of silently changing the design", async () => {
  await assert.rejects(
    runAction({
      env: {
        "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
        INPUT_USERNAME: "onovich",
        INPUT_STYLE: "donut",
        GITHUB_OUTPUT: "unused"
      }
    }),
    /style must be one of: bars, orbit, constellation, ribbon, bead-halo, matrix, halo, treemap, voronoi, prism/
  );
});

function fixtureResponse({ languages } = {}) {
  const languageEdges = languages ?? [{
    name: "C#",
    size: 1_000,
    color: "#178600"
  }];
  return new Response(JSON.stringify({
    data: {
      user: {
        repositories: {
          totalCount: 1,
          nodes: [{
            id: "repo-1",
            name: "unity-game",
            isArchived: false,
            isFork: false,
            visibility: "PUBLIC",
            languages: {
              edges: languageEdges.map((language) => ({
                size: language.size,
                node: { name: language.name, color: language.color }
              })),
              pageInfo: { hasNextPage: false, endCursor: null }
            }
          }],
          pageInfo: { hasNextPage: false, endCursor: null }
        }
      },
      rateLimit: {
        cost: 1,
        remaining: 4_999,
        resetAt: "2030-01-01T00:00:00Z"
      }
    }
  }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}
