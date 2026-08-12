import {
  compositionAttributes,
  compositionLanguages,
  contrastColor,
  escapeXml,
  formatPercentage,
  renderCompositionEmpty,
  renderCompositionLegend,
  svgNumber
} from "./common.mjs";

const VORONOI_ANCHORS = [
  [0.68, 0.58], [0.25, 0.46], [0.55, 0.22], [0.27, 0.80],
  [0.50, 0.80], [0.83, 0.22], [0.86, 0.76], [0.10, 0.18],
  [0.40, 0.48], [0.72, 0.40], [0.12, 0.68], [0.38, 0.12],
  [0.65, 0.88]
];

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
    if (!part.isOther && bounds.width >= 72 && bounds.height >= 50) {
      const [labelX, labelY] = polygonCentroid(polygon);
      const labelColor = contrastColor(part.color);
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
    startY: y + height + 38
  });
  lines.push(...legend.lines);
  return { height: legend.height, lines };
}

function treemapPolygons(parts, x, y, width, height) {
  const rectangles = squarify(
    parts.map((part) => ({ area: part.share / 100 * width * height })),
    { x, y, width, height }
  );
  return rectangles.map((rectangle) => [
    [rectangle.x, rectangle.y],
    [rectangle.x + rectangle.width, rectangle.y],
    [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
    [rectangle.x, rectangle.y + rectangle.height]
  ]);
}

function squarify(items, rectangle) {
  const result = [];
  let remaining = [...items];
  let box = { ...rectangle };
  let row = [];
  while (remaining.length > 0) {
    const candidate = [...row, remaining[0]];
    if (row.length === 0
        || worstRatio(candidate, Math.min(box.width, box.height))
          <= worstRatio(row, Math.min(box.width, box.height))) {
      row = candidate;
      remaining.shift();
    } else {
      const laidOut = layoutRow(row, box);
      result.push(...laidOut.items);
      box = laidOut.remaining;
      row = [];
    }
  }
  if (row.length > 0) {
    result.push(...layoutRow(row, box).items);
  }
  return result;
}

function layoutRow(row, box) {
  const area = row.reduce((sum, item) => sum + item.area, 0);
  const horizontal = box.width >= box.height;
  const items = [];
  let cursor = horizontal ? box.y : box.x;
  if (horizontal) {
    const rowWidth = area / box.height;
    for (const item of row) {
      const itemHeight = rowWidth > 0 ? item.area / rowWidth : 0;
      items.push({ x: box.x, y: cursor, width: rowWidth, height: itemHeight });
      cursor += itemHeight;
    }
    return {
      items,
      remaining: {
        x: box.x + rowWidth,
        y: box.y,
        width: Math.max(0, box.width - rowWidth),
        height: box.height
      }
    };
  }
  const rowHeight = area / box.width;
  for (const item of row) {
    const itemWidth = rowHeight > 0 ? item.area / rowHeight : 0;
    items.push({ x: cursor, y: box.y, width: itemWidth, height: rowHeight });
    cursor += itemWidth;
  }
  return {
    items,
    remaining: {
      x: box.x,
      y: box.y + rowHeight,
      width: box.width,
      height: Math.max(0, box.height - rowHeight)
    }
  };
}

function worstRatio(row, shortSide) {
  if (row.length === 0 || shortSide <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  const sum = row.reduce((total, item) => total + item.area, 0);
  const maximum = Math.max(...row.map((item) => item.area));
  const minimum = Math.min(...row.map((item) => item.area));
  return Math.max(
    shortSide * shortSide * maximum / (sum * sum),
    sum * sum / (shortSide * shortSide * minimum)
  );
}

function prismPolygons(parts, x, y, width, height) {
  const boundaries = [0];
  let cumulative = 0;
  for (const part of parts) {
    cumulative += part.share / 100;
    boundaries.push(cumulative);
  }
  const narrowestPart = Math.min(...parts.map((part) => part.share / 100 * width));
  const tilt = Math.min(22, narrowestPart * 0.38);
  const shifts = boundaries.map((value, index) => {
    if (index === 0 || index === boundaries.length - 1) {
      return 0;
    }
    return Math.sin(index * 1.7) * tilt;
  });
  return parts.map((part, index) => {
    const left = x + boundaries[index] * width;
    const right = x + boundaries[index + 1] * width;
    return [
      [left + shifts[index], y],
      [right + shifts[index + 1], y],
      [right - shifts[index + 1], y + height],
      [left - shifts[index], y + height]
    ];
  });
}

function voronoiPolygons(parts, x, y, width, height) {
  const sites = parts.map((part, index) => ({
    x: VORONOI_ANCHORS[index][0] * width,
    y: VORONOI_ANCHORS[index][1] * height,
    target: part.share / 100 * width * height,
    weight: part.share / 100 * width * height * 0.65
  }));
  let cells = [];
  for (let iteration = 0; iteration < 900; iteration += 1) {
    cells = sites.map((site, siteIndex) => {
      let polygon = [[0, 0], [width, 0], [width, height], [0, height]];
      sites.forEach((other, otherIndex) => {
        if (siteIndex === otherIndex || polygon.length === 0) {
          return;
        }
        polygon = clipPolygon(
          polygon,
          2 * (other.x - site.x),
          2 * (other.y - site.y),
          other.x ** 2 + other.y ** 2 - site.x ** 2 - site.y ** 2
            + site.weight - other.weight
        );
      });
      return polygon;
    });
    const gain = iteration < 200 ? 0.55 : iteration < 600 ? 0.25 : 0.12;
    let meanWeight = 0;
    sites.forEach((site, index) => {
      site.weight += (site.target - polygonArea(cells[index])) * gain;
      meanWeight += site.weight;
    });
    meanWeight /= sites.length;
    sites.forEach((site) => { site.weight -= meanWeight; });
  }
  const totalArea = width * height;
  const withinAreaGate = cells.every((polygon, index) => {
    const area = polygonArea(polygon);
    const absoluteShareError = Math.abs(area - sites[index].target)
      / totalArea * 100;
    return polygon.length >= 3 && area > 0 && absoluteShareError <= 0.05;
  });
  if (!withinAreaGate) {
    return exactMosaicPolygons(parts, x, y, width, height);
  }
  return cells.map((polygon) =>
    polygon.map(([pointX, pointY]) => [pointX + x, pointY + y])
  );
}

function exactMosaicPolygons(parts, x, y, width, height) {
  const boundaries = [0];
  let cumulative = 0;
  for (const part of parts) {
    cumulative += part.share / 100;
    boundaries.push(cumulative);
  }
  const amplitude = width * 0.10;
  const shifts = boundaries.map((boundary) =>
    amplitude * Math.sin(boundary * Math.PI * 2)
  );
  return parts.map((part, index) => {
    const left = x + boundaries[index] * width;
    const right = x + boundaries[index + 1] * width;
    const leftShift = shifts[index];
    const rightShift = shifts[index + 1];
    return [
      [left + leftShift, y],
      [right + rightShift, y],
      [right - rightShift, y + height / 2],
      [right + rightShift, y + height],
      [left + leftShift, y + height],
      [left - leftShift, y + height / 2]
    ];
  });
}

function clipPolygon(polygon, a, b, c) {
  const result = [];
  polygon.forEach((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    const pointValue = a * point[0] + b * point[1] - c;
    const nextValue = a * next[0] + b * next[1] - c;
    const pointInside = pointValue <= 1e-8;
    const nextInside = nextValue <= 1e-8;
    if (pointInside) {
      result.push(point);
    }
    if (pointInside !== nextInside) {
      const ratio = pointValue / (pointValue - nextValue);
      result.push([
        point[0] + (next[0] - point[0]) * ratio,
        point[1] + (next[1] - point[1]) * ratio
      ]);
    }
  });
  return result;
}

function polygonArea(polygon) {
  let area = 0;
  polygon.forEach((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    area += point[0] * next[1] - next[0] * point[1];
  });
  return Math.abs(area) / 2;
}

function polygonCentroid(polygon) {
  let crossSum = 0;
  let xSum = 0;
  let ySum = 0;
  polygon.forEach((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    const cross = point[0] * next[1] - next[0] * point[1];
    crossSum += cross;
    xSum += (point[0] + next[0]) * cross;
    ySum += (point[1] + next[1]) * cross;
  });
  if (Math.abs(crossSum) < 1e-8) {
    const bounds = polygonBounds(polygon);
    return [bounds.x + bounds.width / 2, bounds.y + bounds.height / 2];
  }
  return [xSum / (3 * crossSum), ySum / (3 * crossSum)];
}

function polygonBounds(polygon) {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}
