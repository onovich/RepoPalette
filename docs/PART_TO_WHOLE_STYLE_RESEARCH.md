# RepoPalette part-to-whole style research

Date: 2026-08-12  
Status: research shortlist only; no renderer implementation is authorized by this note.

Implementation update (2026-08-13): after preview review, the vertical Monolith Totem was removed because it duplicated the Ribbon encoding while using the card area less efficiently. The implemented seven are `ribbon`, `bead-halo`, `matrix`, `halo`, `treemap`, `voronoi`, and `prism`. The production code retains the data rules and validation gates below; this document preserves the earlier research path.

## Decision summary

Prepare one comparable preview sheet containing these seven directions, all rendered from the same Top-12 fixture and the same reference-derived palette:

1. **Silk Ribbon** — a single horizontal 100% composition ribbon.
2. **Monolith Totem** — a vertical proportional stack with restrained callouts.
3. **Precision Halo** — one contiguous 100% donut, not multiple independent progress rings.
4. **Ordered Matrix** — a deterministic 20 × 10 unit field.
5. **Bead Halo** — a 200-unit circular composition, selected instead of packed circles.
6. **Bento Treemap** — a restrained squarified treemap with exact legend.
7. **Voronoi Porcelain** — a deterministic weighted Voronoi experiment.

The first production candidates should be **Silk Ribbon**, **Ordered Matrix**, and **Monolith Totem**. **Precision Halo** and **Bead Halo** are useful showcase styles whose geometry still represents a whole. **Bento Treemap** and **Voronoi Porcelain** should remain editorial experiments unless the preview demonstrates that their compactness and visual character compensate for weaker value comparison.

