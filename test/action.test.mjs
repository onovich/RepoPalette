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
      INPUT_STYLE: "orbit",
      INPUT_THEME: "aurora",
      GITHUB_OUTPUT: outputFile
    },
    fetchImpl: async () => fixtureResponse(),
    sleep: async () => {},
    logger: { info() {}, warn() {} }
  });

  const svg = await readFile(join(workspace, "assets", "top-langs.svg"), "utf8");
  assert.match(svg, /data-style="orbit"/);
  assert.match(svg, /data-theme="aurora"/);
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
    /style must be one of: bars, orbit, constellation/
  );
});

function fixtureResponse() {
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
              edges: [{
                size: 1_000,
                node: { name: "C#", color: "#178600" }
              }],
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
