# RepoPalette visualization research

Date: 2026-08-12

This note evaluates visual directions for a static GitHub profile card. It is a research recommendation, not an implementation specification.

Status update (2026-08-13): this first-round note is superseded for part-to-whole selection by [PART_TO_WHOLE_STYLE_RESEARCH.md](PART_TO_WHOLE_STYLE_RESEARCH.md) and the subsequent reviewed previews. The final implementation keeps the accuracy cautions here while offering the seven requested proportional styles as explicit choices.

## Conclusion

RepoPalette should not answer the current usability problem with another radial or free-form area chart. Language share is an ordered quantitative comparison. The strongest primary encoding is therefore a position on a shared horizontal scale, with exact language names and percentages beside it. Circular and area-first layouts can remain optional showcase styles.

Recommended preview order:

1. **Ranked dot-line / signal lanes** — shared horizontal scale, thin rails, precise endpoints, direct labels and exact values. This is the best balance of accuracy, visual lightness and distinctiveness.
2. **Woven units / row waffle** — a regularly filled unit matrix plus an exact ranked legend. This is the strongest experimental, shareable option, but the grid is an approximation for shares smaller than one unit.
3. **Soft treemap + exact legend** — compact and attractive, but area comparison and small-label fit make it a secondary overview rather than the default.

`orbit` should remain a showcase style. `constellation` should be redesigned or demoted: its circle areas are harder to compare, and its links imply relationships that are not present in the data.

## Palette direction from the supplied image

The reference is cohesive because it is not a categorical rainbow. It uses a warm neutral field, an analogous blue hierarchy, pale blush support and very small coral-orange focal accents.

Approximate sampled direction:

| Role | Reference-derived color | Intended use |
| --- | --- | --- |
| Canvas | `#FEF7EF` | warm ivory background |
| Icy neutral | `#C9DCE8` | panels, tracks and separators |
| Sky blue | `#6FADDF` | secondary data marks |
| Primary blue | `#367DB7` | primary data marks |
| Deep navy | `#024B81` | text, outlines and high-contrast marks |
| Blush | `#FED9DA` | restrained supporting accent |
| Coral orange | `#FD7136` | tiny focal highlight, not body text |

The current renderers still use each language's GitHub color for the actual data marks, while the theme mainly controls canvas, surface, border and text. This prevents themes from achieving the reference image's visual coherence. A later design should compare two explicit color modes:

- `curated`: theme-controlled marks; value is communicated by position/length and text, not hue.
- `language`: current GitHub language colors for users who value that convention.

The supplied coral has low contrast on ivory, so it should be decorative or adjusted darker when it carries required information. Text and critical geometry should use navy or a sufficiently dark blue. W3C guidance also requires information not to depend on color alone.

## Evidence and implications

Cleveland and McGill's graphical-perception work places position on a common scale at the strongest end of quantitative judgments. Heer and Bostock replicated the general result and investigated area judgments, including treemap-like rectangles. For RepoPalette this supports a single, sorted column with a common baseline rather than a radial or free-position layout.

Treemaps are space-efficient hierarchical views, but RepoPalette has only a small flat Top-N list. D3's own hierarchy documentation positions treemaps and circle packing as hierarchy layouts; D3 also notes that circle packing wastes space and primarily makes hierarchy more visible. A treemap can therefore be attractive as an overview, but it does not solve the main comparison task better than aligned lanes.

Unit grids are worth prototyping. Observable Plot formally supports waffle marks, including partial cells and configurable units. Research on icon arrays indicates that orderly, edge-anchored filling is preferable to random or decorative scattering. RepoPalette should therefore test a row-filled matrix, never a random particle cloud, and retain exact text values.

The color system should use deliberate small hits of accent against neutrals, consistent with IBM Carbon's visualization guidance. Exact names, values and rank must remain visible so the design does not rely on hue alone, consistent with W3C WCAG guidance.

## Candidate comparison

| Direction | Accuracy | Label fit | Visual character | Static SVG cost | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Ranked dot-line / signal lanes | High | High | Elegant, instrument-like | Low | Preview first; likely practical default |
| Row waffle / woven units | Medium | High with legend | Distinctive, shareable | Medium | Preview as innovative option |
| Soft treemap | Medium-low | Medium-low | Compact, editorial | Medium | Preview as overview only |
| Orbit | Low without text | Medium | Strong showcase appeal | Already built | Keep as showcase |
| Constellation / packed circles | Low without text | Low-medium | Decorative, unstable | Already built | Redesign or demote |
| Pie, donut, sunburst, radial bars | Low-medium | Low | Familiar or decorative | Medium | Do not add now |
| Voronoi / irregular packing | Low | Low | Visually novel | High | Reject for this flat Top-N task |

## Preview-only experiment

Before changing a renderer, create three uncommitted/static mockups from the same fixed Top-12 fixture:

1. `signal-lanes`: a 100% composition strip for gestalt plus auto-scaled, shared-axis dot-lines for precise comparison.
2. `woven-units`: a regular row-filled 200-unit field plus a sorted exact legend.
3. `soft-treemap`: rounded rectangular regions plus the same sorted exact legend.

All three should use the reference-derived palette and be shown at both 640 px and 320 px. Compare them against the current `bars`, `orbit · aurora` and `constellation · neon` using these gates:

- top three languages are identifiable immediately;
- pairwise gaps are visible without first reading the percentages;
- all Top-12 language names and exact percentages remain visible;
- a one-percent category remains distinguishable;
- grayscale/color-vision checks do not remove the ranking information;
- SVG remains self-contained and readable in a GitHub README.

Only after choosing a mockup should a renderer, style name or configuration surface be added.

## Primary sources and official references

- Cleveland & McGill, *Graphical Perception* (1984): <https://doi.org/10.1080/01621459.1984.10478080>
- Heer & Bostock, *Crowdsourcing Graphical Perception* (2010): <https://idl.uw.edu/papers/crowdsourcing-graphical-perception>
- Talbot, Setlur & Anand, *Four Experiments on the Perception of Bar Charts* (2014): <https://doi.org/10.1109/TVCG.2014.2346320>
- Kong, Heer & Agrawala, *Perceptual Guidelines for Creating Rectangular Treemaps* (2010): <https://idl.uw.edu/papers/perception-treemaps>
- Xiong et al., *Investigating Perceptual Biases in Icon Arrays* (2022): <https://doi.org/10.1145/3491102.3501874>
- D3 treemap documentation: <https://d3js.org/d3-hierarchy/treemap>
- D3 circle-packing documentation: <https://d3js.org/d3-hierarchy/pack>
- Observable Plot waffle documentation: <https://observablehq.com/plot/marks/waffle>
- Observable lollipop reference: <https://observablehq.com/@observablehq/plot-lollipop>
- IBM Carbon visualization palettes: <https://carbondesignsystem.com/data-visualization/color-palettes/>
- W3C WCAG, Use of Color: <https://www.w3.org/WAI/WCAG22/Understanding/use-of-color>
- W3C WCAG, Non-text Contrast: <https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html>
