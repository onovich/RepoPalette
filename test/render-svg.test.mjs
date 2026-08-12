import assert from "node:assert/strict";
import test from "node:test";

import { renderSvg } from "../src/render-svg.mjs";

const STYLES = [
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
];
const COMPOSITION_STYLES = [
  "ribbon",
  "bead-halo",
  "matrix",
  "halo",
  "treemap",
  "voronoi",
  "prism"
];
const THEMES = {
  light: "#ffffff",
  paper: "#fef7ef",
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

test("every layout uses a visibly distinct SVG structure", () => {
  const signatures = {
    bars: 'data-role="spectrum"',
    orbit: 'data-role="orbit-value"',
    constellation: 'data-role="constellation-node"',
    ribbon: 'data-role="ribbon-part"',
    "bead-halo": 'data-role="bead-halo-unit"',
    matrix: 'data-role="matrix-unit"',
    halo: 'data-role="halo-part"',
    treemap: 'data-role="treemap-part"',
    voronoi: 'data-role="voronoi-part"',
    prism: 'data-role="prism-part"'
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

  assert.equal(new Set(Object.values(outputs)).size, STYLES.length);
});

test("closed composition layouts add the omitted languages as Other", () => {
  const stats = fixtureStats({
    totalBytes: 100,
    languages: [
      { name: "TypeScript", bytes: 60, percentage: 60, color: "#3178C6" },
      { name: "Python", bytes: 25, percentage: 25, color: "#3572A5" },
      { name: "Shell", bytes: 15, percentage: 15, color: "#89E051" }
    ]
  });

  for (const style of COMPOSITION_STYLES) {
    const svg = renderSvg(stats, fixtureConfig({ style, top: 2 }));
    const shares = [...svg.matchAll(
      /data-role="composition-part"[^>]*data-share="([0-9.]+)"/g
    )].map((match) => Number(match[1]));

    assert.equal(shares.length, 3, style);
    assert.ok(Math.abs(shares.reduce((sum, value) => sum + value, 0) - 100) < 0.0001);
    assert.match(svg, /data-language="Other"[^>]*data-share="15"/);
    assert.match(svg, /class="legend-label"[^>]*>Other<\/text>/);
    assert.match(svg, /class="legend-value"[^>]*>15\.0%<\/text>/);
  }
});

test("unit composition layouts always render exactly two hundred equal units", () => {
  for (const [style, role] of [
    ["bead-halo", "bead-halo-unit"],
    ["matrix", "matrix-unit"]
  ]) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ style }));
    assert.equal(
      [...svg.matchAll(new RegExp('data-role="' + role + '"', "g"))].length,
      200,
      style
    );
    assert.match(svg, /data-unit-share="0\.5"/);
  }
});

test("unit composition layouts disclose their quantization in accessible text", () => {
  for (const [style, unit] of [
    ["bead-halo", "bead"],
    ["matrix", "cell"]
  ]) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ style }));
    assert.match(
      svg,
      new RegExp("1 " + unit + " = 0\\.5%; unit counts are quantized")
    );
    assert.match(svg, /the legend shows exact percentages/);
  }
});

test("area composition geometry preserves every visible share", () => {
  for (const style of ["treemap", "voronoi", "prism"]) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ style }));
    const polygons = [...svg.matchAll(
      new RegExp(
        'data-role="composition-part"[^>]*data-share="([0-9.]+)"[^>]*data-shape-role="'
          + style + '-part"[^>]*points="([^"]+)"',
        "g"
      )
    )];
    assert.equal(polygons.length, 4, style);
    const areas = polygons.map((match) => polygonArea(match[2]));
    const totalArea = areas.reduce((sum, value) => sum + value, 0);
    polygons.forEach((match, index) => {
      const expected = Number(match[1]);
      const actual = areas[index] / totalArea * 100;
      assert.ok(Math.abs(actual - expected) <= 0.05, style + " " + expected);
    });
  }
});

test("area composition cells visibly map by rank to the exact legend", () => {
  for (const style of ["treemap", "voronoi", "prism"]) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ style }));
    for (const [index, language] of fixtureStats().languages.entries()) {
      const rank = String(index + 1).padStart(2, "0");
      assert.match(
        svg,
        new RegExp(
          'data-role="part-rank" data-rank="' + (index + 1)
            + '"[^>]*>' + rank + "<\\/text>"
        ),
        style
      );
      assert.match(
        svg,
        new RegExp(
          'data-role="legend-rank" data-rank="' + (index + 1)
            + '"[^>]*>' + rank + "<\\/text>[\\s\\S]*?>"
            + language.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            + "<\\/text>"
        ),
        style
      );
    }
  }
});

