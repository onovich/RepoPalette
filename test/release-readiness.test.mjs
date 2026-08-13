import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const execFileAsync = promisify(execFile);

test("keeps the public install example aligned with the package version", async () => {
  const packageJson = JSON.parse(await readText("package.json"));
  const readme = await readText("README.md");
  const chineseReadme = await readText("README.zh-CN.md");
  const changelog = await readText("CHANGELOG.md");
  const versionTag = "v" + packageJson.version;

  for (const document of [readme, chineseReadme]) {
    assert.match(
      document,
      /uses: onovich\/RepoPalette\/\.github\/workflows\/profile\.yml@[0-9a-f]{40}/
    );
    assert.match(document, new RegExp("`@" + escapeRegExp(versionTag) + "`"));
    assert.match(
      document,
      /\/blob\/[0-9a-f]{40}\/docs\/INSTALL_WITH_AI\.md/
    );
    assert.match(document, /permissions:\s*\n\s+contents: write/);
    assert.doesNotMatch(fencedBlock(document, "yaml"), /actions\/checkout/);
  }
  assert.equal(
    fencedBlock(readme, "yaml"),
    fencedBlock(chineseReadme, "yaml"),
    "English and Chinese quick starts must stay identical"
  );
  assert.match(changelog, new RegExp(
    "^## \\[" + escapeRegExp(packageJson.version) + "\\]",
    "m"
  ));
  assert.match(changelog, new RegExp(
    "/releases/tag/" + escapeRegExp(versionTag)
  ));

  const guidePins = [readme, chineseReadme].map((document) =>
    /\/blob\/([0-9a-f]{40})\/docs\/INSTALL_WITH_AI\.md/.exec(document)?.[1]
  );
  assert.ok(guidePins.every(Boolean));
  assert.equal(new Set(guidePins).size, 1);
  await execFileAsync(
    "git",
    ["show", guidePins[0] + ":docs/INSTALL_WITH_AI.md"],
    { cwd: fileURLToPath(root) }
  );
  await execFileAsync(
    "git",
    [
      "diff",
      "--exit-code",
      guidePins[0],
      "HEAD",
      "--",
      "docs/INSTALL_WITH_AI.md",
      "docs/ADVANCED_USAGE.md"
    ],
    { cwd: fileURLToPath(root) }
  );
});

test("pins a commit that contains the complete reusable installer", async () => {
  const documents = await Promise.all([
    readText("README.md"),
    readText("README.zh-CN.md")
  ]);
  const pins = documents.map((document) =>
    /uses: onovich\/RepoPalette\/\.github\/workflows\/profile\.yml@([0-9a-f]{40})/.exec(document)?.[1]
  );
  assert.ok(pins.every(Boolean));
  assert.equal(new Set(pins).size, 1);

  const { stdout: workflow } = await execFileAsync(
    "git",
    ["show", pins[0] + ":.github/workflows/profile.yml"],
    { cwd: fileURLToPath(root) }
  );
  const actionPin = /uses: onovich\/RepoPalette@([0-9a-f]{40})/.exec(
    workflow
  )?.[1];
  assert.ok(actionPin, "the reusable workflow must pin the underlying Action");
  assert.match(workflow, /update-readme: true/);
  await execFileAsync(
    "git",
    [
      "diff",
      "--exit-code",
      actionPin,
      pins[0],
      "--",
      "action.yml",
      "src"
    ],
    { cwd: fileURLToPath(root) }
  );

  const { stdout: registry } = await execFileAsync(
    "git",
    ["show", actionPin + ":src/renderers/index.mjs"],
    { cwd: fileURLToPath(root) }
  );
  for (const style of [
    "bars",
    "orbit",
    "constellation",
    "ribbon",
    "bead-halo",
    "matrix",
    "halo",
    "treemap",
    "voronoi",
    "prism"
  ]) {
    assert.match(registry, new RegExp('defineStyle\\("' + style + '"'));
  }
  await execFileAsync(
    "git",
    [
      "diff",
      "--exit-code",
      pins[0],
      "HEAD",
      "--",
      "action.yml",
      ".github/workflows/profile.yml",
      "scripts",
      "src"
    ],
    { cwd: fileURLToPath(root) }
  );
});

