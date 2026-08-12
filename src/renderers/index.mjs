import {
  renderPrism,
  renderTreemap,
  renderVoronoi
} from "./area-composition.mjs";
import { renderBars } from "./bars.mjs";
import { renderConstellation } from "./constellation.mjs";
import { renderHalo } from "./halo.mjs";
import { renderOrbit } from "./orbit.mjs";
import { renderRibbon } from "./ribbon.mjs";
import { renderBeadHalo, renderMatrix } from "./unit-composition.mjs";

const STYLE_DEFINITIONS = Object.freeze([
  defineStyle("bars", renderBars),
  defineStyle("orbit", renderOrbit),
  defineStyle("constellation", renderConstellation),
  defineStyle("ribbon", renderRibbon, { composition: true }),
  defineStyle("bead-halo", renderBeadHalo, {
    composition: true,
    quantizedUnit: "bead"
  }),
  defineStyle("matrix", renderMatrix, {
    composition: true,
    quantizedUnit: "cell"
  }),
  defineStyle("halo", renderHalo, { composition: true }),
  defineStyle("treemap", renderTreemap, { composition: true }),
  defineStyle("voronoi", renderVoronoi, { composition: true }),
  defineStyle("prism", renderPrism, { composition: true })
]);

const STYLES_BY_NAME = new Map(
  STYLE_DEFINITIONS.map((definition) => [definition.name, definition])
);

export const STYLE_NAMES = Object.freeze(
  STYLE_DEFINITIONS.map((definition) => definition.name)
);

export function getStyleDefinition(name) {
  return STYLES_BY_NAME.get(name);
}

function defineStyle(name, render, metadata = {}) {
  return Object.freeze({
    name,
    render,
    composition: false,
    quantizedUnit: null,
    ...metadata
  });
}
