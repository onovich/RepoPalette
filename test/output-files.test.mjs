import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { splitCodingStats } from "../src/classification.mjs";
import { writeValidatedOutputs } from "../src/output-files.mjs";
import { renderSplitSvg } from "../src/render-split-svg.mjs";
import { renderSvg } from "../src/render-svg.mjs";

test("invalid SVG or JSON never replaces the last successful outputs", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "toplang-output-"));
  const outputDirectory = join(workspace, "assets");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  await mkdir(outputDirectory);
  await writeFile(join(outputDirectory, "top-langs.svg"), "last good svg", "utf8");
  await writeFile(
    join(outputDirectory, "top-langs-data.json"),
    "last good json",
    "utf8"
  );

  const expected = expectedOutput();
  const validSvg = renderSvg(expected.stats, expected.config);
  const validJson = JSON.stringify(expected.audit, null, 2) + "\n";

  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svg: '<svg role="img" width="400" height="100" viewBox="0 0 400 100"><script></script></svg>\n',
      json: validJson,
      expectedAudit: expected.audit
    }),
    /forbidden SVG element/
  );
  await assertLastGood(outputDirectory);

  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svg: validSvg.replace("</svg>", "</g>"),
      json: validJson,
      expectedAudit: expected.audit
    }),
    /mismatched closing elements/
  );
  await assertLastGood(outputDirectory);

  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svg: validSvg.replace(
        /viewBox="0 0 400 ([0-9.]+)"/,
        'viewBox="0 0 399 $1"'
      ),
      json: validJson,
      expectedAudit: expected.audit
    }),
    /viewBox must match/
  );
  await assertLastGood(outputDirectory);

  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svg: validSvg.replace(
        "  <style>",
        '  <style>\n    @import "https://example.com/theme.css";'
      ),
      json: validJson,
      expectedAudit: expected.audit
    }),
    /forbidden external resource/
  );
  await assertLastGood(outputDirectory);

  const invalidAudit = structuredClone(expected.audit);
  invalidAudit.languages[0].percentage = 99;
  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svg: validSvg,
      json: JSON.stringify(invalidAudit, null, 2) + "\n",
      expectedAudit: expected.audit
    }),
    /percentage does not match its byte share/
  );
  await assertLastGood(outputDirectory);

  const invalidCounts = structuredClone(expected.audit);
  invalidCounts.repositoryCount = 0;
  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svg: validSvg,
      json: JSON.stringify(invalidCounts, null, 2) + "\n",
      expectedAudit: expected.audit
    }),
    /includedRepositoryCount exceeds repositoryCount/
  );
  await assertLastGood(outputDirectory);
});

test("allows URL-like text in a safely escaped title", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "toplang-title-"));
  const outputDirectory = join(workspace, "assets");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  const expected = expectedOutput();
  expected.config.title = "Docs at URL(example) or href=value";
  await writeValidatedOutputs({
    outputDirectory,
    svg: renderSvg(expected.stats, expected.config),
    json: JSON.stringify(expected.audit, null, 2) + "\n",
    expectedAudit: expected.audit
  });

  assert.match(
    await readFile(join(outputDirectory, "top-langs.svg"), "utf8"),
    /Docs at URL\(example\) or href=value/
  );
});