test("paper ribbon keeps Other distinct from the adjacent language", () => {
  const svg = renderSvg(fixtureStats({
    totalBytes: 100,
    languages: [
      { name: "A", bytes: 30, percentage: 30, color: "#111111" },
      { name: "B", bytes: 25, percentage: 25, color: "#222222" },
      { name: "C", bytes: 20, percentage: 20, color: "#333333" },
      { name: "D", bytes: 10, percentage: 10, color: "#444444" },
      { name: "E", bytes: 8, percentage: 8, color: "#555555" },
      { name: "F", bytes: 7, percentage: 7, color: "#666666" }
    ]
  }), fixtureConfig({ style: "ribbon", theme: "paper", top: 5 }));
  const adjacent = /data-language="E"[^>]*fill="([^"]+)"[^>]*>[\s\S]*?data-language="Other"[^>]*fill="([^"]+)"/.exec(svg);

  assert.ok(adjacent);
  assert.notEqual(adjacent[1], adjacent[2]);
  assert.match(svg, /data-language="Other"[^>]*stroke="#fef7ef"/);
});

test("prism facets stay ordered and inside the chart at narrow shares", () => {
  const svg = renderSvg(fixtureStats({
    totalBytes: 1000,
    languages: [
      { name: "A", bytes: 760, percentage: 76, color: "#3178C6" },
      { name: "B", bytes: 100, percentage: 10, color: "#3572A5" },
      { name: "C", bytes: 60, percentage: 6, color: "#178600" },
      { name: "D", bytes: 40, percentage: 4, color: "#222C37" },
      { name: "E", bytes: 25, percentage: 2.5, color: "#89E051" },
      { name: "F", bytes: 15, percentage: 1.5, color: "#E34C26" }
    ]
  }), fixtureConfig({ style: "prism", width: 320 }));
  const polygons = compositionPolygons(svg, "prism");
  assert.equal(polygons.length, 6);
  for (const polygon of polygons) {
    assert.ok(polygon.points[0][0] < polygon.points[1][0]);
    assert.ok(polygon.points[3][0] < polygon.points[2][0]);
    assert.ok(polygon.points.every(([x, y]) =>
      x >= 24 && x <= 296 && y >= 86
    ));
  }
});

test("voronoi keeps tiny visible categories non-empty and within its area gate", () => {
  const bytes = [
    700_000, 200_000, 50_000, 20_000, 10_000, 8_000, 5_000,
    3_000, 2_000, 1_000, 500, 300, 200
  ];
  const svg = renderSvg(fixtureStats({
    totalBytes: 1_000_000,
    languages: bytes.map((value, index) => ({
      name: "Language-" + index,
      bytes: value,
      percentage: value / 10_000,
      color: "#3178C6"
    }))
  }), fixtureConfig({ style: "voronoi", top: 12 }));
  const polygons = compositionPolygons(svg, "voronoi");
  assert.equal(polygons.length, 13);
  const totalArea = polygons.reduce(
    (sum, polygon) => sum + polygonAreaFromPoints(polygon.points),
    0
  );
  for (const polygon of polygons) {
    const area = polygonAreaFromPoints(polygon.points);
    assert.ok(area > 0, polygon.share);
    const actualShare = area / totalArea * 100;
    assert.ok(Math.abs(actualShare - polygon.share) <= 0.05, polygon.share);
  }
});

test("every theme selects its own card palette", () => {
  for (const [theme, canvas] of Object.entries(THEMES)) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ theme }));
    assert.match(svg, new RegExp('data-theme="' + theme + '"'));
    assert.match(svg, new RegExp('class="card"[^>]*fill="' + canvas + '"'));
  }
});

test("paper uses the reference-derived categorical palette", () => {
  const svg = renderSvg(fixtureStats(), fixtureConfig({ theme: "paper" }));
  assert.match(svg, /data-role="bar-value"[^>]*fill="#024b81"/);
  assert.match(svg, /data-role="bar-value"[^>]*fill="#367db7"/);
  assert.doesNotMatch(svg, /data-role="bar-value"[^>]*fill="#3178C6"/);
});

