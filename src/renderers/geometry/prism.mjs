export function prismPolygons(parts, x, y, width, height) {
  const boundaries = [0];
  let cumulative = 0;
  for (const part of parts) {
    cumulative += part.share / 100;
    boundaries.push(cumulative);
  }
  const narrowestPart = Math.min(
    ...parts.map((part) => part.share / 100 * width)
  );
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
