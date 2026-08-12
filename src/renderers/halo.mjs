import {
  compositionAttributes,
  compositionLanguages,
  renderCompositionEmpty,
  renderCompositionLegend,
  svgNumber
} from "./common.mjs";

export function renderHalo({ stats, config, languages, theme }) {
  if (languages.length === 0) {
    return renderCompositionEmpty(config, theme, "halo-part");
  }
  const parts = compositionLanguages(languages, stats.totalBytes, theme);
  const centerX = config.width / 2;
  const centerY = 190;
  const outerRadius = Math.min(105, (config.width - 84) / 2);
  const innerRadius = outerRadius * 0.66;
  const lines = ['  <g data-role="halo-part">'];
  let start = -90;
  for (const part of parts) {
    const end = start + part.share * 3.6;
    lines.push(
      '    <path ' + compositionAttributes(part) + ' d="'
        + annularSector(centerX, centerY, innerRadius, outerRadius, start, end)
        + '" fill="' + part.color + '" stroke="' + theme.canvas
        + '" stroke-width="3"/>'
    );
    start = end;
  }
  lines.push(
    "  </g>",
    '  <text class="center-label" text-anchor="middle" x="' + centerX
      + '" y="185">'
      + (config.compactPanel ? languages.length : "LANGUAGE") + "</text>",
    '  <text class="center-value" text-anchor="middle" x="' + centerX
      + '" y="205">'
      + (config.compactPanel ? "LANGUAGES" : "100% COMPOSITION") + "</text>"
  );
  const legend = renderCompositionLegend({
    width: config.width,
    parts,
    theme,
    startY: centerY + outerRadius + 42
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}

function annularSector(centerX, centerY, innerRadius, outerRadius, start, end) {
  const safeEnd = Math.min(start + 359.999, end);
  const outerStart = point(centerX, centerY, outerRadius, start);
  const outerEnd = point(centerX, centerY, outerRadius, safeEnd);
  const innerEnd = point(centerX, centerY, innerRadius, safeEnd);
  const innerStart = point(centerX, centerY, innerRadius, start);
  const largeArc = safeEnd - start > 180 ? 1 : 0;
  return "M " + svgNumber(outerStart.x) + " " + svgNumber(outerStart.y)
    + " A " + svgNumber(outerRadius) + " " + svgNumber(outerRadius)
    + " 0 " + largeArc + " 1 " + svgNumber(outerEnd.x) + " "
    + svgNumber(outerEnd.y) + " L " + svgNumber(innerEnd.x) + " "
    + svgNumber(innerEnd.y) + " A " + svgNumber(innerRadius) + " "
    + svgNumber(innerRadius) + " 0 " + largeArc + " 0 "
    + svgNumber(innerStart.x) + " " + svgNumber(innerStart.y) + " Z";
}

function point(centerX, centerY, radius, angle) {
  const radians = angle * Math.PI / 180;
  return {
    x: centerX + Math.cos(radians) * radius,
    y: centerY + Math.sin(radians) * radius
  };
}