test("requires one complete, correctly labelled SVG for split mode", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "toplang-split-set-"));
  const outputDirectory = join(workspace, "assets");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  await mkdir(outputDirectory);
  await writeFile(
    join(outputDirectory, "top-langs.svg"),
    "last good combined chart",
    "utf8"
  );
  await writeFile(
    join(outputDirectory, "top-langs-manual.svg"),
    "legacy manual chart",
    "utf8"
  );
  await writeFile(
    join(outputDirectory, "top-langs-vibe.svg"),
    "legacy vibe chart",
    "utf8"
  );

  const expected = expectedOutput();
  expected.stats.totalBytes = 200;
  expected.stats.languages = [
    { name: "C#", bytes: 100, percentage: 50, color: "#178600" },
    { name: "TypeScript", bytes: 100, percentage: 50, color: "#3178C6" }
  ];
  expected.audit.totalBytes = expected.stats.totalBytes;
  expected.audit.languages = expected.stats.languages;
  const groups = splitCodingStats(expected.stats, ["C#"]);
  expected.audit.classification = groups.audit;
  const combinedSvg = renderSplitSvg(groups, expected.config);
  const json = JSON.stringify(expected.audit, null, 2) + "\n";

  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svgs: [{ filename: "top-langs-manual.svg", content: combinedSvg }],
      json,
      expectedAudit: expected.audit
    }),
    /split mode requires the single top-langs SVG output/
  );
  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svgs: [{
        filename: "top-langs.svg",
        content: combinedSvg.replace(
          'data-role="coding-group" data-group="vibe"',
          'data-role="coding-group" data-group="unknown"'
        )
      }],
      json,
      expectedAudit: expected.audit
    }),
    /one vibe coding group and overview segment/
  );
  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svgs: [{
        filename: "top-langs.svg",
        content: combinedSvg.replace(
          'data-group="manual" data-share="50"',
          'data-group="manual" data-share="49"'
        )
      }],
      json,
      expectedAudit: expected.audit
    }),
    /manual overview share does not match the audit/
  );
  assert.equal(
    await readFile(join(outputDirectory, "top-langs.svg"), "utf8"),
    "last good combined chart"
  );

  await writeValidatedOutputs({
    outputDirectory,
    svgs: [{ filename: "top-langs.svg", content: combinedSvg }],
    json,
    expectedAudit: expected.audit
  });
  await assert.rejects(
    readFile(join(outputDirectory, "top-langs-manual.svg"), "utf8"),
    /ENOENT/
  );
  await assert.rejects(
    readFile(join(outputDirectory, "top-langs-vibe.svg"), "utf8"),
    /ENOENT/
  );
});

test("accepts one full-width coding group and rejects inactive group markup", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "toplang-single-group-"));
  const outputDirectory = join(workspace, "assets");
  t.after(() => rm(workspace, { recursive: true, force: true }));

  const expected = expectedOutput();
  const groups = splitCodingStats(expected.stats, ["C#"]);
  expected.audit.classification = groups.audit;
  const combinedSvg = renderSplitSvg(groups, expected.config);
  const json = JSON.stringify(expected.audit, null, 2) + "\n";

  await writeValidatedOutputs({
    outputDirectory,
    svgs: [{ filename: "top-langs.svg", content: combinedSvg }],
    json,
    expectedAudit: expected.audit
  });
  assert.match(combinedSvg, /data-coding-layout="single-group"/);

  await assert.rejects(
    writeValidatedOutputs({
      outputDirectory,
      svgs: [{
        filename: "top-langs.svg",
        content: combinedSvg.replace(
          'data-role="coding-group" data-group="manual"',
          'data-role="coding-group" data-group="vibe"'
        )
      }],
      json,
      expectedAudit: expected.audit
    }),
    /single-group SVG must contain only the manual coding group/
  );
});

function expectedOutput() {
  const stats = {
    repositoryCount: 1,
    includedRepositoryCount: 1,
    totalBytes: 100,
    repositoryScope: {
      included: ["example"],
      excluded: []
    },
    languages: [{
      name: "C#",
      bytes: 100,
      percentage: 100,
      color: "#178600"
    }]
  };
  const config = {
    username: "onovich",
    title: "Most Used Languages",
    top: 6,
    width: 400,
    includeArchived: false,
    excludeRepositories: [],
    excludeLanguages: []
  };
  const audit = {
    schemaVersion: 3,
    username: config.username,
    repositoryCount: stats.repositoryCount,
    includedRepositoryCount: stats.includedRepositoryCount,
    totalBytes: stats.totalBytes,
    repositoryScope: stats.repositoryScope,
    languages: stats.languages,
    classification: {
      mode: "off",
      source: null,
      manualLanguages: [],
      groups: null
    },
    filters: {
      includeForks: false,
      includeArchived: false,
      excludedRepositories: [],
      excludedLanguages: []
    }
  };
  return { stats, config, audit };
}

async function assertLastGood(outputDirectory) {
  assert.equal(
    await readFile(join(outputDirectory, "top-langs.svg"), "utf8"),
    "last good svg"
  );
  assert.equal(
    await readFile(join(outputDirectory, "top-langs-data.json"), "utf8"),
    "last good json"
  );
}
