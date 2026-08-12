export { STYLE_NAMES } from "./renderers/index.mjs";

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

const CODING_GROUP_PALETTES = Object.freeze({
  light: defineCodingPalettes(
    ["#d85f32", "#e77d50", "#f09d73", "#f6bd9f", "#f9d9ca", "#b34222"],
    "#fbe8df",
    ["#075fc7", "#3b82cf", "#70a5dc", "#9bc3e8", "#c8def3", "#285d99"],
    "#dce9f7"
  ),
  paper: defineCodingPalettes(
    ["#fd7136", "#f9915a", "#f7b184", "#facbb0", "#fde2d4", "#d9562c"],
    "#feeee6",
    ["#024b81", "#27669f", "#6faddf", "#9ac7e7", "#c9dce8", "#598fb8"],
    "#dce9f1"
  ),
  midnight: defineCodingPalettes(
    ["#ff7a59", "#f4936f", "#e9ad8f", "#ffc4ae", "#9f5140", "#d9664d"],
    "#59352f",
    ["#58a6ff", "#388bfd", "#79c0ff", "#a5d6ff", "#1f6feb", "#6e8dff"],
    "#294764"
  ),
  aurora: defineCodingPalettes(
    ["#ff986b", "#f6b25d", "#f5c77a", "#d98268", "#ffd4b8", "#dc7b68"],
    "#5a3a32",
    ["#63e6be", "#41c7b0", "#43afc2", "#6fd6d0", "#a0efe0", "#42a5b5"],
    "#275e63"
  ),
  terminal: defineCodingPalettes(
    ["#f4c95d", "#e8a94b", "#d88c3d", "#ffd98a", "#94571f", "#f0b85b"],
    "#59471f",
    ["#45e37d", "#2ec46a", "#72f0a0", "#38b98e", "#9ef4b8", "#167344"],
    "#285c3a"
  ),
  neon: defineCodingPalettes(
    ["#ff5fd2", "#ff70a6", "#ff8a82", "#e849b7", "#ffc0dc", "#c5368e"],
    "#63304f",
    ["#55d6ff", "#5fa8ff", "#7a7dff", "#a279f2", "#76e4f7", "#b1c8ff"],
    "#3d4d78"
  )
});

export function getTheme(name) {
  const theme = THEME_TOKENS[name];
  if (!theme) {
    throw new TypeError("unknown theme: " + name);
  }
  return theme;
}

export function getCodingGroupTheme(name, group) {
  const theme = getTheme(name);
  const palette = CODING_GROUP_PALETTES[name]?.[group];
  if (!palette) {
    throw new TypeError("unknown coding group: " + group);
  }
  return Object.freeze({
    ...theme,
    accent: palette.series[0],
    series: palette.series,
    other: palette.other
  });
}

function defineCodingPalettes(
  manualSeries,
  manualOther,
  vibeSeries,
  vibeOther
) {
  return Object.freeze({
    manual: Object.freeze({
      series: Object.freeze(manualSeries),
      other: manualOther
    }),
    vibe: Object.freeze({
      series: Object.freeze(vibeSeries),
      other: vibeOther
    })
  });
}
