import {
  bytePercentage,
  contrastColor,
  escapeXml,
  renderLegend,
  seriesColor,
  svgNumber,
  truncateLabel
} from "./common.mjs";

const ANCHORS = [
  [0.43, 0.47],
  [0.67, 0.34],
  [0.64, 0.69],
  [0.30, 0.72],
  [0.24, 0.29],
  [0.82, 0.58],
  [0.84, 0.23],
  [0.47, 0.18],
  [0.46, 0.84],
  [0.76, 0.84],
  [0.12, 0.52],
  [0.91, 0.42]
];

export function renderConstellation({ stats, config, languages, theme }) {
  if (languages.length === 0) {
    return renderEmptyConstellation(config, theme);
  }

  const top = 86;
  const bottom = 310;
  const nodes = layoutNodes(languages, stats.totalBytes, config.width, top, bottom);
  const lines = [
    '  <rect x="24" y="78" width="' + (config.width - 48)
      + '" height="240" rx="12" fill="' + theme.surface + '"/>'
  ];

  for (const [x, y, radius] of decorativePoints(config.width)) {
    lines.push(
      '  <circle cx="' + x + '" cy="' + y + '" r="' + radius
        + '" fill="' + theme.grid + '"/>'
    );
  }

  nodes.forEach((node, index) => {
    if (index === 0) {
      return;
    }
    const target = nearestPreviousNode(node, nodes.slice(0, index));
    lines.push(
      '  <line x1="' + svgNumber(node.x) + '" y1="' + svgNumber(node.y)
        + '" x2="' + svgNumber(target.x) + '" y2="' + svgNumber(target.y)
        + '" stroke="' + theme.grid + '" stroke-width="1.5"/>'
    );
  });

  nodes.forEach((node, index) => {
    const color = seriesColor(node.language, index, theme);
    lines.push(
      '  <circle cx="' + svgNumber(node.x) + '" cy="' + svgNumber(node.y)
        + '" r="' + svgNumber(node.radius + 6) + '" fill="' + color
        + '" fill-opacity="0.13"/>',
      '  <circle data-role="constellation-node" data-share="'
        + svgNumber(node.share, 4) + '" cx="' + svgNumber(node.x)
        + '" cy="' + svgNumber(node.y) + '" r="' + svgNumber(node.radius)
        + '" fill="' + color + '" fill-opacity="0.9" stroke="'
        + theme.canvas + '" stroke-width="2"/>'
    );

    if (node.radius >= 18) {
      const maxCharacters = Math.max(2, Math.floor((node.radius * 2 - 10) / 6));
      lines.push(
        '  <text class="node-label" text-anchor="middle" x="'
          + svgNumber(node.x) + '" y="' + svgNumber(node.y + 4)
          + '" fill="' + contrastColor(color) + '">'
          + escapeXml(truncateLabel(node.language.name, maxCharacters))
          + "</text>"
      );
    }
  });

  const legend = renderLegend({
    width: config.width,
    languages,
    theme,
    startY: 346
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}

function layoutNodes(languages, totalBytes, width, top, bottom) {
  const left = 30;
  const right = width - 30;
  const availableWidth = right - left;
  const availableHeight = bottom - top;
  const nodes = languages.map((language, index) => {
    const share = bytePercentage(language, totalBytes);
    const anchor = ANCHORS[index];
    const radius = Math.sqrt(64 + share * 25);
    return {
      language,
      share,
      radius,
      targetX: left + anchor[0] * availableWidth,
      targetY: top + anchor[1] * availableHeight,
      x: left + anchor[0] * availableWidth,
      y: top + anchor[1] * availableHeight
    };
  });

  for (let iteration = 0; iteration < 120; iteration += 1) {
    for (let first = 0; first < nodes.length; first += 1) {
      for (let second = first + 1; second < nodes.length; second += 1) {
        separateNodes(nodes[first], nodes[second], first, second);
      }
    }

    for (const node of nodes) {
      node.x += (node.targetX - node.x) * 0.012;
      node.y += (node.targetY - node.y) * 0.012;
      node.x = clamp(node.x, left + node.radius + 7, right - node.radius - 7);
      node.y = clamp(node.y, top + node.radius + 7, bottom - node.radius - 7);
    }
  }

  return nodes;
}

function separateNodes(first, second, firstIndex, secondIndex) {
  let deltaX = second.x - first.x;
  let deltaY = second.y - first.y;
  let distance = Math.hypot(deltaX, deltaY);
  const minimumDistance = first.radius + second.radius + 9;
  if (distance >= minimumDistance) {
    return;
  }
  if (distance < 0.001) {
    const angle = (firstIndex * 71 + secondIndex * 43) * Math.PI / 180;
    deltaX = Math.cos(angle);
    deltaY = Math.sin(angle);
    distance = 1;
  }
  const movement = (minimumDistance - distance) / 2;
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  first.x -= unitX * movement;
  first.y -= unitY * movement;
  second.x += unitX * movement;
  second.y += unitY * movement;
}

function nearestPreviousNode(node, previousNodes) {
  return previousNodes.reduce((nearest, candidate) => {
    const candidateDistance = Math.hypot(
      node.x - candidate.x,
      node.y - candidate.y
    );
    const nearestDistance = Math.hypot(
      node.x - nearest.x,
      node.y - nearest.y
    );
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

function renderEmptyConstellation(config, theme) {
  const centerX = config.width / 2;
  const lines = [
    '  <rect x="24" y="78" width="' + (config.width - 48)
      + '" height="150" rx="12" fill="' + theme.surface + '"/>',
    '  <line x1="' + (centerX - 38) + '" y1="138" x2="'
      + (centerX + 34) + '" y2="170" stroke="' + theme.grid + '"/>',
    '  <circle cx="' + (centerX - 38) + '" cy="138" r="9" fill="'
      + theme.track + '"/>',
    '  <circle cx="' + (centerX + 34) + '" cy="170" r="13" fill="'
      + theme.track + '"/>',
    '  <text class="empty" text-anchor="middle" x="' + centerX
      + '" y="208">No language data available.</text>'
  ];
  return { height: 252, lines };
}

function decorativePoints(width) {
  return [
    [42, 98, 1.5],
    [width - 47, 109, 2],
    [width - 62, 285, 1.5],
    [58, 278, 2],
    [width / 2 + 13, 96, 1.5]
  ];
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
