export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function safeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value ?? "") ? value : fallback;
}

export function clampPercentage(value) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function formatPercentage(value) {
  return clampPercentage(value).toFixed(1) + "%";
}

export function bytePercentage(language, totalBytes) {
  return totalBytes > 0
    ? clampPercentage(language.bytes / totalBytes * 100)
    : 0;
}

export function svgNumber(value, precision = 2) {
  const factor = 10 ** precision;
  return String(Math.round(value * factor) / factor);
}

export function truncateLabel(value, maxCharacters) {
  const graphemes = splitGraphemes(value);
  if (graphemes.length <= maxCharacters) {
    return graphemes.join("");
  }
  return graphemes.slice(0, Math.max(1, maxCharacters - 1)).join("") + "…";
}

export function contrastColor(color) {
  const dark = "#111318";
  const light = "#ffffff";
  return contrastRatio(color, dark) >= contrastRatio(color, light)
    ? dark
    : light;
}

export function renderLegend({ width, languages, theme, startY }) {
  const contentWidth = width - 48;
  const twoColumnWidth = contentWidth / 2;
  const widestLabel = Math.max(
    ...languages.map((language) => estimateTextWidth(language.name)),
    0
  );
  const columns = widestLabel <= twoColumnWidth - 58 ? 2 : 1;
  const columnWidth = contentWidth / columns;
  const rows = Math.ceil(languages.length / columns);
  const lines = [
    '  <g data-role="legend" data-columns="' + columns + '">'
  ];

  languages.forEach((language, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = 24 + column * columnWidth;
    const y = startY + row * 26;
    const color = safeColor(language.color, theme.accent);
    lines.push(
      '    <circle cx="' + (x + 4) + '" cy="' + (y - 4)
        + '" r="4" fill="' + color + '"/>',
      '    <text class="legend-label" x="' + (x + 16) + '" y="' + y + '">'
        + escapeXml(language.name) + "</text>",
      '    <text class="legend-value" text-anchor="end" x="'
        + (x + columnWidth - 4) + '" y="' + y + '">'
        + formatPercentage(language.percentage) + "</text>"
    );
  });
  lines.push("  </g>");

  return { lines, height: startY + rows * 26 + 18 };
}

function linearize(value) {
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color) {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255;
  const green = Number.parseInt(color.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255;
  return 0.2126 * linearize(red)
    + 0.7152 * linearize(green)
    + 0.0722 * linearize(blue);
}

function estimateTextWidth(value) {
  return splitGraphemes(value).reduce((width, grapheme) => {
    return width + (/^[\x20-\x7e]$/.test(grapheme) ? 6.3 : 10.5);
  }, 0);
}

function splitGraphemes(value) {
  const text = String(value);
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}
