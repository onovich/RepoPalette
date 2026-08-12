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
import {
  polygonArea,
  polygonBounds,
  polygonCentroid
} from "./geometry/polygon.mjs";
import { prismPolygons } from "./geometry/prism.mjs";
import { treemapPolygons } from "./geometry/treemap.mjs";
import { voronoiPolygons } from "./geometry/voronoi.mjs";

const TREEMAP_LAYOUT = defineAreaLayout("treemap-part", treemapPolygons);
const VORONOI_LAYOUT = defineAreaLayout("voronoi-part", voronoiPolygons);
const PRISM_LAYOUT = defineAreaLayout("prism-part", prismPolygons);

export function renderTreemap(context) {
  return renderAreaComposition(context, TREEMAP_LAYOUT);
}

export function renderVoronoi(context) {
  return renderAreaComposition(context, VORONOI_LAYOUT);
}

export function renderPrism(context) {
  return renderAreaComposition(context, PRISM_LAYOUT);
}

function renderAreaComposition({ stats, config, languages, theme }, layout) {
  if (languages.length === 0) {
    return renderCompositionEmpty(config, theme, layout.role);
  }
  const parts = compositionLanguages(languages, stats.totalBytes, theme);
  const x = 24;
  const y = 86;
  const width = config.width - 48;
  const height = Math.max(190, Math.min(235, width * 0.64));
  const polygons = layout.geometry(parts, x, y, width, height);
  const cells = polygons.map((polygon, index) => describeCell(
    polygon,
    parts[index],
    index
  ));
  const callouts = layoutRankCallouts(cells, x, y, width, height);
  const calloutsByIndex = new Map(
    callouts.map((callout) => [callout.index, callout])
  );
  const lines = ['  <g data-role="' + layout.role + '">'];

  cells.forEach((cell) => {
    lines.push(
      '    <polygon ' + compositionAttributes(cell.part)
        + ' data-shape-role="' + layout.role + '" points="'
        + cell.polygon.map(([pointX, pointY]) =>
          svgNumber(pointX) + "," + svgNumber(pointY)
        ).join(" ") + '" fill="' + cell.part.color + '" stroke="'
        + theme.canvas + '" stroke-width="3" stroke-linejoin="round"/>'
    );
    const callout = calloutsByIndex.get(cell.index);
    if (!callout) {
      lines.push(renderRankText(
        cell,
        cell.hasDirectLabel ? cell.centerY - 27 : cell.centerY + 3
      ));
    }
    if (cell.hasDirectLabel) {
      lines.push(
        '    <text class="part-label" text-anchor="middle" x="'
          + svgNumber(cell.centerX) + '" y="' + svgNumber(cell.centerY - 2)
          + '" fill="' + cell.labelColor + '">'
          + escapeXml(cell.part.name) + "</text>",
        '    <text class="part-value" text-anchor="middle" x="'
          + svgNumber(cell.centerX) + '" y="' + svgNumber(cell.centerY + 18)
          + '" fill="' + cell.labelColor + '">'
          + formatPercentageMarkup(cell.part.share) + "</text>"
      );
    }
  });
  lines.push(...renderRankCallouts(callouts, theme));
  lines.push("  </g>");
  const legend = renderCompositionLegend({
    width: config.width,
    parts,
    theme,
    startY: y + height + 48,
    showRanks: true
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}

function describeCell(polygon, part, index) {
  const bounds = polygonBounds(polygon);
  const [centerX, centerY] = polygonCentroid(polygon);
  return {
    polygon,
    part,
    index,
    bounds,
    centerX,
    centerY,
    labelColor: contrastColor(part.color),
    canContainRank: bounds.width >= 22
      && bounds.height >= 16
      && polygonArea(polygon) >= 240,
    hasDirectLabel: !part.isOther
      && bounds.width >= 72
      && bounds.height >= 50
      && estimatedTextWidth(part.name) <= bounds.width - 16
  };
}

function layoutRankCallouts(cells, x, y, width, height) {
  const tinyCells = cells
    .filter((cell) => !cell.canContainRank)
    .sort((first, second) => first.centerX - second.centerX);
  const lanes = { top: [], bottom: [] };
  tinyCells.forEach((cell, index) => {
    const lane = index % 2 === 0 ? "top" : "bottom";
    lanes[lane].push(cell);
  });
  const callouts = [];
  for (const lane of ["top", "bottom"]) {
    const cellsInLane = lanes[lane];
    const positions = distributePositions(
      cellsInLane.map((cell) => cell.centerX),
      x + 8,
      x + width - 8,
      20
    );
    cellsInLane.forEach((cell, index) => {
      callouts.push({
        ...cell,
        lane,
        calloutX: positions[index],
        calloutY: lane === "top" ? y - 13 : y + height + 17
      });
    });
  }
  return callouts;
}

function distributePositions(desiredPositions, minimum, maximum, idealGap) {
  if (desiredPositions.length === 0) {
    return [];
  }
  if (desiredPositions.length === 1) {
    return [Math.min(maximum, Math.max(minimum, desiredPositions[0]))];
  }
  const gap = Math.min(
    idealGap,
    (maximum - minimum) / (desiredPositions.length - 1)
  );
  const positions = [];
  desiredPositions.forEach((desired, index) => {
    positions.push(Math.max(
      minimum,
      Math.min(maximum, desired),
      index === 0 ? minimum : positions[index - 1] + gap
    ));
  });
  if (positions.at(-1) > maximum) {
    positions[positions.length - 1] = maximum;
    for (let index = positions.length - 2; index >= 0; index -= 1) {
      positions[index] = Math.min(positions[index], positions[index + 1] - gap);
    }
  }
  return positions;
}

function renderRankCallouts(callouts, theme) {
  return callouts.flatMap((callout) => [
    '    <g data-role="rank-callout" data-rank="' + callout.part.rank
      + '" data-lane="' + callout.lane + '" data-callout-x="'
      + svgNumber(callout.calloutX) + '">',
    '      <line x1="' + svgNumber(callout.centerX) + '" y1="'
      + svgNumber(callout.centerY) + '" x2="' + svgNumber(callout.calloutX)
      + '" y2="' + svgNumber(callout.calloutY) + '" stroke="'
      + theme.muted + '" stroke-width="1" opacity="0.55"/>',
    '      <circle cx="' + svgNumber(callout.calloutX) + '" cy="'
      + svgNumber(callout.calloutY) + '" r="8" fill="' + callout.part.color
      + '" stroke="' + theme.canvas + '" stroke-width="2"/>',
    renderRankText(callout, callout.calloutY + 3, callout.calloutX, "      "),
    "    </g>"
  ]);
}

function renderRankText(cell, rankY, rankX = cell.centerX, indent = "    ") {
  return indent + '<text class="part-rank" data-role="part-rank" data-rank="'
    + cell.part.rank + '" text-anchor="middle" x="' + svgNumber(rankX)
    + '" y="' + svgNumber(rankY) + '" fill="' + cell.labelColor + '">'
    + String(cell.part.rank).padStart(2, "0") + "</text>";
}

function defineAreaLayout(role, geometry) {
  return Object.freeze({ role, geometry });
}
