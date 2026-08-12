import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  GALLERY_PREVIEWS,
  generateGallery
} from "../scripts/generate-gallery.mjs";

test("generates a deterministic preview for every style and theme", async (t) => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "repopalette-gallery-"));
  t.after(() => rm(outputDirectory, { recursive: true, force: true }));

  await generateGallery(outputDirectory);

  assert.equal(GALLERY_PREVIEWS.length, 6);
  assert.deepEqual(
    new Set(GALLERY_PREVIEWS.map(({ style }) => style)),
    new Set(["bars", "orbit", "constellation"])
  );
  assert.deepEqual(
    new Set(GALLERY_PREVIEWS.map(({ theme }) => theme)),
    new Set(["light", "paper", "midnight", "aurora", "terminal", "neon"])
  );

  for (const preview of GALLERY_PREVIEWS) {
    const svg = await readFile(
      join(outputDirectory, preview.fileName),
      "utf8"
    );
    assert.match(svg, new RegExp('data-style="' + preview.style + '"'));
    assert.match(svg, new RegExp('data-theme="' + preview.theme + '"'));
    assert.match(svg, />TypeScript<\/text>/);
    assert.match(svg, />42\.0%<\/text>/);
  }
});

test("keeps the checked-in gallery previews synchronized", async (t) => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "repopalette-gallery-sync-"));
  t.after(() => rm(outputDirectory, { recursive: true, force: true }));
  await generateGallery(outputDirectory);

  for (const preview of GALLERY_PREVIEWS) {
    const generated = await readFile(join(outputDirectory, preview.fileName), "utf8");
    const checkedIn = await readFile(
      new URL("../docs/gallery/" + preview.fileName, import.meta.url),
      "utf8"
    );
    assert.equal(checkedIn, generated, preview.fileName + " is stale");
  }
});
