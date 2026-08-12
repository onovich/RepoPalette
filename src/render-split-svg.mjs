import { getTheme } from "./presentation.mjs";
import {
  compositionLanguages,
  escapeXml,
  formatPercentage,
  svgNumber,
  truncateLabel
} from "./renderers/common.mjs";
import { getStyleDefinition } from "./renderers/index.mjs";
import { renderStyleLines } from "./render-svg.mjs";

const CONTENT_OFFSET_Y = 45;

export function renderSplitSvg(groups, configInput) {
  const config = {
    title: "Most Used Languages",
    top: 6,
    width: 400,
    style: "bars",
    theme: "light",
    showBranding: true,
    manualTitle: "Manual Coding",
    vibeTitle: "Vibe Coding",
    ...configInput
  };
  const style = getStyleDefinition(config.style);
  if (!style) {
    throw new TypeError("unknown style: " + config.style);
  }
  const theme = getTheme(config.theme);
  const width = Math.max(640, Math.min(800, config.width * 2));
  const panelWidth = width / 2;
  const panelConfig = {
    ...config,
    width: panelWidth,
    compactPanel: true,
    showBranding: false
  };
  const manualLayout = renderGroupLayout(groups.manual, panelConfig, style, theme);
  const vibeLayout = renderGroupLayout(groups.vibe, panelConfig, style, theme);
  const height = Math.max(manualLayout.height, vibeLayout.height)
    + CONTENT_OFFSET_Y;
  const repositoryCount = Number.isInteger(groups.manual.repositoryCount)
    ? groups.manual.repositoryCount
    : groups.manual.includedRepositoryCount;
  const manualShare = groups.manual.classification.percentageOfTotal;
  const vibeShare = groups.vibe.classification.percentageOfTotal;
  const manualColor = theme.accent;
  const vibeColor = theme.series?.[0] ?? theme.ink;
  const lines = [
    '<svg xmlns="http://www.w3.org/2000/svg"'
      + ' role="img" aria-labelledby="title description"'
      + ' data-style="' + escapeXml(config.style) + '"'
      + ' data-theme="' + escapeXml(config.theme) + '"'
      + ' data-coding-mode="split"'
      + ' width="' + width + '" height="' + height + '"'
      + ' viewBox="0 0 ' + width + " " + height + '">',
    '  <title id="title">' + escapeXml(config.title) + "</title>",
    '  <desc id="description">'
      + buildDescription(groups, config, style, theme) + "</desc>",
    ...renderStyleLines(theme),
    ...splitStyleLines(theme),
    '  <rect class="card" x="0.5" y="0.5" width="'
      + (width - 1) + '" height="' + (height - 1)
      + '" rx="14" fill="' + theme.canvas + '" stroke="'
      + theme.border + '"/>',
    '  <rect x="24" y="20" width="4" height="35" rx="2" fill="'
      + theme.accent + '"/>',
    '  <text class="title" x="38" y="35">'
      + escapeXml(truncateLabel(config.title, Math.floor((width - 180) / 9)))
      + "</text>",
    '  <text class="meta" x="38" y="55">'
      + groups.manual.includedRepositoryCount + " OF " + repositoryCount
      + " PUBLIC REPOS · USER-DECLARED GROUPS</text>",
    ...brandingLines(config, theme, width),
    ...groupHeaderLines({
      x: 24,
      width: panelWidth - 48,
      title: config.manualTitle,
      share: manualShare,
      color: manualColor
    }),
    ...groupHeaderLines({
      x: panelWidth + 24,
      width: panelWidth - 48,
      title: config.vibeTitle,
      share: vibeShare,
      color: vibeColor
    }),
    ...overviewLines({
      x: 24,
      y: 96,
      width: width - 48,
      height: 10,
      manualShare,
      vibeShare,
      manualColor,
      vibeColor,
      theme
    }),
    '  <line x1="' + panelWidth + '" y1="120" x2="' + panelWidth
      + '" y2="' + (height - 24) + '" stroke="' + theme.border
      + '" stroke-width="1" opacity="0.72"/>',
    '  <g data-role="coding-group" data-group="manual" transform="translate(0 '
      + CONTENT_OFFSET_Y + ')">',
    ...manualLayout.lines,
    "  </g>",
    '  <g data-role="coding-group" data-group="vibe" transform="translate('
      + panelWidth + " " + CONTENT_OFFSET_Y + ')">',
    ...vibeLayout.lines,
    "  </g>",
    "</svg>",
    ""
  ];
  return lines.join("\n");
}

