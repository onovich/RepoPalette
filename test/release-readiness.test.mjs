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
    assert.match(document, /uses: onovich\/RepoPalette@[0-9a-f]{40}/);
    assert.match(document, new RegExp("`@" + escapeRegExp(versionTag) + "`"));
    assert.match(document, /permissions:\s*\n\s+contents: write/);
    assert.match(
      document,
      /uses: actions\/checkout@[0-9a-f]{40}\s+# v\d+\.\d+\.\d+/
    );
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
});

test("pins a commit that implements every advertised layout", async () => {
  const documents = await Promise.all([
    readText("README.md"),
    readText("README.zh-CN.md")
  ]);
  const pins = documents.map((document) =>
    /uses: onovich\/RepoPalette@([0-9a-f]{40})/.exec(document)?.[1]
  );
  assert.ok(pins.every(Boolean));
  assert.equal(new Set(pins).size, 1);

  const { stdout: registry } = await execFileAsync(
    "git",
    ["show", pins[0] + ":src/renderers/index.mjs"],
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
      "package.json",
      "scripts",
      "src"
    ],
    { cwd: fileURLToPath(root) }
  );
});

test("keeps the action metadata ready for a tagged preview", async () => {
  const action = await readText("action.yml");
  const rootEntries = await readdir(root, { withFileTypes: true });
  const rootMetadataFiles = rootEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name === "action.yml" || name === "action.yaml");

  assert.deepEqual(rootMetadataFiles, ["action.yml"]);
  assert.match(action, /^name: RepoPalette$/m);
  assert.match(action, /^author: onovich$/m);
  assert.match(action, /^description: .+$/m);
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
  assert.match(action, /manual-languages:/);
  assert.match(action, /manual-title:[\s\S]*?default: Manual Coding/);
  assert.match(action, /vibe-title:[\s\S]*?default: Vibe Coding/);
  assert.match(action, /^  manual-svg-path:$/m);
  assert.match(action, /^  vibe-svg-path:$/m);
  assert.match(action, /^\s+using: node24$/m);
  assert.match(action, /^\s+main: src\/action\.mjs$/m);
  assert.match(action, /^branding:\s*$/m);
  assert.match(action, /^\s+icon: bar-chart-2$/m);
  assert.match(action, /^\s+color: purple$/m);
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
    "docs/PRODUCT_DECISIONS.md"
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
