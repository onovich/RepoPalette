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
  const text = String(value);
  if (text.length <= maxCharacters) {
    return text;
  }
  return text.slice(0, Math.max(1, maxCharacters - 1)) + "…";
}

export function contrastColor(color) {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255;
  const green = Number.parseInt(color.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * linearize(red)
    + 0.7152 * linearize(green)
    + 0.0722 * linearize(blue);
  return luminance > 0.42 ? "#111318" : "#ffffff";
}

function linearize(value) {
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}
