import {
  bytePercentage,
  escapeXml,
  formatPercentage,
  seriesColor,
  svgNumber,
  truncateLabel
} from "./common.mjs";

export function renderBars({ stats, config, languages, theme }) {
  if (languages.length === 0) {
    return { height: 152, lines: emptyState(config, theme) };
  }

  const chartWidth = config.width - 48;
  const height = 126 + languages.length * 42;
  const lines = [
    '  <g data-role="spectrum">',
    '    <rect x="24" y="78" width="' + chartWidth
      + '" height="12" rx="2" fill="' + theme.track + '"/>'
  ];

  let segmentX = 24;
  for (const [index, language] of languages.entries()) {
    const share = bytePercentage(language, stats.totalBytes);
    const segmentWidth = chartWidth * share / 100;
    lines.push(
      '    <rect data-share="' + svgNumber(share, 4)
        + '" x="' + svgNumber(segmentX) + '" y="78" width="'
        + svgNumber(segmentWidth) + '" height="12" fill="'
        + seriesColor(language, index, theme) + '"/>'
    );
    segmentX += segmentWidth;
  }
  lines.push("  </g>");

  const maxLabelCharacters = Math.max(10, Math.floor((config.width - 152) / 7));
  languages.forEach((language, index) => {
    const labelY = 124 + index * 42;
    const barY = labelY + 11;
    const share = bytePercentage(language, stats.totalBytes);
    const color = seriesColor(language, index, theme);
    const filledWidth = chartWidth * share / 100;
    const rank = String(index + 1).padStart(2, "0");

    lines.push(
      '  <text class="rank" x="24" y="' + labelY + '">' + rank + "</text>",
      '  <circle cx="53" cy="' + (labelY - 4)
        + '" r="4" fill="' + color + '"/>',
      '  <text class="label" x="65" y="' + labelY + '">'
        + escapeXml(truncateLabel(language.name, maxLabelCharacters)) + "</text>",
      '  <text class="value" text-anchor="end" x="'
        + (config.width - 24) + '" y="' + labelY + '">'
        + formatPercentage(language.percentage) + "</text>",
      '  <rect x="24" y="' + barY + '" width="' + chartWidth
        + '" height="7" rx="2" fill="' + theme.track + '"/>',
      '  <rect data-role="bar-value" data-share="' + svgNumber(share, 4)
        + '" x="24" y="' + barY + '" width="' + svgNumber(filledWidth)
        + '" height="7" rx="2" fill="' + color + '"/>'
    );
  });

  return { height, lines };
}

function emptyState(config, theme) {
  return [
    '  <rect x="24" y="78" width="' + (config.width - 48)
      + '" height="50" rx="8" fill="'
      + theme.surface + '"/>',
    '  <text class="empty" x="24" y="112">No language data available.</text>'
  ];
}
