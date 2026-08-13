import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("offers a short reusable-workflow install for beginners", async () => {
  const readme = await readText("README.md");
  const chineseReadme = await readText("README.zh-CN.md");
  const yaml = fencedBlock(readme, "yaml");

  assert.equal(yaml, fencedBlock(chineseReadme, "yaml"));
  assert.match(
    yaml,
    /uses: onovich\/RepoPalette\/.github\/workflows\/profile\.yml@[0-9a-f]{40}/
  );
  assert.match(yaml, /permissions:\s*\n\s+contents: write/);
  assert.match(
    yaml,
    /push:\s*\n\s+paths:\s*\n\s+- \.github\/workflows\/repopalette\.yml/
  );
  assert.doesNotMatch(yaml, /actions\/checkout|git (add|commit|push)|runs-on:/);
  assert.ok(
    yaml.split(/\r?\n/).length <= 18,
    "the beginner workflow should fit on one screen"
  );
});

test("keeps the beginner path focused and moves internals to advanced docs", async () => {
  const readme = await readText("README.md");
  const beforeAdvanced = readme.split("## Need more control?")[0];

  assert.match(readme, /## Quick start/);
  assert.match(readme, /Install with AI/);
  assert.match(readme, /docs\/INSTALL_WITH_AI\.md/);
  assert.match(readme, /docs\/ADVANCED_USAGE\.md/);
  assert.match(
    readme,
    /first commit starts RepoPalette automatically[\s\S]*chart is already in your Profile README/i
  );
  assert.doesNotMatch(beforeAdvanced, /GITHUB_TOKEN|GraphQL|audit JSON|atomic|output path/i);
});

test("describes the product with searchable, concrete GitHub Profile terms", async () => {
  const readme = await readText("README.md");
  const chineseReadme = await readText("README.zh-CN.md");

  assert.match(
    readme,
    /self-updating GitHub Profile language chart from your public repositories/i
  );
  assert.match(readme, /ten visual layouts, exact percentages/i);
  assert.match(chineseReadme, /GitHub Profile.*自动更新的编程语言构成图/);
  assert.match(
    readme,
    /https:\/\/github\.com\/marketplace\/actions\/repopalette/
  );
  assert.match(
    chineseReadme,
    /https:\/\/github\.com\/marketplace\/actions\/repopalette/
  );
  assert.doesNotMatch(readme, /Once published/);
  assert.doesNotMatch(chineseReadme, /上架后/);
});

test("ships an idempotent reusable workflow with friendly visual defaults", async () => {
  const workflow = await readText(".github/workflows/profile.yml");

  assert.match(workflow, /workflow_call:/);
  assert.match(workflow, /style:[\s\S]*?default: ribbon/);
  assert.match(workflow, /theme:[\s\S]*?default: paper/);
  assert.match(workflow, /update-readme: true/);
  assert.match(workflow, /concurrency:/);
  assert.match(workflow, /git diff --cached --quiet/);
  assert.match(workflow, /git push/);
  assert.match(workflow, /uses: actions\/checkout@[0-9a-f]{40}/);
  assert.match(workflow, /uses: onovich\/RepoPalette@[0-9a-f]{40}/);
});

test("provides an AI-readable installer and a direct Action escape hatch", async () => {
  const aiInstaller = await readText("docs/INSTALL_WITH_AI.md");
  const advanced = await readText("docs/ADVANCED_USAGE.md");

  assert.match(aiInstaller, /Profile repository/);
  assert.match(aiInstaller, /\.github\/workflows\/repopalette\.yml/);
  assert.match(aiInstaller, /Run workflow/);
  assert.match(aiInstaller, /do not create a personal access token/i);
  assert.match(advanced, /Use the Action directly/);
  assert.match(advanced, /uses: onovich\/RepoPalette@[0-9a-f]{40}/);
  assert.match(advanced, /coding-mode/);
  assert.match(advanced, /show-branding/);
});

function fencedBlock(markdown, language) {
  const match = markdown.match(new RegExp(
    "```" + language + "\\r?\\n([\\s\\S]*?)\\r?\\n```"
  ));
  assert.ok(match, "missing " + language + " code block");
  return match[1].replace(/\r\n/g, "\n");
}

function readText(path) {
  return readFile(new URL(path, root), "utf8");
}
