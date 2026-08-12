import { getTheme } from "./presentation.mjs";
import {
  renderPrism,
  renderTreemap,
  renderVoronoi
} from "./renderers/area-composition.mjs";
import { renderBars } from "./renderers/bars.mjs";
import {
  escapeXml,
  formatPercentage,
  truncateLabel
} from "./renderers/common.mjs";
import { renderConstellation } from "./renderers/constellation.mjs";
import { renderHalo } from "./renderers/halo.mjs";
import { renderOrbit } from "./renderers/orbit.mjs";
import { renderRibbon } from "./renderers/ribbon.mjs";
import {
  renderBeadHalo,
  renderMatrix
} from "./renderers/unit-composition.mjs";

const RENDERERS = Object.freeze({
  bars: renderBars,
  orbit: renderOrbit,
  constellation: renderConstellation,
  ribbon: renderRibbon,
  "bead-halo": renderBeadHalo,
  matrix: renderMatrix,
  halo: renderHalo,
  treemap: renderTreemap,
  voronoi: renderVoronoi,
  prism: renderPrism
});

export function renderSvg(stats, configInput) {
  const config = {
    title: "Most Used Languages",
    top: 6,
    width: 400,
    style: "bars",
    theme: "light",
    ...configInput
  };
  const renderer = RENDERERS[config.style];
  if (!renderer) {
    throw new TypeError("unknown style: " + config.style);
  }
  const theme = getTheme(config.theme);
  const languages = stats.languages.slice(0, config.top);
  const descriptionLanguages = config.style in COMPOSITION_RENDERERS
    ? compositionDescriptionLanguages(stats, languages)
    : languages;
  const layout = renderer({ stats, config, languages, theme });
  const lines = [
    '<svg xmlns="http://www.w3.org/2000/svg"'
      + ' role="img" aria-labelledby="title description"'
      + ' data-style="' + escapeXml(config.style) + '"'
      + ' data-theme="' + escapeXml(config.theme) + '"'
      + ' width="' + config.width + '" height="' + layout.height + '"'
      + ' viewBox="0 0 ' + config.width + " " + layout.height + '">',
    '  <title id="title">' + escapeXml(config.title) + "</title>",
    '  <desc id="description">'
      + buildDescription(stats, descriptionLanguages) + "</desc>",
    ...styleLines(theme),
    '  <rect class="card" x="0.5" y="0.5" width="'
      + (config.width - 1) + '" height="' + (layout.height - 1)
      + '" rx="14" fill="' + theme.canvas + '" stroke="'
      + theme.border + '"/>',
    ...headerLines(stats, config, theme),
    ...layout.lines,
    "</svg>",
    ""
  ];
  return lines.join("\n");
}

const COMPOSITION_RENDERERS = Object.freeze({
  ribbon: true,
  "bead-halo": true,
  matrix: true,
  halo: true,
  treemap: true,
  voronoi: true,
  prism: true
});

export { escapeXml };

function buildDescription(stats, languages) {
  const scope = "Language usage across " + stats.includedRepositoryCount
    + " included public repositories.";
  if (languages.length === 0) {
    return escapeXml(scope + " No language data available.");
  }
  const breakdown = languages
    .map((language) => language.name + ": "
      + formatPercentage(language.percentage))
    .join("; ");
  return escapeXml(scope + " " + breakdown + ".");
}

function styleLines(theme) {
  return [
    "  <style>",
    "    text { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }",
    "    .title { fill: " + theme.ink + "; font-size: 17px; font-weight: 700; letter-spacing: -0.2px; }",
    "    .meta, .style-tag, .rank, .metric-label { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }",
    "    .meta { fill: " + theme.muted + "; font-size: 9.5px; letter-spacing: 0.9px; }",
    "    .style-tag { fill: " + theme.accent + "; font-size: 9px; font-weight: 700; letter-spacing: 1px; }",
    "    .label { fill: " + theme.ink + "; font-size: 12px; font-weight: 650; }",
    "    .value { fill: " + theme.muted + "; font-size: 11px; font-variant-numeric: tabular-nums; }",
    "    .rank { fill: " + theme.accent + "; font-size: 9px; font-weight: 700; }",
    "    .metric { fill: " + theme.ink + "; font-size: 27px; font-weight: 750; font-variant-numeric: tabular-nums; }",
    "    .metric-label { fill: " + theme.muted + "; font-size: 7px; letter-spacing: 0.7px; }",
    "    .legend-label { fill: " + theme.ink + "; font-size: 10.5px; font-weight: 600; }",
    "    .legend-value { fill: " + theme.muted + "; font-size: 9.5px; font-variant-numeric: tabular-nums; }",
    "    .axis-note { fill: " + theme.muted + "; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 9.5px; letter-spacing: 0.6px; }",
    "    .part-label { font-size: 11px; font-weight: 700; }",
    "    .part-value { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 10px; font-variant-numeric: tabular-nums; }",
    "    .center-label { fill: " + theme.ink + "; font-size: 12px; font-weight: 700; }",
    "    .center-value { fill: " + theme.muted + "; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 9px; }",
    "    .node-label { font-size: 9px; font-weight: 750; }",
    "    .empty { fill: " + theme.muted + "; font-size: 11px; }",
    "  </style>"
  ];
}

function compositionDescriptionLanguages(stats, languages) {
  const visibleBytes = languages.reduce(
    (sum, language) => sum + Math.max(0, language.bytes),
    0
  );
  const otherBytes = Math.max(0, stats.totalBytes - visibleBytes);
  if (otherBytes === 0) {
    return languages;
  }
  return [...languages, {
    name: "Other",
    percentage: stats.totalBytes > 0 ? otherBytes / stats.totalBytes * 100 : 0
  }];
}

function headerLines(stats, config, theme) {
  const titleCharacters = Math.max(12, Math.floor((config.width - 128) / 9));
  const repositoryCount = Number.isInteger(stats.repositoryCount)
    ? stats.repositoryCount
    : stats.includedRepositoryCount;
  return [
    '  <rect x="24" y="20" width="4" height="35" rx="2" fill="'
      + theme.accent + '"/>',
    '  <text class="title" x="38" y="35">'
      + escapeXml(truncateLabel(config.title, titleCharacters)) + "</text>",
    '  <text class="meta" x="38" y="55">'
      + stats.includedRepositoryCount + " OF " + repositoryCount
      + " PUBLIC REPOS</text>",
    '  <text class="style-tag" text-anchor="end" x="'
      + (config.width - 24) + '" y="30">'
      + escapeXml(config.style.toUpperCase()) + "</text>"
  ];
}
