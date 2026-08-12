export function treemapPolygons(parts, x, y, width, height) {
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
