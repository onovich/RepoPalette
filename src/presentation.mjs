export const STYLE_NAMES = Object.freeze([
  "bars",
  "orbit",
  "constellation"
]);

export const THEME_NAMES = Object.freeze([
  "light",
  "paper",
  "midnight",
  "aurora",
  "terminal",
  "neon"
]);

const THEME_TOKENS = Object.freeze({
  light: Object.freeze({
    canvas: "#ffffff",
    surface: "#f6f8fa",
    ink: "#1f2328",
    muted: "#656d76",
    border: "#d0d7de",
    accent: "#0969da",
    track: "#eaeef2",
    grid: "#d8dee4"
  }),
  paper: Object.freeze({
    canvas: "#fbf6ea",
    surface: "#f2eadb",
    ink: "#2d261e",
    muted: "#6e6255",
    border: "#d8cbb8",
    accent: "#a4492e",
    track: "#e8dece",
    grid: "#ded1bf"
  }),
  midnight: Object.freeze({
    canvas: "#0d1117",
    surface: "#161b22",
    ink: "#f0f6fc",
    muted: "#8b949e",
    border: "#30363d",
    accent: "#58a6ff",
    track: "#21262d",
    grid: "#26303a"
  }),
  aurora: Object.freeze({
    canvas: "#07131e",
    surface: "#0d2230",
    ink: "#f1fbff",
    muted: "#9bb8c7",
    border: "#24475a",
    accent: "#63e6be",
    track: "#183848",
    grid: "#1d3d4d"
  }),
  terminal: Object.freeze({
    canvas: "#06110a",
    surface: "#0b1b10",
    ink: "#d5f7df",
    muted: "#83b291",
    border: "#21482d",
    accent: "#45e37d",
    track: "#15321f",
    grid: "#183c24"
  }),
  neon: Object.freeze({
    canvas: "#160d24",
    surface: "#211234",
    ink: "#fff5ff",
    muted: "#c5afd4",
    border: "#4d3565",
    accent: "#ff5fd2",
    track: "#342047",
    grid: "#412958"
  })
});

export function getTheme(name) {
  const theme = THEME_TOKENS[name];
  if (!theme) {
    throw new TypeError("unknown theme: " + name);
  }
  return theme;
}
