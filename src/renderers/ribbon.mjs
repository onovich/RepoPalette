import {
  compositionAttributes,
  compositionLanguages,
  contrastColor,
  escapeXml,
  estimatedTextWidth,
  formatPercentageMarkup,
  renderCompositionEmpty,
  renderCompositionLegend,
  svgNumber
} from "./common.mjs";

export function renderRibbon({ stats, config, languages, theme }) {
  if (languages.length === 0) {
    return renderCompositionEmpty(config, theme, "ribbon-part");
  }
  const parts = compositionLanguages(languages, stats.totalBytes, theme);
  const x = 24;
  const y = config.compactPanel ? 82 : 100;
  const width = config.width - 48;
  const height = 78;
  const lines = [];
  if (!config.compactPanel) {
    lines.push(
      '  <text class="axis-note" x="24" y="88">0%</text>',
      '  <text class="axis-note" text-anchor="middle" x="'
        + config.width / 2 + '" y="88">COMPOSITION</text>',
      '  <text class="axis-note" text-anchor="end" x="'
        + (config.width - 24) + '" y="88">100%</text>'
    );
  }
  lines.push('  <g data-role="ribbon-part">');
  let cursor = x;
  for (const part of parts) {
    const partWidth = width * part.share / 100;
    lines.push(
      '    <rect ' + compositionAttributes(part) + ' x="'
        + svgNumber(cursor) + '" y="' + y + '" width="'
        + svgNumber(partWidth) + '" height="' + height + '" fill="'
        + part.color + '" stroke="' + theme.canvas
        + '" stroke-width="2"/>'
    );
    if (!part.isOther
        && partWidth >= 62
        && estimatedTextWidth(part.name) <= partWidth - 20) {
      const textColor = contrastColor(part.color);
      lines.push(
        '    <text class="part-label" x="' + svgNumber(cursor + 10)
          + '" y="' + (y + 30) + '" fill="' + textColor + '">'
          + escapeXml(part.name) + "</text>",
        '    <text class="part-value" x="' + svgNumber(cursor + 10)
          + '" y="' + (y + 51) + '" fill="' + textColor + '">'
          + formatPercentageMarkup(part.share) + "</text>"
      );
    }
    cursor += partWidth;
  }
  lines.push("  </g>");
  const legend = renderCompositionLegend({
    width: config.width,
    parts,
    theme,
    startY: config.compactPanel ? 194 : 212
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}
