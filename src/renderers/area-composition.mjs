import {
  compositionAttributes,
  compositionLanguages,
  contrastColor,
  escapeXml,
  estimatedTextWidth,
  formatPercentage,
  renderCompositionEmpty,
  renderCompositionLegend,
  svgNumber
} from "./common.mjs";
import {
  polygonBounds,
  polygonCentroid
} from "./geometry/polygon.mjs";
import { prismPolygons } from "./geometry/prism.mjs";
import { treemapPolygons } from "./geometry/treemap.mjs";
import { voronoiPolygons } from "./geometry/voronoi.mjs";

export function renderTreemap(context) {
  return renderAreaComposition(context, "treemap");
}

export function renderVoronoi(context) {
  return renderAreaComposition(context, "voronoi");
}

export function renderPrism(context) {
  return renderAreaComposition(context, "prism");
}

function renderAreaComposition({ stats, config, languages, theme }, style) {
  const role = style + "-part";
  if (languages.length === 0) {
    return renderCompositionEmpty(config, theme, role);
  }
  const parts = compositionLanguages(languages, stats.totalBytes, theme);
  const x = 24;
  const y = 86;
  const width = config.width - 48;
  const height = Math.max(190, Math.min(235, width * 0.64));
  const polygons = style === "treemap"
    ? treemapPolygons(parts, x, y, width, height)
    : style === "prism"
      ? prismPolygons(parts, x, y, width, height)
      : voronoiPolygons(parts, x, y, width, height);
  const lines = ['  <g data-role="' + role + '">'];

  polygons.forEach((polygon, index) => {
    const part = parts[index];
    lines.push(
      '    <polygon ' + compositionAttributes(part)
        + ' data-shape-role="' + role + '" points="'
        + polygon.map(([pointX, pointY]) =>
          svgNumber(pointX) + "," + svgNumber(pointY)
        ).join(" ") + '" fill="' + part.color + '" stroke="'
        + theme.canvas + '" stroke-width="3" stroke-linejoin="round"/>'
    );
    const bounds = polygonBounds(polygon);
    const [labelX, labelY] = polygonCentroid(polygon);
    const labelColor = contrastColor(part.color);
    const hasDirectLabel = !part.isOther
      && bounds.width >= 72
      && bounds.height >= 50
      && estimatedTextWidth(part.name) <= bounds.width - 16;
    const rankY = style === "prism" && bounds.width < 28
      ? y + 18 + index % 6 * 22
      : hasDirectLabel ? labelY - 27 : labelY + 3;
    lines.push(
      '    <text class="part-rank" data-role="part-rank" data-rank="'
        + part.rank + '" text-anchor="middle" x="' + svgNumber(labelX)
        + '" y="' + svgNumber(rankY)
        + '" fill="' + labelColor + '">'
        + String(part.rank).padStart(2, "0") + "</text>"
    );
    if (hasDirectLabel) {
      lines.push(
        '    <text class="part-label" text-anchor="middle" x="'
          + svgNumber(labelX) + '" y="' + svgNumber(labelY - 2)
          + '" fill="' + labelColor + '">' + escapeXml(part.name) + "</text>",
        '    <text class="part-value" text-anchor="middle" x="'
          + svgNumber(labelX) + '" y="' + svgNumber(labelY + 18)
          + '" fill="' + labelColor + '">' + formatPercentage(part.share)
          + "</text>"
      );
    }
  });
  lines.push("  </g>");
  const legend = renderCompositionLegend({
    width: config.width,
    parts,
    theme,
    startY: y + height + 38,
    showRanks: true
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}
