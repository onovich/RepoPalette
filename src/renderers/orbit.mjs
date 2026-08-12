import {
  bytePercentage,
  escapeXml,
  formatPercentage,
  safeColor,
  svgNumber,
  truncateLabel
} from "./common.mjs";

export function renderOrbit({ stats, config, languages, theme }) {
  if (languages.length === 0) {
    return renderEmptyOrbit(config, theme);
  }

  const centerX = config.width / 2;
  const outerRadius = Math.min(118, (config.width - 64) / 2);
  const innerRadius = 48;
  const centerY = 86 + outerRadius;
  const step = languages.length === 1
    ? 0
    : (outerRadius - innerRadius) / (languages.length - 1);
  const strokeWidth = Math.min(7, Math.max(4, step - 1.5));
  const lines = [
    '  <circle cx="' + centerX + '" cy="' + centerY + '" r="36" fill="'
      + theme.surface + '" stroke="' + theme.border + '"/>',
    '  <text class="metric" text-anchor="middle" x="' + centerX
      + '" y="' + (centerY + 2) + '">'
      + stats.includedRepositoryCount + "</text>",
    '  <text class="metric-label" text-anchor="middle" x="' + centerX
      + '" y="' + (centerY + 19) + '">PUBLIC REPOS</text>'
  ];

  languages.forEach((language, index) => {
    const radius = outerRadius - index * step;
    const share = bytePercentage(language, stats.totalBytes);
    const color = safeColor(language.color, theme.accent);
    const trackPath = arcPath(centerX, centerY, radius, 135, 270);
    const valuePath = arcPath(centerX, centerY, radius, 135, 270 * share / 100);
    lines.push(
      '  <path d="' + trackPath + '" fill="none" stroke="' + theme.track
        + '" stroke-width="' + svgNumber(strokeWidth)
        + '" stroke-linecap="round"/>',
      '  <path data-role="orbit-value" data-share="' + svgNumber(share, 4)
        + '" d="' + valuePath + '" fill="none" stroke="' + color
        + '" stroke-width="' + svgNumber(strokeWidth)
        + '" stroke-linecap="round"/>'
    );
  });

  const legendY = centerY + outerRadius + 30;
  const legend = renderLegend({ config, languages, theme, startY: legendY });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}

function renderLegend({ config, languages, theme, startY }) {
  const columnWidth = (config.width - 48) / 2;
  const rows = Math.ceil(languages.length / 2);
  const maxCharacters = Math.max(7, Math.floor((columnWidth - 58) / 6.5));
  const lines = [];

  languages.forEach((language, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 24 + column * columnWidth;
    const y = startY + row * 26;
    const color = safeColor(language.color, theme.accent);
    lines.push(
      '  <circle cx="' + (x + 4) + '" cy="' + (y - 4)
        + '" r="4" fill="' + color + '"/>',
      '  <text class="legend-label" x="' + (x + 16) + '" y="' + y + '">'
        + escapeXml(truncateLabel(language.name, maxCharacters)) + "</text>",
      '  <text class="legend-value" text-anchor="end" x="'
        + (x + columnWidth - 4) + '" y="' + y + '">'
        + formatPercentage(language.percentage) + "</text>"
    );
  });

  return { lines, height: startY + rows * 26 + 18 };
}

function renderEmptyOrbit(config, theme) {
  const centerX = config.width / 2;
  const centerY = 156;
  const lines = [];
  for (const radius of [38, 54, 70]) {
    lines.push(
      '  <path d="' + arcPath(centerX, centerY, radius, 135, 270)
        + '" fill="none" stroke="' + theme.track
        + '" stroke-width="5" stroke-linecap="round"/>'
    );
  }
  lines.push(
    '  <text class="empty" text-anchor="middle" x="' + centerX
      + '" y="' + (centerY + 5) + '">No language data available.</text>'
  );
  return { height: 250, lines };
}

function arcPath(centerX, centerY, radius, startAngle, sweepAngle) {
  const safeSweep = Math.max(0.001, Math.min(359.999, sweepAngle));
  const start = polarPoint(centerX, centerY, radius, startAngle);
  const end = polarPoint(centerX, centerY, radius, startAngle + safeSweep);
  const largeArc = safeSweep > 180 ? 1 : 0;
  return "M " + svgNumber(start.x) + " " + svgNumber(start.y)
    + " A " + svgNumber(radius) + " " + svgNumber(radius)
    + " 0 " + largeArc + " 1 "
    + svgNumber(end.x) + " " + svgNumber(end.y);
}

function polarPoint(centerX, centerY, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians)
  };
}
