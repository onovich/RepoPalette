import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runAction } from "../src/action-runner.mjs";
import { updateProfileReadme } from "../src/profile-readme.mjs";

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

test("combines user-declared coding groups into one Action output", async (t) => {
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
      "INPUT_MANUAL-TITLE": "Handwritten",
      "INPUT_VIBE-TITLE": "AI-assisted",
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

  const svg = await readFile(
    join(workspace, "assets", "top-langs.svg"),
    "utf8"
  );
  const audit = JSON.parse(
    await readFile(join(workspace, "assets", "top-langs-data.json"), "utf8")
  );
  const outputs = await readFile(outputFile, "utf8");

  assert.match(svg, /<title id="title">Most Used Languages<\/title>/);
  assert.match(svg, /data-coding-mode="split"/);
  assert.match(svg, /data-role="coding-overview-part" data-group="manual" data-share="40"/);
  assert.match(svg, /data-role="coding-overview-part" data-group="vibe" data-share="60"/);
  assert.match(svg, /data-role="coding-group" data-group="manual"/);
  assert.match(svg, /data-role="coding-group" data-group="vibe"/);
  assert.match(svg, />Handwritten<\/text>/);
  assert.match(svg, />AI-assisted<\/text>/);
  assert.match(svg, />C#<\/text>/);
  assert.match(svg, />ShaderLab<\/text>/);
  assert.match(svg, />TypeScript<\/text>/);
  assert.match(svg, />Python<\/text>/);
  assert.match(svg, />75\.0%<\/text>/);
  assert.match(svg, />25\.0%<\/text>/);
  assert.match(svg, />66\.7%<\/text>/);
  assert.match(svg, />33\.3%<\/text>/);
  assert.match(
    svg,
    /data-role="coding-overview-part" data-group="manual"[\s\S]*?<rect[^>]*fill="#fd7136"/
  );
  assert.match(
    svg,
    /data-role="coding-overview-part" data-group="vibe"[\s\S]*?<rect[^>]*fill="#024b81"/
  );
  assert.match(svg, /data-language="C#"[^>]*fill="#fd7136"/);
  assert.match(svg, /data-language="TypeScript"[^>]*fill="#024b81"/);
  assert.equal(svg.match(/>RepoPalette<\/text>/g)?.length, 1);
  assert.equal(svg.match(/1 OF 1 PUBLIC REPOS/g)?.length, 1);

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
  assert.match(result.svgPath, /top-langs\.svg$/);
  assert.equal(result.manualSvgPath, "");
  assert.equal(result.vibeSvgPath, "");
  assert.match(outputs, /^svg-path=.*top-langs\.svg$/m);
  assert.match(outputs, /^manual-svg-path=$/m);
  assert.match(outputs, /^vibe-svg-path=$/m);
});

test("uses one full-width, multi-color card when only one coding group has data", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-single-group-"));
  const outputFile = join(workspace, "github-output.txt");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  await runAction({
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      INPUT_USERNAME: "onovich",
      "INPUT_CODING-MODE": "split",
      "INPUT_MANUAL-LANGUAGES": "C#, TypeScript, Python",
      INPUT_STYLE: "bars",
      INPUT_THEME: "light",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse({
      languages: [
        { name: "TypeScript", size: 500, color: "#3178c6" },
        { name: "Python", size: 300, color: "#3572A5" },
        { name: "C#", size: 200, color: "#178600" }
      ]
    }),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const svg = await readFile(
    join(workspace, "assets", "top-langs.svg"),
    "utf8"
  );
  assert.match(svg, /data-coding-layout="single-group"/);
  assert.match(svg, /width="800"[^>]*viewBox="0 0 800 /);
  assert.match(svg, /data-role="coding-group" data-group="manual"/);
  assert.doesNotMatch(svg, /data-group="vibe"/);
  assert.doesNotMatch(svg, /data-role="coding-overview-part"/);
  assert.match(svg, /data-role="bar-value"[^>]*fill="#3178c6"/i);
  assert.match(svg, /data-role="bar-value"[^>]*fill="#3572A5"/);
  assert.match(svg, /data-role="bar-value"[^>]*fill="#178600"/);
});

test("keeps a non-zero sub-tenth language visible without calling it zero", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-small-share-"));
  const outputFile = join(workspace, "github-output.txt");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  await runAction({
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      INPUT_USERNAME: "onovich",
      "INPUT_CODING-MODE": "split",
      "INPUT_MANUAL-LANGUAGES": "C#,GLSL",
      INPUT_STYLE: "bars",
      INPUT_THEME: "paper",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse({
      languages: [
        { name: "C#", size: 5_500_000, color: "#178600" },
        { name: "TypeScript", size: 5_500_000, color: "#3178c6" },
        { name: "GLSL", size: 1, color: "#5686a5" }
      ]
    }),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const svg = await readFile(
    join(workspace, "assets", "top-langs.svg"),
    "utf8"
  );
  const audit = JSON.parse(
    await readFile(join(workspace, "assets", "top-langs-data.json"), "utf8")
  );
  assert.equal(
    audit.languages.find(({ name }) => name === "GLSL")?.bytes,
    1
  );
  assert.match(svg, />GLSL<\/text>[\s\S]*?>&lt;0\.1%<\/text>/);
  assert.doesNotMatch(svg, />GLSL<\/text>[\s\S]{0,200}>0\.0%<\/text>/);
});

test("can install and maintain a single chart in the profile README", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-readme-"));
  const outputFile = join(workspace, "github-output.txt");
  const readmePath = join(workspace, "README.md");
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const originalReadme = "# onovich\n\nHello.\n\n  \n";
  await writeFile(readmePath, originalReadme, "utf8");

  const options = {
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      GITHUB_REPOSITORY_OWNER: "onovich",
      "INPUT_UPDATE-README": "true",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse(),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  };

  const first = await runAction(options);
  await runAction(options);

  const readme = await readFile(readmePath, "utf8");
  const outputs = await readFile(outputFile, "utf8");
  assert.ok(
    readme.startsWith(originalReadme),
    "installing the managed block must preserve all existing README bytes"
  );
  assert.match(readme, /<!-- repopalette:start -->/);
  assert.match(
    readme,
    /!\[GitHub language composition\]\(\.\/assets\/top-langs\.svg\)/
  );
  assert.match(readme, /<!-- repopalette:end -->/);
  assert.equal(readme.match(/<!-- repopalette:start -->/g)?.length, 1);
  assert.equal(first.readmePath, readmePath);
  assert.match(outputs, /^readme-path=.*README\.md$/m);
});

test("updates the managed README block with one combined split chart", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-readme-split-"));
  const outputFile = join(workspace, "github-output.txt");
  const readmePath = join(workspace, "README.md");
  t.after(() => rm(workspace, { recursive: true, force: true }));
  await writeFile(
    readmePath,
    "# Profile\n\n<!-- repopalette:start -->\nold\n<!-- repopalette:end -->\n",
    "utf8"
  );

  await runAction({
    cwd: workspace,
    env: {
      "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
      GITHUB_REPOSITORY_OWNER: "onovich",
      "INPUT_UPDATE-README": "true",
      "INPUT_CODING-MODE": "split",
      "INPUT_MANUAL-LANGUAGES": "C#",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse({
      languages: [
        { name: "C#", size: 600, color: "#178600" },
        { name: "TypeScript", size: 400, color: "#3178c6" }
      ]
    }),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const readme = await readFile(readmePath, "utf8");
  assert.doesNotMatch(readme, /\nold\n/);
  assert.match(
    readme,
    /!\[GitHub language composition by coding approach\]\(\.\/assets\/top-langs\.svg\)/
  );
  assert.doesNotMatch(readme, /top-langs-(?:manual|vibe)\.svg/);
  assert.doesNotMatch(readme, /width="49%"/);
  assert.equal(readme.match(/<!-- repopalette:start -->/g)?.length, 1);
});

test("rejects reversed README markers instead of reporting success", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-readme-order-"));
  const outputFile = join(workspace, "github-output.txt");
  const readmePath = join(workspace, "README.md");
  const originalReadme = [
    "# Profile",
    "",
    "<!-- repopalette:end -->",
    "old",
    "<!-- repopalette:start -->",
    ""
  ].join("\n");
  t.after(() => rm(workspace, { recursive: true, force: true }));
  await writeFile(readmePath, originalReadme, "utf8");

  await assert.rejects(
    runAction({
      cwd: workspace,
      env: {
        "INPUT_GITHUB-TOKEN": "automatic-workflow-token",
        GITHUB_REPOSITORY_OWNER: "onovich",
        "INPUT_UPDATE-README": "true",
        GITHUB_OUTPUT: outputFile
      },
      fetchImpl: async () => fixtureResponse(),
      sleep: async () => {},
      logger: { info() {}, warn() {} }
    }),
    /one complete, ordered RepoPalette block or none/
  );
  assert.equal(await readFile(readmePath, "utf8"), originalReadme);
});

test("encodes a custom combined output path in Markdown", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "repopalette-readme-paths-"));
  t.after(() => rm(workspace, { recursive: true, force: true }));

  await updateProfileReadme({
    workspace,
    username: "onovich",
    codingMode: "split",
    svgPath: join(
      workspace,
      "profile cards",
      "coding modes #chart).svg"
    )
  });

  const readme = await readFile(join(workspace, "README.md"), "utf8");
  assert.match(
    readme,
    /\(\.\/profile%20cards\/coding%20modes%20%23chart%29\.svg\)/
  );
  assert.doesNotMatch(readme, /\([^\n]*[ #]/);
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
