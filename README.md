# RepoPalette

[简体中文](README.zh-CN.md)

[![CI](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml/badge.svg)](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/onovich/RepoPalette?include_prereleases)](https://github.com/onovich/RepoPalette/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Generate a programming-language chart from your public GitHub repositories.

RepoPalette runs in GitHub Actions and saves a validated SVG plus audit data directly in your Profile repository. Public repositories work with GitHub's built-in token, so there is no personal access token or hosted service to set up.

[![Live RepoPalette example](https://raw.githubusercontent.com/onovich/onovich/main/assets/top-langs.svg)](https://github.com/onovich/onovich/blob/main/assets/top-langs-data.json)

> **Preview:** v0.1 currently provides the `bars` layout with the `light` theme. More layouts and themes are planned.

## Why use it?

- Set it up once, then let a scheduled workflow keep the chart current.
- Check every page of your public repository list instead of silently stopping early.
- Keep the SVG and JSON in your own repository instead of relying on a live image service.
- Keep the last valid image when an update fails, and inspect exactly what was counted in the audit JSON.

## Quick start

1. In your GitHub Profile repository (`your-name/your-name`), create `.github/workflows/repopalette.yml` with this content:

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
        uses: onovich/RepoPalette@4dfd83c030dfd6dff7bd8af12ad30947c4b63f1f # Pinned preview revision

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

2. Open the repository's **Actions** tab and run **Update RepoPalette** once.

3. Add the generated image to your Profile `README.md`:

```markdown
![GitHub languages](./assets/top-langs.svg)
```

The workflow will update the files every Monday when the statistics change. The readable `@v0.1.0` release tag is also available, but the full commit SHA above is safer for a workflow with write access.

## Customize it

Add a `with` block to the **Generate language chart** step. For example:

```yaml
with:
  top: "8"
  title: My Languages
  exclude-repositories: "demo,sandbox"
  exclude-languages: "HTML,CSS"
```

See [`action.yml`](action.yml) for every input and output.

## What gets counted?

- Public repositories owned by the selected GitHub account.
- Forks are excluded. Archived repositories are excluded by default.
- Language percentages use GitHub's language byte counts.
- The result does not measure skill, time spent, code quality, or AI authorship.

RepoPalette also writes `assets/top-langs-data.json`, which lists included and excluded repositories and the reasons for each exclusion.

## Development

RepoPalette requires Node.js 24 or newer and has no runtime dependencies.

```bash
npm run check
```

See the [changelog](CHANGELOG.md), [product decisions](docs/PRODUCT_DECISIONS.md), and [MIT license](LICENSE).
