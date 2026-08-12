import { polygonArea } from "./polygon.mjs";

const ANCHORS = [
  [0.68, 0.58], [0.25, 0.46], [0.55, 0.22], [0.27, 0.80],
  [0.50, 0.80], [0.83, 0.22], [0.86, 0.76], [0.10, 0.18],
  [0.40, 0.48], [0.72, 0.40], [0.12, 0.68], [0.38, 0.12],
  [0.65, 0.88]
];

export function voronoiPolygons(parts, x, y, width, height) {
  const sites = parts.map((part, index) => ({
    x: ANCHORS[index][0] * width,
    y: ANCHORS[index][1] * height,
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
