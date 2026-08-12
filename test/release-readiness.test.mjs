import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("keeps the public install example aligned with the package version", async () => {
  const packageJson = JSON.parse(await readText("package.json"));
  const readme = await readText("README.md");
  const changelog = await readText("CHANGELOG.md");
  const versionTag = "v" + packageJson.version;

  assert.match(readme, /uses: onovich\/RepoPalette@[0-9a-f]{40}/);
  assert.match(readme, new RegExp("`@" + escapeRegExp(versionTag) + "`"));
  assert.match(readme, /permissions:\s*\n\s+contents: write/);
  assert.match(
    readme,
    /uses: actions\/checkout@[0-9a-f]{40}\s+# v\d+\.\d+\.\d+/
  );
  assert.match(changelog, new RegExp(
    "^## \\[" + escapeRegExp(packageJson.version) + "\\]",
    "m"
  ));
  assert.match(changelog, new RegExp(
    "/releases/tag/" + escapeRegExp(versionTag)
  ));
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
  assert.match(workflow, /if: github\.ref_type == 'tag'/);
  assert.match(workflow, /GITHUB_REF_NAME/);
  assert.match(workflow, /package\.json/);
});

test("keeps release-facing text as UTF-8 without a byte-order mark", async () => {
  for (const path of [
    "README.md",
    "CHANGELOG.md",
    ".gitattributes",
    ".github/workflows/ci.yml",
    "action.yml",
    "package.json",
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

test("keeps the README in paired English and Chinese blocks", async () => {
  const readme = await readText("README.md");
  assertPairedReadme(readme);
  assertPairedReadme(readme.replace(/\r?\n/g, "\r\n"));
});

function assertPairedReadme(readme) {
  let insideCodeFence = false;

  for (const [index, line] of readme.split(/\r?\n/).entries()) {
    if (line.startsWith("```")) {
      insideCodeFence = !insideCodeFence;
      continue;
    }
    if (insideCodeFence || line === "" || line.startsWith("[![")) {
      continue;
    }
    if (line.startsWith("#")) {
      assert.doesNotMatch(line, /\p{Script=Han}/u, "heading " + (index + 1));
      continue;
    }

    assert.match(
      line,
      /<br\/>\*\*.+\*\*$/u,
      "README line " + (index + 1) + " must pair English with bold Chinese"
    );
    const translation = line.split("<br/>").at(-1);
    assert.equal(
      translation.slice(2, -2).includes("**"),
      false,
      "README line " + (index + 1) + " contains nested bold markup"
    );
  }
  assert.equal(insideCodeFence, false, "README has an unclosed code fence");
}

function readText(path) {
  return readFile(new URL(path, root), "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