function renderGroupLayout(stats, config, style, theme) {
  const languages = stats.languages.slice(0, config.top);
  return style.render({ stats, config, languages, theme });
}

function splitStyleLines(theme) {
  return [
    "  <style>",
    "    .group-title { fill: " + theme.ink
      + "; font-size: 12px; font-weight: 700; }",
    "    .group-share { fill: " + theme.muted
      + "; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;"
      + " font-size: 9px; font-variant-numeric: tabular-nums;"
      + " letter-spacing: 0.4px; }",
    "  </style>"
  ];
}

function brandingLines(config, theme, width) {
  return config.showBranding
    ? [
        '  <text class="brand-watermark" data-role="brand-watermark"'
          + ' text-anchor="end" x="' + (width - 24) + '" y="29"'
          + ' aria-hidden="true">RepoPalette</text>'
      ]
    : [];
}

function groupHeaderLines({ x, width, title, share, color }) {
  const titleCharacters = Math.max(12, Math.floor((width - 72) / 7));
  return [
    '  <circle cx="' + (x + 2) + '" cy="80" r="3" fill="' + color + '"/>',
    '  <text class="group-title" x="' + (x + 12) + '" y="84">'
      + escapeXml(truncateLabel(title, titleCharacters)) + "</text>",
    '  <text class="group-share" text-anchor="end" x="' + (x + width)
      + '" y="84">' + formatPercentage(share) + " OF BYTES</text>"
  ];
}

function overviewLines({
  x,
  y,
  width,
  height,
  manualShare,
  vibeShare,
  manualColor,
  vibeColor,
  theme
}) {
  const manualWidth = width * manualShare / 100;
  const vibeWidth = width * vibeShare / 100;
  const splitX = x + manualWidth;
  const lines = [
    '  <rect x="' + x + '" y="' + y + '" width="' + width
      + '" height="' + height + '" rx="5" fill="' + theme.track + '"/>',
    '  <g data-role="coding-overview-part" data-group="manual" data-share="'
      + svgNumber(manualShare, 4) + '">',
    '    <rect x="' + x + '" y="' + y + '" width="'
      + svgNumber(manualWidth) + '" height="' + height + '" rx="5" fill="'
      + manualColor + '"/>',
    "  </g>",
    '  <g data-role="coding-overview-part" data-group="vibe" data-share="'
      + svgNumber(vibeShare, 4) + '">',
    '    <rect x="' + svgNumber(splitX) + '" y="' + y + '" width="'
      + svgNumber(vibeWidth) + '" height="' + height + '" rx="5" fill="'
      + vibeColor + '"/>',
    "  </g>"
  ];
  if (manualShare > 0 && vibeShare > 0) {
    lines.push(
      '  <line x1="' + svgNumber(splitX) + '" y1="' + (y - 1)
        + '" x2="' + svgNumber(splitX) + '" y2="' + (y + height + 1)
        + '" stroke="' + theme.canvas + '" stroke-width="2"/>'
    );
  }
  return lines;
}

function buildDescription(groups, config, style, theme) {
  const repositoryCount = Number.isInteger(groups.manual.repositoryCount)
    ? groups.manual.repositoryCount
    : groups.manual.includedRepositoryCount;
  const manual = describeGroup(
    config.manualTitle,
    groups.manual,
    config.top,
    style,
    theme
  );
  const vibe = describeGroup(
    config.vibeTitle,
    groups.vibe,
    config.top,
    style,
    theme
  );
  const quantization = style.quantizedUnit
    ? " Values are shown with exact percentages; visual "
      + style.quantizedUnit + " counts are quantized."
    : "";
  return escapeXml(
    "User-declared coding groups across "
      + groups.manual.includedRepositoryCount + " of " + repositoryCount
      + " public repositories. " + manual + " " + vibe + quantization
  );
}

function describeGroup(title, stats, top, style, theme) {
  const languages = stats.languages.slice(0, top);
  const described = style.composition
    ? compositionLanguages(languages, stats.totalBytes, theme)
    : languages;
  const breakdown = described.length === 0
    ? "no language data"
    : described.map((language) => language.name + ": "
      + formatPercentage(language.share ?? language.percentage)).join("; ");
  return title + " is "
    + formatPercentage(stats.classification.percentageOfTotal)
    + " of all language bytes; within this group: " + breakdown + ".";
}