test("keeps the action metadata ready for a tagged preview", async () => {
  const action = await readText("action.yml");
  const packageJson = JSON.parse(await readText("package.json"));
  const marketplace = await readText("docs/MARKETPLACE_RELEASE.md");
  const rootEntries = await readdir(root, { withFileTypes: true });
  const rootMetadataFiles = rootEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name === "action.yml" || name === "action.yaml");

  assert.deepEqual(rootMetadataFiles, ["action.yml"]);
  assert.match(action, /^name: RepoPalette$/m);
  assert.match(action, /^author: onovich$/m);
  assert.match(
    action,
    /^description: Generate validated, self-updating GitHub Profile language charts and auditable data in your own repository\.$/m
  );
  assert.equal(
    packageJson.description,
    "Generate validated, self-updating GitHub Profile language charts and auditable data in your own repository."
  );
  assert.match(
    action,
    /Visual layout: bars, orbit, constellation, ribbon, bead-halo, matrix, halo, treemap, voronoi, or prism\./
  );
  assert.match(
    action,
    /Color theme: light, paper, midnight, aurora, terminal, or neon\./
  );
  assert.match(
    action,
    /show-branding:[\s\S]*?default: "true"/
  );
  assert.match(
    action,
    /coding-mode:[\s\S]*?default: off/
  );
  assert.match(action, /update-readme:[\s\S]*?default: "false"/);
  assert.match(action, /manual-languages:/);
  assert.match(action, /manual-title:[\s\S]*?default: Manual Coding/);
  assert.match(action, /vibe-title:[\s\S]*?default: Vibe Coding/);
  assert.match(action, /^  manual-svg-path:$/m);
  assert.match(action, /^  vibe-svg-path:$/m);
  assert.match(action, /^  readme-path:$/m);
  assert.match(action, /^\s+using: node24$/m);
  assert.match(action, /^\s+main: src\/action\.mjs$/m);
  assert.match(action, /^branding:\s*$/m);
  assert.match(action, /^\s+icon: bar-chart-2$/m);
  assert.match(action, /^\s+color: purple$/m);
  assert.match(marketplace, /Primary category: `Utilities`/);
  assert.match(marketplace, /Secondary category: `Reporting`/);
  assert.match(marketplace, /First Marketplace release:[\s\S]*v0\.7\.0/);
  assert.match(
    marketplace,
    /https:\/\/github\.com\/marketplace\/actions\/repopalette/
  );
  assert.match(marketplace, /merge the release pull request.*before creating the tag/i);
  assert.match(
    marketplace,
    /docs\.github\.com\/en\/actions\/how-tos\/create-and-publish-actions\/publish-in-github-marketplace/
  );
});

test("ships a reusable GitHub social preview at the recommended dimensions", async () => {
  const source = await readText("docs/social-preview.svg");
  const png = await readFile(new URL("docs/social-preview.png", root));

  assert.match(source, /width="1280" height="640"/);
  assert.match(source, /RepoPalette/);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1280);
  assert.equal(png.readUInt32BE(20), 640);
  assert.ok(png.length < 1_000_000);
});

test("runs CI for semantic version tags and checks the package version", async () => {
  const workflow = await readText(".github/workflows/ci.yml");

  assert.match(workflow, /push:\s*\n\s+branches:\s*\n\s+- main/);
  assert.match(workflow, /tags:\s*\n\s+- "v\*"/);
  assert.match(
    workflow,
    /name: Check out repository\s*\n\s+uses: actions\/checkout@[0-9a-f]{40}[^\n]*\n\s+with:\s*\n\s+fetch-depth: 0/
  );
  assert.match(workflow, /if: github\.ref_type == 'tag'/);
  assert.match(workflow, /GITHUB_REF_NAME/);
  assert.match(workflow, /package\.json/);
});

test("keeps release-facing text as UTF-8 without a byte-order mark", async () => {
  for (const path of [
    "README.md",
    "README.zh-CN.md",
    "CHANGELOG.md",
    ".gitattributes",
    ".github/workflows/ci.yml",
    "action.yml",
    "package.json",
    "docs/GALLERY.md",
    "docs/PRODUCT_DECISIONS.md",
    "docs/ADVANCED_USAGE.md",
    "docs/INSTALL_WITH_AI.md",
    "docs/QUICK_START_INSTALLATION_RESEARCH.md",
    "docs/MARKETPLACE_RELEASE.md",
    ".github/workflows/profile.yml"
  ]) {
    const bytes = await readFile(new URL(path, root));
    assert.notDeepEqual(
      [...bytes.subarray(0, 3)],
      [0xef, 0xbb, 0xbf],
      path + " must not start with a UTF-8 BOM"
    );
    assert.doesNotMatch(bytes.toString("utf8"), /\uFFFD/, path);
  }
});

test("keeps generated SVG previews byte-stable across platforms", async () => {
  const attributes = await readText(".gitattributes");
  assert.match(attributes, /^\*\.svg text eol=lf$/m);
});

test("records the adaptive single-group split behavior in product decisions", async () => {
  const decisions = await readText("docs/PRODUCT_DECISIONS.md");

  assert.match(decisions, /若只有一个非空组，则省略空分区和总占比带/);
  assert.match(decisions, /仅一个组有数据时使用全宽布局/);
  assert.match(decisions, /仅一个组有数据时.*常规多语言色板/);
});

test("keeps English as the concise default with a Chinese entry point", async () => {
  const readme = await readText("README.md");
  const chineseReadme = await readText("README.zh-CN.md");

  assert.match(readme, /^\[简体中文\]\(README\.zh-CN\.md\)$/m);
  assert.match(chineseReadme, /^\[English\]\(README\.md\)$/m);
  assert.match(chineseReadme, /\p{Script=Han}/u);
  assert.doesNotMatch(
    readme.replace("[简体中文](README.zh-CN.md)", ""),
    /\p{Script=Han}/u,
    "the default README should remain English-only outside the language link"
  );
  assert.doesNotMatch(readme, /<br\/>\*\*/);
  assert.ok(
    readme.split(/\r?\n/).length <= 120,
    "the default README should remain quick to scan"
  );
  assert.ok(
    Buffer.byteLength(readme, "utf8") <= 9_000,
    "the default README should remain concise"
  );
});

function fencedBlock(markdown, language) {
  const match = markdown.match(new RegExp(
    "```" + escapeRegExp(language) + "\\r?\\n([\\s\\S]*?)\\r?\\n```"
  ));
  assert.ok(match, "missing " + language + " code block");
  return match[1].replace(/\r\n/g, "\n");
}

function readText(path) {
  return readFile(new URL(path, root), "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