Do **not** add conventional packed circles. D3 describes circle packing as a hierarchy/enclosure view, notes its wasted space, and says only leaf circles can be compared accurately. RepoPalette has a flat ranked composition, so the layout pays those costs without receiving the hierarchy benefit. The proposed Bead Halo keeps the appealing circular silhouette while making every visible unit part of one explicit whole. [D3 pack documentation](https://d3js.org/d3-hierarchy/pack)

## Non-negotiable data rules

### The visible composition must close to 100%

The current renderer takes `stats.languages.slice(0, config.top)` while percentages remain based on `stats.totalBytes`; therefore the displayed Top-N can sum to less than 100%. See [`src/render-svg.mjs`](../src/render-svg.mjs) and [`src/aggregate.mjs`](../src/aggregate.mjs).

Every closed composition preview must therefore add:

```text
Other = 100% - sum(displayed language shares)
```

`Other` is a real remainder, not decoration. It must appear in the shape and exact legend whenever it is non-zero. Without it, a donut, matrix, treemap, or ribbon would visually claim that Top-N is the entire language composition.

### Exact text remains available

The GitHub README image is static: critical values cannot depend on hover, zoom, or animation. Every direction must retain a sorted text legend containing full language names and exact percentages. Apple’s chart guidance recommends maximizing plot width in compact contexts, keeping labels clear, and not requiring interaction to reveal critical information. [Apple Human Interface Guidelines: Charts](https://developer.apple.com/design/human-interface-guidelines/charts)

### Color is not the identifier

Language identity and rank must remain recoverable from order, labels, values, boundaries, or numbering. W3C requires information not to be conveyed by color alone and calls for meaningful graphical cues to reach 3:1 contrast against adjacent colors. Very thin low-contrast separators are especially risky after antialiasing. [W3C Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [W3C Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

### Keep generation deterministic and self-contained

RepoPalette currently emits dependency-free SVG and rejects scripts, external resources, `<image>`, `<use>`, and any `url(...)` reference. See [`src/output-files.mjs`](../src/output-files.mjs). Under that contract, a premium appearance must come from flat fills, opacity, strokes, typography, spacing, and negative space — not blur, filters, linked assets, or SVG paint-server gradients.

Voronoi generation additionally needs a fixed seed and a measurable area-error threshold. The common D3 Voronoi-treemap plugin documents iterative convergence, compute-time/accuracy tradeoffs, and nondeterministic arrangements when the default random generator is used. [d3-voronoi-treemap source documentation](https://github.com/Kcnarf/d3-voronoi-treemap)

## Evidence used to rank the directions

Cleveland and McGill’s graphical-perception work and Heer and Bostock’s replication support position on a common scale and length over angle and area for accurate quantitative comparison. This does not mean circular or area forms are invalid; it means they should carry exact text and be positioned as overview/showcase styles rather than the most analytical default. [Cleveland & McGill, 1984](https://doi.org/10.1080/01621459.1984.10478080), [Heer & Bostock, 2010](https://idl.uw.edu/papers/crowdsourcing-graphical-perception)

IBM Carbon’s official chart taxonomy places donut, pie, stacked bar, treemap, and circle pack in its part-to-whole family, while it places radar under comparisons, stream under trends, and alluvial/network under connections. This supports rejecting visually dramatic forms whose semantics do not match one flat composition. [IBM Carbon chart types](https://carbondesignsystem.com/data-visualization/chart-types/)

The accuracy labels below are qualitative design judgments, not invented numerical test results. They combine the primary visual encoding, Top-12 density, static-label requirements, and RepoPalette’s 320 px minimum width.

## Comparative scorecard

| Preview direction | Primary encoding | Composition fidelity | Comparison accuracy | Aesthetic potential | Labels at 320 px | Static SVG cost | Recommended role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Silk Ribbon** | contiguous horizontal length | Exact when `Other` is included | High for overall composition; medium for middle-segment pairwise comparison | Very high | 2–3 direct labels; full one-column legend below | Low | First production candidate |
| **Monolith Totem** | contiguous vertical length | Exact when `Other` is included | Medium-high | Very high | External callouts for major segments; full legend below | Low | Production candidate / editorial hero |
| **Precision Halo** | angular span, arc length, annular area | Exact when `Other` is included | Medium | Very high | Center summary only; full legend below | Low–medium | Circular showcase style |
| **Ordered Matrix** | count and contiguous occupied units | Exact with split boundary cells; otherwise explicitly quantized | Medium-high for coarse shares | Very high | No in-cell labels; full legend below | Medium | Distinctive production candidate |
| **Bead Halo** | count of ordered circular units | Quantized to 0.5 percentage point with 200 beads | Medium | Very high | No bead labels; full legend below | Medium | Circular experimental showcase |
| **Bento Treemap** | rectangular area | Exact in layout geometry; visible gutters/rounding can introduce small distortion | Medium-low | High | Direct labels only in the largest 3–5 cells; full legend below | Medium | Compact editorial option |
| **Voronoi Porcelain** | irregular polygon area | Iteratively approximate; must pass an explicit error gate | Low–medium | Exceptional when well composed | Direct labels only in large cells; full legend below | High | Preview-only experiment |

## Seven preview directions

### 1. Silk Ribbon

**What it is.** One rounded, horizontal 0–100% track partitioned left-to-right in descending share order. The segment lengths sum to the whole; a quiet `Other` segment closes any Top-N remainder. Vega-Lite’s normalized stack explicitly computes percentage values in `[0, 1]`, and Carbon describes stacked bars as a way to show each series’ proportional contribution to a total. [Vega-Lite stack documentation](https://vega.github.io/vega-lite/docs/stack.html), [IBM Carbon simple charts](https://carbondesignsystem.com/data-visualization/simple-charts/)

**Why it can look premium.** Make the composition track the visual centerpiece rather than a conventional chart: generous vertical breathing room, a 16–22 px capsule silhouette, hairline boundary ticks, restrained labels, and a small coral index mark. Avoid gradients and heavy outlines.

**Integrity rules.** Segment boundaries are calculated from unrounded cumulative shares. Separators overlay the boundaries rather than shrinking each segment. Do not round every segment independently. Keep `Other` visible and named.

**320 px behavior.** Put text inside only the largest two or three segments when it fits without truncation. The exact ranked legend sits below in one column. This remains the best balance of immediate composition, accuracy, implementation cost, and visual refinement.

### 2. Monolith Totem

**What it is.** A single tall proportional column partitioned from top to bottom. It uses the same exact normalized stack as Silk Ribbon but gives the card a more object-like, editorial silhouette.

**Why it can look premium.** A narrow navy-to-sky-blue monolith on warm ivory, with sparse horizontal seam lines and compact callouts, resembles an architectural material sample rather than a dashboard widget. The title and total can align to the column’s baseline to form a strong grid.

**Integrity rules.** Segment height, not corner radius or label block size, represents value. Do not add physical gaps that disproportionately erase small segments. Use a continuous outer silhouette and overlaid seams. Sort the stack and legend identically so callout leaders never cross.

**320 px behavior.** Use at most four side callouts for the largest components; the exact one-column legend carries all Top-12 values. A mobile-width preview should test a 64–84 px column and reserve the remaining width for callouts or summary text.

### 3. Precision Halo

**What it is.** One contiguous annulus partitioned clockwise into shares of the same 100% whole. This is materially different from the current `orbit`, where each language has an independent partial ring against its own 100% track.

D3’s pie generator computes the angles used by arc paths, while its arc generator produces annular sectors for donut charts. Pie and donut values are read from combinations of arc length, area, and angle; Skau and Kosara’s experiments found donuts as accurate as pies, not that they match aligned length charts. [D3 pie](https://d3js.org/d3-shape/pie), [D3 arc](https://d3js.org/d3-shape/arc), [Skau & Kosara, 2016](https://www.tableau.com/research/publications/arcs-angles-or-areas-individual-data-encodings-pie-and-donut-charts)

**Why it can look premium.** Use one disciplined ring, a generous center, fine boundary ticks, and strong negative space. The center should show a factual summary such as `100% · N languages`, not a decorative metric unrelated to the ring.

**Integrity rules.** Start at 12 o’clock, proceed clockwise, and preserve descending order. Never explode slices, add perspective, vary radius, or use multiple independent rings. Include `Other` so the halo is genuinely complete.

**320 px behavior.** No internal category labels. Use a 150–180 px ring and the exact one-column legend below. This should remain a showcase option, not the analytical default.

### 4. Ordered Matrix

**What it is.** A 20 × 10 field of 200 equal cells filled row-by-row in descending language order. Each full cell represents 0.5 percentage point. Observable Plot’s waffle mark is explicitly designed to subdivide quantity into countable square cells, supports partial cells, and supports stacking. [Observable Plot waffle documentation](https://observablehq.com/plot/marks/waffle)

The arrangement must be ordered, not scattered. A CHI 2022 experiment found top, row, and diagonal icon-array arrangements more accurate than central, edge, or random arrangements for proportion estimates. [Xiong et al., 2022, Microsoft Research](https://www.microsoft.com/en-us/research/publication/investigating-perceptual-biases-in-icon-arrays/)

**Why it can look premium.** Use tiny rounded squares with precise spacing, a calm blue tonal sequence, and one coral origin marker outside the data field. The field can read like a machined perforated panel or woven textile without sacrificing its regular grid.

**Integrity rules.** The preferred preview uses cumulative boundaries and splits a boundary cell when needed, preserving exact proportions. A simpler all-whole-cell variant is acceptable only if it is labelled as quantized and uses an apportionment method that guarantees exactly 200 cells in total. Never scatter cells randomly.

**320 px behavior.** A roughly 252 × 126 px field leaves comfortable margins and keeps cells visible. All names and exact percentages remain in the legend below. The current validator forbids the SVG pattern approach used by Observable Plot, so RepoPalette would emit explicit `<rect>` elements; 200 simple marks are still a manageable static output.

### 5. Bead Halo

**What it is.** Two hundred equal beads around a circle, assigned contiguously in descending language order. It is an ordered unit chart wrapped around a closed path: the whole is always exactly 200 visible units, and each unit represents 0.5 percentage point.

**Why it is preferable to packed circles.** Packed circles encode magnitude in different circle areas and introduce unavoidable empty space; their strongest purpose is hierarchy. Bead Halo instead uses equal units and an explicit perimeter, so viewers see a closed composition rather than a loose bubble cluster. D3’s own pack documentation states the space-efficiency and hierarchy tradeoff. [D3 pack documentation](https://d3js.org/d3-hierarchy/pack)

**Why it can look premium.** Small, evenly spaced marks form a jewelry-like or precision-instrument perimeter. A quiet center summary and a single small coral registration mark add character without altering values.

**Integrity rules.** This style is intentionally quantized. Allocate all 200 beads with a deterministic largest-remainder apportionment, state `1 bead = 0.5%` in accessible text, and show exact percentages in the legend. Never vary bead radius by value; doing so would mix count and area encodings.

**320 px behavior.** A 170–190 px bead circle is viable, but sub-0.5% languages may receive no bead even though they remain listed. The preview must make this limitation visible and should be rejected if such categories disappear too often in realistic fixtures.

### 6. Bento Treemap

**What it is.** A flat root whose language children partition a rectangle by proportional area. D3’s default squarified treemap targets a golden-ratio aspect and documents that the method improves readability and size estimation over simple slice-and-dice. [D3 treemap documentation](https://d3js.org/d3-hierarchy/treemap)

Treemaps are most defensible when density and compactness matter more than exact comparison. Carbon recommends them for large hierarchical part-to-whole data when exact category comparison is not primary. Controlled treemap experiments also find area less accurate than length and show that extreme aspect ratios and perfect squares can both harm area judgment. [IBM Carbon spatial charts](https://carbondesignsystem.com/data-visualization/spatial-charts/), [Kong, Heer & Agrawala, 2010](https://idl.uw.edu/papers/perception-treemaps)

**Why it can look premium.** Use an editorial bento composition, restrained tonal blocks, very small ivory seams, and direct text only in spacious cells. This should feel like a designed layout, not a dense file-system map.

**Integrity rules.** Compute exact tile extents before decoration. Use strokes or overlaid seams instead of inset gutters that disproportionately reduce small areas. Apply only a small corner radius to sufficiently large tiles; keep small cells square. Include `Other` as a real tile.

**320 px behavior.** Expect direct labels in only the largest three to five cells. Small cells receive rank numbers that map to the exact legend. It is a compact overview, not the style for fine pairwise comparisons.

### 7. Voronoi Porcelain

**What it is.** A weighted Voronoi treemap whose polygon-cell areas approximate language shares. The original method was created for hierarchical metrics and supports arbitrary convex containers; its visual benefit is organic, non-rectangular subdivision. [Balzer & Deussen, 2005](https://graphics.uni-konstanz.de/publikationen/Balzer2005VoronoiTreemaps/index.html)

**Why it can look premium.** Flat blue and blush polygons separated by thin ivory seams can resemble ceramic inlay, cut stone, or a cartographic atlas. “Porcelain” here refers to flat material character; it does not require blur, glass filters, or gradients.

**Integrity rules.** The layout is accepted only if it uses a fixed seed, is byte-for-byte deterministic for the same input, closes to 100% with `Other`, and verifies generated polygon areas against target shares. The available D3 plugin notes iterative convergence, longer computation for tighter representativeness, and random-layout variation without a seeded PRNG. [d3-voronoi-treemap source documentation](https://github.com/Kcnarf/d3-voronoi-treemap)

Suggested preview gate: every cell’s absolute share error must be reported; the direction should not enter production unless a small threshold can be met consistently across skewed Top-12 fixtures. Do not silently describe an iterative approximation as exact.

**320 px behavior.** Only large cells receive direct labels; all cells must map by rank to the exact legend. This has the highest implementation and regression-test cost and should remain preview-only until it clearly wins on visual character.

## Explicitly rejected directions

| Direction | Reason for rejection |
| --- | --- |
| **Packed circles / bubble constellation** | Empty space weakens the visual whole; area comparison and small-label fit are weak; hierarchy is the layout’s main advantage and RepoPalette has none. Replace with Bead Halo. |
| **Sankey / alluvial** | Encodes flow and connection between stages or entities. RepoPalette has one composition and no source-to-target relation. |
| **Radar** | Encodes values on independent axes and invites profile/shape comparison; its closed polygon does not mean the values sum to a whole. |
| **Streamgraph / stacked area** | Encodes change across an ordered x-axis, usually time. A single snapshot has no such axis and would add fake continuity. |
| **Sunburst / icicle** | Primarily hierarchy/partition views. With one flat level they reduce to a donut or composition ribbon, so a separate style adds no new information. |
| **Rose / polar area** | Separate radial sectors emphasize independent magnitudes; they do not form a simple, constant-boundary whole and area comparison remains weak. |

Carbon’s official taxonomy separately classifies part-to-whole, trends, comparisons, and connections, which is the semantic basis for these exclusions. [IBM Carbon chart types](https://carbondesignsystem.com/data-visualization/chart-types/)

## Shared art direction for all previews

Use the supplied image’s visual system, not the current GitHub-language rainbow:

| Role | Color direction | Use |
| --- | --- | --- |
| Canvas | `#FEF7EF` | warm ivory field |
| Deep ink | `#024B81` | titles, values, essential boundaries |
| Primary mark | `#367DB7` | dominant share / major data |
| Secondary mark | `#6FADDF` | secondary shares |
| Icy neutral | `#C9DCE8` | minor shares, tracks, separators |
| Blush | `#FED9DA` | `Other` or quiet supporting region |
| Coral | `#FD7136` | tiny registration/index accent, not a large data fill |

For the preview, use color lightness to reinforce sorted rank while text and geometry carry identity. Adjacent composition segments still need visible boundaries. Carbon’s palette guidance emphasizes accessibility and harmony, carefully ordered categorical contrast, and deliberate small hits of color against rich neutrals. [IBM Carbon color palettes](https://carbondesignsystem.com/data-visualization/color-palettes/)

High-end here should mean:

- disciplined typography and tabular numerals;
- strong alignment and generous negative space;
- one dominant geometry rather than many decorative widgets;
- thin but sufficiently contrasting structural lines;
- flat, calm materials instead of neon glow, fake depth, or 3D;
- no ornamental links that imply relationships absent from the data.

## Preview protocol

Create mockups before adding any renderer or public configuration value.

Use the same two deterministic fixtures for all seven styles:

1. **Balanced:** no category over 35%, several values near 5–12%, and a non-zero `Other` remainder.
2. **Skewed:** one category over 60%, at least three categories below 1%, and a non-zero `Other` remainder.

Render each at **640 px and 320 px**. The preview sheet must display the exact same data beside every style and include these checks:

- the shape and legend both close to 100%;
- Top-3 order is obvious without first reading the numbers;
- exact values and full names remain readable at 320 px;
- a 1% category remains detectable, or the style clearly discloses its quantization limit;
- removing color does not remove category order or values;
- no label overlap or leader-line crossing;
- SVG is deterministic, self-contained, and accepted by the current validator;
- decorative gaps, strokes, or rounding do not materially change encoded proportions;
- file size and element count are recorded, especially for the two unit styles and Voronoi.

After visual review, choose at most **two** new production renderers in the next phase. Seven public style switches would increase documentation, tests, gallery size, and long-term compatibility before there is evidence that users value each one.

## Primary and official sources

- Cleveland & McGill, *Graphical Perception* (1984): <https://doi.org/10.1080/01621459.1984.10478080>
- Heer & Bostock, *Crowdsourcing Graphical Perception* (2010): <https://idl.uw.edu/papers/crowdsourcing-graphical-perception>
- Vega-Lite stack documentation: <https://vega.github.io/vega-lite/docs/stack.html>
- D3 pie documentation: <https://d3js.org/d3-shape/pie>
- D3 arc documentation: <https://d3js.org/d3-shape/arc>
- Skau & Kosara, *Arcs, Angles, or Areas* (2016): <https://www.tableau.com/research/publications/arcs-angles-or-areas-individual-data-encodings-pie-and-donut-charts>
- Observable Plot waffle documentation: <https://observablehq.com/plot/marks/waffle>
- Xiong et al., *Investigating Perceptual Biases in Icon Arrays* (2022): <https://www.microsoft.com/en-us/research/publication/investigating-perceptual-biases-in-icon-arrays/>
- D3 treemap documentation: <https://d3js.org/d3-hierarchy/treemap>
- Kong, Heer & Agrawala, *Perceptual Guidelines for Creating Rectangular Treemaps* (2010): <https://idl.uw.edu/papers/perception-treemaps>
- Balzer & Deussen, *Voronoi Treemaps* (2005): <https://graphics.uni-konstanz.de/publikationen/Balzer2005VoronoiTreemaps/index.html>
- `d3-voronoi-treemap` source documentation: <https://github.com/Kcnarf/d3-voronoi-treemap>
- D3 pack documentation: <https://d3js.org/d3-hierarchy/pack>
- IBM Carbon chart types: <https://carbondesignsystem.com/data-visualization/chart-types/>
- IBM Carbon simple charts: <https://carbondesignsystem.com/data-visualization/simple-charts/>
- IBM Carbon spatial charts: <https://carbondesignsystem.com/data-visualization/spatial-charts/>
- IBM Carbon color palettes: <https://carbondesignsystem.com/data-visualization/color-palettes/>
- Apple Human Interface Guidelines, Charts: <https://developer.apple.com/design/human-interface-guidelines/charts>
- W3C WCAG, Use of Color: <https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html>
- W3C WCAG, Non-text Contrast: <https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html>
