import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { splitCodingStats } from "../src/classification.mjs";
import { renderSplitSvg } from "../src/render-split-svg.mjs";
import { renderSvg } from "../src/render-svg.mjs";

export const GALLERY_PREVIEWS = Object.freeze([
  Object.freeze({ style: "bars", theme: "light", fileName: "bars-light.svg" }),
  Object.freeze({ style: "bars", theme: "paper", fileName: "bars-paper.svg" }),
  Object.freeze({ style: "orbit", theme: "aurora", fileName: "orbit-aurora.svg" }),
  Object.freeze({ style: "orbit", theme: "terminal", fileName: "orbit-terminal.svg" }),
  Object.freeze({
    style: "constellation",
    theme: "midnight",
    fileName: "constellation-midnight.svg"
  }),
  Object.freeze({
    style: "constellation",
    theme: "neon",
    fileName: "constellation-neon.svg"
  }),
  Object.freeze({ style: "ribbon", theme: "paper", fileName: "ribbon-paper.svg" }),
  Object.freeze({
    style: "bead-halo",
    theme: "paper",
    fileName: "bead-halo-paper.svg"
  }),
  Object.freeze({ style: "matrix", theme: "paper", fileName: "matrix-paper.svg" }),
  Object.freeze({ style: "halo", theme: "paper", fileName: "halo-paper.svg" }),
  Object.freeze({ style: "treemap", theme: "paper", fileName: "treemap-paper.svg" }),
  Object.freeze({ style: "voronoi", theme: "paper", fileName: "voronoi-paper.svg" }),
  Object.freeze({ style: "prism", theme: "paper", fileName: "prism-paper.svg" }),
  Object.freeze({
    style: "ribbon",
    theme: "paper",
    codingMode: "split",
    fileName: "coding-split-ribbon-paper.svg"
  })
]);

const GALLERY_STATS = Object.freeze({
  repositoryCount: 27,
  includedRepositoryCount: 24,
  totalBytes: 1_000_000,
  languages: Object.freeze([
    Object.freeze({
      name: "TypeScript",
      bytes: 420_000,
      percentage: 42,
      color: "#3178C6"
    }),
    Object.freeze({
      name: "Python",
      bytes: 250_000,
      percentage: 25,
      color: "#3572A5"
    }),
    Object.freeze({
      name: "C#",
      bytes: 140_000,
      percentage: 14,
      color: "#178600"
    }),
    Object.freeze({
      name: "ShaderLab",
      bytes: 80_000,
      percentage: 8,
      color: "#222C37"
    }),
    Object.freeze({
      name: "Shell",
      bytes: 60_000,
      percentage: 6,
      color: "#89E051"
    }),
    Object.freeze({
      name: "HTML",
      bytes: 50_000,
      percentage: 5,
      color: "#E34C26"
    })
  ])
});

export async function generateGallery(outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  for (const preview of GALLERY_PREVIEWS) {
    const config = {
      title: "Language Composition",
      top: 6,
      width: 400,
      style: preview.style,
      theme: preview.theme
    };
    const svg = preview.codingMode === "split"
      ? renderSplitSvg(
          splitCodingStats(GALLERY_STATS, ["C#", "ShaderLab"]),
          config
        )
      : renderSvg(GALLERY_STATS, config);
    await writeFile(join(outputDirectory, preview.fileName), svg, "utf8");
  }
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1]
    && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const repositoryRoot = resolve(dirname(scriptPath), "..");
  await generateGallery(resolve(repositoryRoot, "docs", "gallery"));
}
