import assert from "node:assert/strict";
import test from "node:test";

import { splitCodingStats } from "../src/classification.mjs";
import { renderSplitSvg } from "../src/render-split-svg.mjs";
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

test("shows subtle RepoPalette branding without printing the layout name", () => {
  const svg = renderSvg(
    fixtureStats(),
    fixtureConfig({ style: "ribbon" })
  );

  assert.match(
    svg,
    /data-role="brand-watermark"[^>]*>RepoPalette<\/text>/
  );
  assert.doesNotMatch(svg, />RIBBON<\/text>/);
});

test("allows the RepoPalette watermark to be disabled", () => {
  const svg = renderSvg(
    fixtureStats(),
    fixtureConfig({ showBranding: false })
  );

  assert.doesNotMatch(svg, /data-role="brand-watermark"/);
  assert.doesNotMatch(svg, />RepoPalette<\/text>/);
});

test("renders every layout as one combined coding-approach card", () => {
  const groups = splitCodingStats(fixtureStats(), ["C#", "ShaderLab"]);
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

  for (const style of STYLES) {
    const svg = renderSplitSvg(groups, fixtureConfig({
      style,
      theme: "paper",
      showBranding: true,
      manualTitle: "Handwritten",
      vibeTitle: "AI-assisted"
    }));
    const manualStart = svg.indexOf(
      'data-role="coding-group" data-group="manual"'
    );
    const vibeStart = svg.indexOf(
      'data-role="coding-group" data-group="vibe"'
    );
    const manualSection = svg.slice(manualStart, vibeStart);
    const vibeSection = svg.slice(vibeStart);

    assert.match(svg, /data-coding-mode="split"/, style);
    assert.match(svg, /width="800"/, style);
    assert.match(svg, />Handwritten<\/text>/, style);
    assert.match(svg, />AI-assisted<\/text>/, style);
    assert.match(manualSection, new RegExp(signatures[style]), style);
    assert.match(vibeSection, new RegExp(signatures[style]), style);
    assert.equal(svg.match(/>RepoPalette<\/text>/g)?.length, 1, style);
    assert.equal(svg.match(/3 OF 4 PUBLIC REPOS/g)?.length, 1, style);
    assert.equal(svg.match(/PUBLIC REPOS/g)?.length, 1, style);
    assert.doesNotMatch(svg, /data-coding-group=/, style);
    assert.doesNotMatch(svg, />100% COMPOSITION<\/text>/, style);
    assert.match(manualSection, />C#<\/text>/, style);
    assert.match(manualSection, />ShaderLab<\/text>/, style);
    assert.match(vibeSection, />TypeScript<\/text>/, style);
    assert.match(vibeSection, />Python<\/text>/, style);
    assert.doesNotMatch(svg, /NaN|Infinity/, style);
  }
});

test("the combined overview and group legends retain both percentage bases", () => {
  const groups = splitCodingStats(fixtureStats(), ["C#", "ShaderLab"]);
  const svg = renderSplitSvg(groups, fixtureConfig({
    style: "ribbon",
    theme: "paper",
    manualTitle: "Manual Coding",
    vibeTitle: "Vibe Coding"
  }));

  assert.match(
    svg,
    /data-role="coding-overview-part" data-group="manual" data-share="20"/
  );
  assert.match(
    svg,
    /data-role="coding-overview-part" data-group="vibe" data-share="80"/
  );
  assert.match(svg, />60\.0%<\/text>/);
  assert.match(svg, />40\.0%<\/text>/);
  assert.match(svg, />65\.0%<\/text>/);
  assert.match(svg, />35\.0%<\/text>/);
  assert.equal(svg.match(/>COMPOSITION<\/text>/g)?.length ?? 0, 0);

  const unbranded = renderSplitSvg(groups, fixtureConfig({
    style: "ribbon",
    theme: "paper",
    showBranding: false
  }));
  assert.doesNotMatch(unbranded, /data-role="brand-watermark"/);
  assert.doesNotMatch(unbranded, />RepoPalette<\/text>/);
});

test("paper split groups use matching warm and cool semantic palettes", () => {
  const groups = splitCodingStats(fixtureStats(), ["C#", "ShaderLab"]);
  const svg = renderSplitSvg(groups, fixtureConfig({
    style: "ribbon",
    theme: "paper"
  }));
  const manualSection = codingGroupSection(svg, "manual");
  const vibeSection = codingGroupSection(svg, "vibe");

  assert.match(
    svg,
    /data-role="coding-overview-part" data-group="manual"[^>]*>[\s\S]*?<rect[^>]*fill="#fd7136"/
  );
  assert.match(
    svg,
    /data-role="coding-overview-part" data-group="vibe"[^>]*>[\s\S]*?<rect[^>]*fill="#024b81"/
  );
  assert.match(
    manualSection,
    /data-language="C#"[^>]*fill="#fd7136"/
  );
  assert.match(
    manualSection,
    /data-language="ShaderLab"[^>]*fill="#f9915a"/
  );
  assert.match(
    vibeSection,
    /data-language="TypeScript"[^>]*fill="#024b81"/
  );
  assert.match(
    vibeSection,
    /data-language="Python"[^>]*fill="#27669f"/
  );
  assert.doesNotMatch(manualSection, /fill="#(?:024b81|27669f)"/);
  assert.doesNotMatch(vibeSection, /fill="#(?:fd7136|f9915a)"/);
});

test("every theme preserves the warm Manual and cool Vibe color language", () => {
  const groups = splitCodingStats(fixtureStats(), ["C#", "ShaderLab"]);
  const primaries = {
    light: ["#d85f32", "#075fc7"],
    paper: ["#fd7136", "#024b81"],
    midnight: ["#ff7a59", "#58a6ff"],
    aurora: ["#ff986b", "#63e6be"],
    terminal: ["#f4c95d", "#45e37d"],
    neon: ["#ff5fd2", "#55d6ff"]
  };

  for (const [theme, [manualPrimary, vibePrimary]] of Object.entries(
    primaries
  )) {
    const svg = renderSplitSvg(groups, fixtureConfig({
      style: "ribbon",
      theme
    }));
    const manualSection = codingGroupSection(svg, "manual");
    const vibeSection = codingGroupSection(svg, "vibe");

    assert.equal(overviewColor(svg, "manual"), manualPrimary, theme);
    assert.equal(overviewColor(svg, "vibe"), vibePrimary, theme);
    assert.equal(compositionColors(manualSection)[0], manualPrimary, theme);
    assert.equal(compositionColors(vibeSection)[0], vibePrimary, theme);
    assert.deepEqual(
      compositionColors(manualSection).filter((color) =>
        compositionColors(vibeSection).includes(color)
      ),
      [],
      theme
    );
  }
});

test("every split layout applies the semantic group primaries", () => {
  const groups = splitCodingStats(fixtureStats(), ["C#", "ShaderLab"]);

  for (const style of STYLES) {
    const svg = renderSplitSvg(groups, fixtureConfig({
      style,
      theme: "paper"
    }));
    assert.match(
      codingGroupSection(svg, "manual"),
      /(?:fill|stroke)="#fd7136"/,
      style
    );
    assert.match(
      codingGroupSection(svg, "vibe"),
      /(?:fill|stroke)="#024b81"/,
      style
    );
  }
});

test("orbit and constellation legends repeat their group series colors", () => {
  const groups = splitCodingStats(fixtureStats(), ["C#", "ShaderLab"]);

  for (const theme of Object.keys(THEMES)) {
    for (const style of ["orbit", "constellation"]) {
      const svg = renderSplitSvg(groups, fixtureConfig({ style, theme }));
      for (const group of ["manual", "vibe"]) {
        const section = codingGroupSection(svg, group);
        assert.deepEqual(
          legendColors(section),
          plottedSeriesColors(section, style),
          theme + " " + style + " " + group
        );
      }
    }
  }
});

test("semantic legend mapping leaves unclassified cards unchanged", () => {
  for (const style of ["orbit", "constellation"]) {
    const svg = renderSvg(fixtureStats(), fixtureConfig({
      style,
      theme: "paper"
    }));
    assert.deepEqual(
      legendColors(svg),
      fixtureStats().languages.map((language) => language.color),
      style
    );
  }
});

test("Other stays inside its owning semantic palette at the top boundary", () => {
  const groups = equalCodingGroupsFixture();
  const expectedOther = {
    light: ["#fbe8df", "#dce9f7"],
    paper: ["#feeee6", "#dce9f1"],
    midnight: ["#59352f", "#294764"],
    aurora: ["#5a3a32", "#275e63"],
    terminal: ["#59471f", "#285c3a"],
    neon: ["#63304f", "#3d4d78"]
  };

  for (const [theme, [manualOther, vibeOther]] of Object.entries(
    expectedOther
  )) {
    const svg = renderSplitSvg(groups, fixtureConfig({
      style: "ribbon",
      theme,
      top: 5
    }));
    assert.equal(
      compositionColor(codingGroupSection(svg, "manual"), "Other"),
      manualOther,
      theme + " Manual Other"
    );
    assert.equal(
      compositionColor(codingGroupSection(svg, "vibe"), "Other"),
      vibeOther,
      theme + " Vibe Other"
    );
  }
});

test("semantic constellation labels retain small-text contrast", () => {
  const groups = equalCodingGroupsFixture();

  for (const theme of Object.keys(THEMES)) {
    const svg = renderSplitSvg(groups, fixtureConfig({
      style: "constellation",
      theme,
      top: 6
    }));
    for (const group of ["manual", "vibe"]) {
      const section = codingGroupSection(svg, group);
      const background = constellationSurface(section);
      const pairs = constellationLabelPairs(section);
      assert.equal(pairs.length, 6, theme + " " + group);
      for (const { fill, opacity, text } of pairs) {
        const displayedFill = blendHex(fill, background, opacity);
        assert.ok(
          contrastRatio(displayedFill, text) >= 4.5,
          theme + " " + group + " " + fill + " behind " + text
        );
      }
    }
  }
});

test("combined layouts keep an empty declared group explicit and valid", () => {
  const groups = splitCodingStats(
    fixtureStats(),
    fixtureStats().languages.map(({ name }) => name)
  );

  for (const style of STYLES) {
    const svg = renderSplitSvg(groups, fixtureConfig({ style }));
    assert.match(svg, /data-group="manual" data-share="100"/, style);
    assert.match(svg, /data-group="vibe" data-share="0"/, style);
    assert.match(svg, /No language data available\./, style);
    assert.doesNotMatch(svg, /NaN|Infinity/, style);
  }
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

test("ribbon omits direct labels that do not fit their segments", () => {
  const svg = renderSvg(fixtureStats({
    totalBytes: 100,
    languages: [
      {
        name: "Digital Command Language",
        bytes: 23,
        percentage: 23,
        color: "#3178C6"
      },
      { name: "TypeScript", bytes: 77, percentage: 77, color: "#3572A5" }
    ]
  }), fixtureConfig({ style: "ribbon", width: 320, top: 2 }));

  assert.doesNotMatch(
    svg,
    /class="part-label"[^>]*>Digital Command Language<\/text>/
  );
  assert.match(
    svg,
    /class="legend-label"[^>]*>Digital Command Language<\/text>/
  );
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

test("area layouts externalize tiny rank markers without collisions", () => {
  const bytes = [
    500_000, 240_000, 130_000, 70_000, 30_000, 15_000,
    7_000, 4_000, 2_000, 1_000, 600, 400
  ];
  const stats = fixtureStats({
    totalBytes: 1_000_000,
    languages: bytes.map((value, index) => ({
      name: "Language-" + String(index + 1).padStart(2, "0"),
      bytes: value,
      percentage: value / 10_000,
      color: "#3178C6"
    }))
  });

  for (const style of ["treemap", "voronoi", "prism"]) {
    const svg = renderSvg(
      stats,
      fixtureConfig({ style, width: 320, top: 12 })
    );
    const callouts = [...svg.matchAll(
      /data-role="rank-callout" data-rank="(\d+)" data-lane="(top|bottom)" data-callout-x="([0-9.]+)"/g
    )].map((match) => ({
      rank: Number(match[1]),
      lane: match[2],
      x: Number(match[3])
    }));

    assert.ok(callouts.length >= 3, style);
    for (const lane of ["top", "bottom"]) {
      const positions = callouts
        .filter((callout) => callout.lane === lane)
        .map((callout) => callout.x)
        .sort((first, second) => first - second);
      for (let index = 1; index < positions.length; index += 1) {
        assert.ok(positions[index] - positions[index - 1] >= 15, style);
      }
    }
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

function equalCodingGroupsFixture() {
  const manualNames = Array.from({ length: 6 }, (_, index) =>
    "Manual " + (index + 1)
  );
  const vibeNames = Array.from({ length: 6 }, (_, index) =>
    "Vibe " + (index + 1)
  );
  const languages = [...manualNames, ...vibeNames].map((name) => ({
    name,
    bytes: 100,
    percentage: 100 / 12,
    color: "#808080"
  }));
  return splitCodingStats(fixtureStats({
    totalBytes: 1_200,
    languages
  }), manualNames);
}

function codingGroupSection(svg, group) {
  const start = svg.indexOf(
    'data-role="coding-group" data-group="' + group + '"'
  );
  const nextGroup = group === "manual"
    ? svg.indexOf('data-role="coding-group" data-group="vibe"', start)
    : svg.length;
  return svg.slice(start, nextGroup);
}

function overviewColor(svg, group) {
  return new RegExp(
    'data-role="coding-overview-part" data-group="' + group
      + '"[^>]*>[\\s\\S]*?<rect[^>]*fill="([^"]+)"'
  ).exec(svg)?.[1];
}

function compositionColors(section) {
  return [...section.matchAll(
    /data-role="composition-part"[^>]*fill="([^"]+)"/g
  )].map((match) => match[1]);
}

function compositionColor(section, language) {
  return new RegExp(
    'data-role="composition-part" data-language="' + language
      + '"[^>]*fill="([^"]+)"'
  ).exec(section)?.[1];
}

function legendColors(section) {
  const legend = /<g data-role="legend"[^>]*>([\s\S]*?)<\/g>/.exec(
    section
  )?.[1] ?? "";
  return [...legend.matchAll(/<circle[^>]*fill="([^"]+)"/g)]
    .map((match) => match[1]);
}

function plottedSeriesColors(section, style) {
  const pattern = style === "orbit"
    ? /data-role="orbit-value"[^>]*stroke="([^"]+)"/g
    : /data-role="constellation-node"[^>]*fill="([^"]+)"/g;
  return [...section.matchAll(pattern)].map((match) => match[1]);
}

function constellationSurface(section) {
  return /<rect x="24" y="78"[^>]*fill="([^"]+)"/.exec(section)?.[1];
}

function constellationLabelPairs(section) {
  return [...section.matchAll(
    /<circle data-role="constellation-node"[^>]*fill="([^"]+)" fill-opacity="([^"]+)"[^>]*\/>\s*<text class="node-label"[^>]*fill="([^"]+)"/g
  )].map((match) => ({
    fill: match[1],
    opacity: Number(match[2]),
    text: match[3]
  }));
}

function blendHex(foreground, background, opacity) {
  const channels = [1, 3, 5].map((offset) => Math.round(
    Number.parseInt(foreground.slice(offset, offset + 2), 16) * opacity
      + Number.parseInt(background.slice(offset, offset + 2), 16)
        * (1 - opacity)
  ));
  return "#" + channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");
}

function contrastRatio(first, second) {
  const lighter = Math.max(testLuminance(first), testLuminance(second));
  const darker = Math.min(testLuminance(first), testLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function testLuminance(color) {
  const channels = [1, 3, 5].map((offset) =>
    Number.parseInt(color.slice(offset, offset + 2), 16) / 255
  ).map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * channels[0]
    + 0.7152 * channels[1]
    + 0.0722 * channels[2];
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
