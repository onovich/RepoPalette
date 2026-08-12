# RepoPalette

[简体中文](README.zh-CN.md)

[![CI](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml/badge.svg)](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/onovich/RepoPalette?include_prereleases)](https://github.com/onovich/RepoPalette/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Choose a layout and theme, then generate a programming-language chart from your public GitHub repositories.

RepoPalette runs on a schedule and saves the SVG plus its audit data in your own Profile repository. There is no personal token, hosted image service, or separate account to set up.

| `ribbon` | `matrix` | `voronoi` |
| --- | --- | --- |
| ![Ribbon layout](docs/gallery/ribbon-paper.svg) | ![Matrix layout](docs/gallery/matrix-paper.svg) | ![Voronoi layout](docs/gallery/voronoi-paper.svg) |

[Compare all layouts and themes in the gallery.](docs/GALLERY.md)

## What makes it different?

- Ten purpose-built layouts keep exact language names and percentages visible.
- The full public repository list is read instead of silently stopping after an early page.
- The generated files belong to your repository, so the image does not depend on a live card service.
- A readable JSON file shows which repositories were included or excluded. If an update fails, the last valid files stay in place.
- Optional, user-declared Manual/Vibe splitting creates two separate charts without pretending to detect AI-written code.

## Quick start

In your GitHub Profile repository (`your-name/your-name`), create `.github/workflows/repopalette.yml`:

```yaml
name: Update RepoPalette

on:
  workflow_dispatch:
  schedule:
    - cron: "17 3 * * 1"

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Check out profile repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: Generate language chart
        id: repopalette
        uses: onovich/RepoPalette@af29b0fb5f2273fb71bb410517ac1b3e97b93c63 # v0.3.0 implementation
        with:
          style: orbit
          theme: aurora

      - name: Commit changes
        shell: bash
        env:
          SVG_PATH: ${{ steps.repopalette.outputs.svg-path }}
          DATA_PATH: ${{ steps.repopalette.outputs.data-path }}
        run: |
          git add -- "$SVG_PATH" "$DATA_PATH"
          if git diff --cached --quiet; then
            exit 0
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -m "chore(profile): update RepoPalette"
          git push
```

Then:

1. Open the repository's **Actions** tab and run **Update RepoPalette** once.
2. Add `![GitHub languages](./assets/top-langs.svg)` to your Profile `README.md`.

The workflow checks for changes every Monday. The readable `@v0.3.0` tag is also available after release; the full commit SHA above is safer for a workflow with write access.

## Customize it

Change the two values in the `with` block:

- `style`: `bars`, `orbit`, `constellation`, `ribbon`, `bead-halo`, `matrix`, `halo`, `treemap`, `voronoi`, or `prism`
- `theme`: `light`, `paper`, `midnight`, `aurora`, `terminal`, or `neon`

You can also change the title, width, number of languages, and repository or language filters. The small `RepoPalette` watermark is shown by default; set `show-branding: false` to remove it. See [`action.yml`](action.yml) for every option.

To create separate **Manual Coding** and **Vibe Coding** charts, set `coding-mode: split` and list the languages you personally classify as manual in `manual-languages` (for example, `"C#,ShaderLab,HLSL,GLSL"`). All remaining and newly discovered languages go to Vibe Coding. Commit the paths from `manual-svg-path`, `vibe-svg-path`, and `data-path`, then embed `assets/top-langs-manual.svg` and `assets/top-langs-vibe.svg`. This is an opt-in display rule, not AI detection.

## What gets counted?

- Public repositories owned by the selected GitHub account.
- Forks are excluded. Archived repositories are excluded by default.
- Percentages use GitHub's language byte counts.
- The chart does not measure skill, time, code quality, or AI authorship. Any Manual/Vibe split is declared by the profile owner.

RepoPalette also writes `assets/top-langs-data.json` with the complete counting scope.

## Development

RepoPalette requires Node.js 24 or newer and has no runtime dependencies.

```bash
npm run check
```

See the [changelog](CHANGELOG.md), [product decisions](docs/PRODUCT_DECISIONS.md), and [MIT license](LICENSE).
