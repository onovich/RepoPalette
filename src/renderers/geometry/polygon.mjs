export function polygonArea(polygon) {
  let area = 0;
  polygon.forEach((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    area += point[0] * next[1] - next[0] * point[1];
  });
  return Math.abs(area) / 2;
}

export function polygonCentroid(polygon) {
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

export function polygonBounds(polygon) {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}
