import assert from "node:assert/strict";
import test from "node:test";

import { renderSvg } from "../src/render-svg.mjs";

const STYLES = ["bars", "orbit", "constellation"];
const THEMES = {
  light: "#ffffff",
  paper: "#fbf6ea",
  midnight: "#0d1117",
  aurora: "#07131e",
  terminal: "#06110a",
  neon: "#160d24"
};

test("renders a deterministic, escaped, dependency-free card", () => {
  const stats = fixtureStats({
    languages: [
      {
        name: 'C# <script>alert("x")</script>',
        bytes: 750,
        percentage: 75,
        color: "javascript:alert(1)"
      },
      {
        name: "Hidden language",
        bytes: 250,
        percentage: 25,
        color: "#3572A5"
      }
    ]
  });
  const config = fixtureConfig({
    title: 'Most <Used> & "Safe"',
    top: 1,
    style: "bars",
    theme: "midnight"
  });

  const first = renderSvg(stats, config);
  const second = renderSvg(stats, config);

  assert.equal(first, second);
  assert.match(first, /role="img"/);
  assert.match(first, /data-style="bars"/);
  assert.match(first, /data-theme="midnight"/);
  assert.match(first, /<title id="title">Most &lt;Used&gt; &amp; &quot;Safe&quot;<\/title>/);
  assert.match(first, /C# &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(first, /<script>/i);
  assert.doesNotMatch(first, /javascript:/i);
  assert.doesNotMatch(first, /Hidden language/);
  assert.doesNotMatch(first, /(?:href|src)=/i);
  assert.doesNotMatch(first, /(?:@import|url\s*\()/i);
});

test("renders an accessible empty state in every layout", () => {
  for (const style of STYLES) {
    const svg = renderSvg(fixtureStats({
      repositoryCount: 0,
      includedRepositoryCount: 0,
      totalBytes: 0,
      languages: []
    }), fixtureConfig({ style }));

    assert.match(svg, /No language data available\./);
    assert.match(svg, /0 included public repositories/);
    assert.match(svg, /<title id="title">Most Used Languages<\/title>/);
    assert.match(svg, new RegExp('data-style="' + style + '"'));
  }
});

test("uses the unrounded byte share for bar geometry", () => {
  const svg = renderSvg(fixtureStats({
    totalBytes: 3,
    languages: [{
      name: "C#",
      bytes: 1,
      percentage: 33.3,
      color: "#178600"
    }]
  }), fixtureConfig({ top: 1 }));

  assert.match(svg, />33\.3%<\/text>/);
  assert.match(svg, /data-role="bar-value"[^>]*data-share="33\.3333"/);
  assert.match(svg, /data-role="bar-value"[^>]*width="117\.33"/);
});

test("bars, orbit, and constellation use visibly distinct SVG structures", () => {
  const signatures = {
    bars: 'data-role="spectrum"',
    orbit: 'data-role="orbit-value"',
    constellation: 'data-role="constellation-node"'
  };
  const outputs = {};

  for (const style of STYLES) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ style }));
    outputs[style] = svg;
    assert.match(svg, new RegExp(signatures[style]));
    assert.match(svg, />TypeScript<\/text>/);
    assert.match(svg, />52\.0%<\/text>/);
    assert.match(svg, />Python<\/text>/);
    assert.match(svg, />28\.0%<\/text>/);
  }

  assert.notEqual(outputs.bars, outputs.orbit);
  assert.notEqual(outputs.bars, outputs.constellation);
  assert.notEqual(outputs.orbit, outputs.constellation);
});

test("every theme selects its own card palette", () => {
  for (const [theme, canvas] of Object.entries(THEMES)) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ theme }));
    assert.match(svg, new RegExp('data-theme="' + theme + '"'));
    assert.match(svg, new RegExp('class="card"[^>]*fill="' + canvas + '"'));
  }
});

test("renders all twelve configured languages at supported width extremes", () => {
  const languages = Array.from({ length: 12 }, (_, index) => ({
    name: "Language-" + String(index + 1).padStart(2, "0"),
    bytes: 12 - index,
    percentage: 12 - index,
    color: "#3178C6"
  }));
  const stats = fixtureStats({ totalBytes: 78, languages });

  for (const width of [320, 800]) {
    for (const style of STYLES) {
      const svg = renderSvg(stats, fixtureConfig({ width, style, top: 12 }));
      assert.match(svg, new RegExp('width="' + width + '"'));
      assert.match(svg, /Language-12/);
      assert.doesNotMatch(svg, /NaN|Infinity/);
    }
  }
});

function fixtureStats(overrides = {}) {
  return {
    repositoryCount: 4,
    includedRepositoryCount: 3,
    totalBytes: 100,
    languages: [
      { name: "TypeScript", bytes: 52, percentage: 52, color: "#3178C6" },
      { name: "Python", bytes: 28, percentage: 28, color: "#3572A5" },
      { name: "C#", bytes: 12, percentage: 12, color: "#178600" },
      { name: "ShaderLab", bytes: 8, percentage: 8, color: "#222C37" }
    ],
    ...overrides
  };
}

function fixtureConfig(overrides = {}) {
  return {
    title: "Most Used Languages",
    top: 6,
    width: 400,
    style: "bars",
    theme: "light",
    ...overrides
  };
}
