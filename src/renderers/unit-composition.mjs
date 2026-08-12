import {
  compositionAttributes,
  compositionLanguages,
  renderCompositionEmpty,
  renderCompositionLegend,
  svgNumber
} from "./common.mjs";

const UNIT_COUNT = 200;
const MATRIX_LAYOUT = Object.freeze({
  role: "matrix-unit",
  points: matrixPoints,
  legendY: 292
});
const BEAD_HALO_LAYOUT = Object.freeze({
  role: "bead-halo-unit",
  points: haloPoints,
  legendY: 310
});

export function renderMatrix(context) {
  return renderUnits(context, MATRIX_LAYOUT);
}

export function renderBeadHalo(context) {
  return renderUnits(context, BEAD_HALO_LAYOUT);
}

function renderUnits({ stats, config, languages, theme }, layout) {
  if (languages.length === 0) {
    return renderCompositionEmpty(config, theme, layout.role);
  }
  const parts = compositionLanguages(languages, stats.totalBytes, theme);
  const counts = allocateUnits(parts);
  const unitGroups = counts.flatMap((count, groupIndex) =>
    Array.from({ length: count }, () => groupIndex)
  );
  const lines = ['  <g data-role="unit-field" data-unit-share="0.5">'];

  emitGroupedUnits(
    lines,
    parts,
    unitGroups,
    layout.points(config.width),
    layout.role
  );
  lines.push("  </g>");
  const legend = renderCompositionLegend({
    width: config.width,
    parts,
    theme,
    startY: layout.legendY
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}

function matrixPoints(width) {
  const columns = 20;
  const gap = Math.max(2, Math.min(4, (width - 320) / 120 + 2));
  const size = Math.min(13, (width - 48 - gap * (columns - 1)) / columns);
  const gridWidth = columns * size + (columns - 1) * gap;
  const startX = (width - gridWidth) / 2;
  const startY = 92;
  return Array.from({ length: UNIT_COUNT }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      x: startX + column * (size + gap) + size / 2,
      y: startY + row * (size + gap) + size / 2,
      radius: size / 2
    };
  });
}

function haloPoints(width) {
  const centerX = width / 2;
  const centerY = 190;
  const outerRadius = Math.min(105, (width - 82) / 2);
  const radii = [outerRadius, outerRadius * 0.80, outerRadius * 0.60, outerRadius * 0.40];
  const counts = [70, 56, 43, 31];
  const offsets = [0.018, 0.049, 0.083, 0.121];
  const points = radii.flatMap((radius, ringIndex) =>
    Array.from({ length: counts[ringIndex] }, (_, index) => {
      const turn = (index / counts[ringIndex] + offsets[ringIndex]) % 1;
      const angle = turn * Math.PI * 2 - Math.PI / 2;
      return {
        angle: (angle + Math.PI * 2) % (Math.PI * 2),
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    })
  ).sort((first, second) => first.angle - second.angle);
  const radius = Math.max(2.5, outerRadius * 0.036);
  return points.map((point) => ({ ...point, radius }));
}

function emitGroupedUnits(lines, parts, unitGroups, points, role) {
  let currentGroup = -1;
  points.forEach((point, index) => {
    const groupIndex = unitGroups[index];
    const part = parts[groupIndex];
    if (groupIndex !== currentGroup) {
      if (currentGroup !== -1) {
        lines.push("    </g>");
      }
      lines.push("    <g " + compositionAttributes(part) + ">");
      currentGroup = groupIndex;
    }
    lines.push(
      '      <circle data-role="' + role + '" cx="' + svgNumber(point.x)
        + '" cy="' + svgNumber(point.y) + '" r="'
        + svgNumber(point.radius)
        + '" fill="' + part.color + '"/>'
    );
  });
  lines.push("    </g>");
}

function allocateUnits(parts) {
  const exact = parts.map((part) => part.share * UNIT_COUNT / 100);
  const result = exact.map(Math.floor);
  let remainder = UNIT_COUNT - result.reduce((sum, value) => sum + value, 0);
  const priority = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((first, second) =>
      second.fraction - first.fraction || first.index - second.index
    );
  for (let index = 0; index < remainder; index += 1) {
    result[priority[index].index] += 1;
  }
  return result;
}
