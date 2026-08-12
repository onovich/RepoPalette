export const STYLE_NAMES = Object.freeze([
  "bars",
  "orbit",
  "constellation",
  "ribbon",
  "bead-halo",
  "matrix",
  "halo",
  "treemap",
  "voronoi",
  "prism"
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
    canvas: "#fef7ef",
    surface: "#fffdf9",
    ink: "#024b81",
    muted: "#4d738d",
    border: "#a9c9dc",
    accent: "#fd7136",
    track: "#c9dce8",
    grid: "#dce9f1",
    series: Object.freeze([
      "#024b81",
      "#367db7",
      "#6faddf",
      "#c9dce8",
      "#fed9da",
      "#fd7136"
    ]),
    other: "#fed9da"
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