test("rendered SVG never repeats an attribute on the same element", () => {
  for (const style of STYLES) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({ style }));
    for (const tag of svg.match(/<[^/!][^>]*>/g) ?? []) {
      const names = [...tag.matchAll(/\s([A-Za-z_:][\w:.-]*)=/g)]
        .map((match) => match[1]);
      assert.equal(new Set(names).size, names.length, style + ": " + tag);
    }
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

test("keeps real long language names visible in narrow visual legends", () => {
  const languages = [
    { name: "DIGITAL Command Language", bytes: 60, percentage: 60, color: "#012456" },
    { name: "Jupyter Notebook", bytes: 40, percentage: 40, color: "#DA5B0B" }
  ];
  const stats = fixtureStats({ totalBytes: 100, languages });

  for (const style of ["orbit", "constellation", ...COMPOSITION_STYLES]) {
    const svg = renderSvg(stats, fixtureConfig({ width: 320, style }));
    assert.match(svg, /data-role="legend" data-columns="1"/);
    assert.match(
      svg,
      /class="legend-label"[^>]*>DIGITAL Command Language<\/text>/
    );
    assert.match(svg, /class="legend-label"[^>]*>Jupyter Notebook<\/text>/);
  }
});

test("area layouts omit direct labels that do not fit their cells", () => {
  const stats = fixtureStats({
    totalBytes: 100,
    languages: [
      {
        name: "Jupyter Notebook",
        bytes: 48,
        percentage: 48,
        color: "#DA5B0B"
      },
      {
        name: "Digital Command Language",
        bytes: 32,
        percentage: 32,
        color: "#555555"
      },
      {
        name: "Visual Basic .NET",
        bytes: 20,
        percentage: 20,
        color: "#945DB7"
      }
    ]
  });

  for (const style of ["treemap", "voronoi", "prism"]) {
    const svg = renderSvg(stats, fixtureConfig({ width: 320, style }));
    assert.doesNotMatch(
      svg,
      /class="part-label"[^>]*>Digital Command Language<\/text>/,
      style
    );
    assert.match(
      svg,
      /class="legend-label"[^>]*>Digital Command Language<\/text>/,
      style
    );
  }
});

test("does not split an emoji when a visible label is shortened", () => {
  const svg = renderSvg(fixtureStats({
    languages: [{
      name: "AAAAAAAAAAAAAAAAAAAAAA😀 language",
      bytes: 100,
      percentage: 100,
      color: "#3178C6"
    }]
  }), fixtureConfig({ width: 320, top: 1 }));

  assert.match(svg, /AAAAAAAAAAAAAAAAAAAAAA😀…/);
  assert.doesNotMatch(svg, /\uFFFD/);
  assert.equal(hasLoneSurrogate(svg), false);
});

test("keeps small constellation shares distinguishable by node area", () => {
  const svg = renderSvg(fixtureStats({
    totalBytes: 100,
    languages: [
      { name: "Large", bytes: 97, percentage: 97, color: "#3178C6" },
      { name: "Small", bytes: 2, percentage: 2, color: "#3572A5" },
      { name: "Smaller", bytes: 1, percentage: 1, color: "#178600" }
    ]
  }), fixtureConfig({ style: "constellation" }));
  const radii = [...svg.matchAll(
    /data-role="constellation-node"[^>]*data-share="[^"]+"[^>]*r="([0-9.]+)"/g
  )].map((match) => Number(match[1]));

  assert.equal(radii.length, 3);
  assert.ok(radii[0] > radii[1]);
  assert.ok(radii[1] > radii[2]);
  assert.ok(radii[2] >= 8);
});

test("chooses readable node text for bright GitHub language colors", () => {
  const svg = renderSvg(fixtureStats({
    languages: [{
      name: "Go",
      bytes: 100,
      percentage: 100,
      color: "#00ADD8"
    }]
  }), fixtureConfig({ style: "constellation", top: 1 }));

  assert.match(svg, /class="node-label"[^>]*fill="#111318"[^>]*>Go<\/text>/);
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

function hasLoneSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next < 0xdc00 || next > 0xdfff) {
        return true;
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

function polygonArea(pointsText) {
  const points = pointsText.split(/\s+/).map((pair) => pair.split(",").map(Number));
  return polygonAreaFromPoints(points);
}

function polygonAreaFromPoints(points) {
  let area = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    area += point[0] * next[1] - next[0] * point[1];
  });
  return Math.abs(area) / 2;
}

function compositionPolygons(svg, style) {
  return [...svg.matchAll(
    new RegExp(
      'data-role="composition-part"[^>]*data-share="([0-9.]+)"[^>]*data-shape-role="'
        + style + '-part"[^>]*points="([^"]*)"',
      "g"
    )
  )].map((match) => ({
    share: Number(match[1]),
    points: match[2] === ""
      ? []
      : match[2].split(/\s+/).map((pair) => pair.split(",").map(Number))
  }));
}
