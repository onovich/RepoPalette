import assert from "node:assert/strict";
import test from "node:test";

import { validateConfig } from "../src/config.mjs";

test("fills the documented defaults for a valid username", () => {
  assert.deepEqual(validateConfig({ username: "onovich" }), {
    username: "onovich",
    top: 6,
    includeArchived: false,
    excludeRepositories: [],
    excludeLanguages: [],
    title: "Most Used Languages",
    width: 400,
    style: "bars",
    theme: "light",
    showBranding: true,
    codingMode: "off",
    manualLanguages: []
  });
});

test("accepts opt-in coding groups and a removable brand watermark", () => {
  assert.deepEqual(validateConfig({
    username: "onovich",
    showBranding: false,
    codingMode: "split",
    manualLanguages: ["C#", "ShaderLab", "HLSL", "GLSL"]
  }), {
    username: "onovich",
    top: 6,
    includeArchived: false,
    excludeRepositories: [],
    excludeLanguages: [],
    title: "Most Used Languages",
    width: 400,
    style: "bars",
    theme: "light",
    showBranding: false,
    codingMode: "split",
    manualLanguages: ["C#", "ShaderLab", "HLSL", "GLSL"]
  });
});

test("accepts every documented style and theme", () => {
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
    assert.equal(validateConfig({ username: "onovich", style }).style, style);
  }

  for (const theme of [
    "light",
    "paper",
    "midnight",
    "aurora",
    "terminal",
    "neon"
  ]) {
    assert.equal(validateConfig({ username: "onovich", theme }).theme, theme);
  }
});

test("rejects malformed, out-of-range, and unknown configuration", () => {
  assert.throws(
    () => validateConfig({ username: "" }),
    /username must be a non-empty string/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", top: 13 }),
    /top must be an integer from 1 to 12/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", width: 200 }),
    /width must be an integer from 320 to 800/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", style: "donut" }),
    /style must be one of: bars, orbit, constellation, ribbon, bead-halo, matrix, halo, treemap, voronoi, prism/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", theme: "rainbow" }),
    /theme must be one of: light, paper, midnight, aurora, terminal, neon/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", excludeLanguages: ["C#", 42] }),
    /excludeLanguages must contain only non-empty strings/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", showBranding: "false" }),
    /showBranding must be a boolean/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", codingMode: "detect" }),
    /codingMode must be one of: off, split/
  );
  assert.throws(
    () => validateConfig({
      username: "onovich",
      codingMode: "off",
      manualLanguages: ["C#"]
    }),
    /manualLanguages requires codingMode split/
  );
  assert.throws(
    () => validateConfig({
      username: "onovich",
      codingMode: "split",
      manualLanguages: ["C#", "C#"]
    }),
    /manualLanguages must not contain duplicates/
  );
  assert.throws(
    () => validateConfig({ username: "onovich", typo: true }),
    /unknown configuration key: typo/
  );
});
