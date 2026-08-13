# Advanced usage

The short workflow in the main README is recommended for most Profile repositories. This guide covers optional settings and the lower-level Action.

## Customize the reusable workflow

Add a `with` block to the `update` job:

```yaml
jobs:
  update:
    uses: onovich/RepoPalette/.github/workflows/profile.yml@d15d0c57a8d71461fc247819fb041b95aab0b9a6 # v0.6.1
    with:
      style: matrix
      theme: midnight
      top: 8
      show-branding: true
```

Available layouts are `bars`, `orbit`, `constellation`, `ribbon`, `bead-halo`, `matrix`, `halo`, `treemap`, `voronoi`, and `prism`. Themes are `light`, `paper`, `midnight`, `aurora`, `terminal`, and `neon`. Browse the [gallery](GALLERY.md) before choosing.

## Combined Manual Coding and Vibe Coding view

This is an optional grouping declared by the profile owner, not AI detection. Languages listed in `manual-languages` go to the Manual Coding section; all other and future languages go to the Vibe Coding section.

```yaml
jobs:
  update:
    uses: onovich/RepoPalette/.github/workflows/profile.yml@d15d0c57a8d71461fc247819fb041b95aab0b9a6 # v0.6.1
    with:
      coding-mode: split
      manual-languages: "C#,ShaderLab,HLSL,GLSL"
```

The reusable workflow keeps both groups in one SVG. When both groups contain data, the title, repository scope, outer card, and optional RepoPalette watermark appear once. A shared rail shows each group's share of all language bytes; percentages inside each section show that group's own language composition. Manual uses a theme-aware warm palette and Vibe a cool palette. Their primary colors repeat in the shared rail, section marks, chart, and legend so the relationship remains visible across every layout.

If only one group contains data, RepoPalette removes the empty section and redundant shared rail, expands the remaining chart to the full card width, and uses the selected theme's regular multi-language palette. The grouping remains recorded in the SVG metadata and audit JSON.

## Use the Action directly

Use the Action directly when you need titles, width, archived repositories, or repository and language exclusions. In this mode you control checkout, committing, and README placement yourself.

```yaml
- name: Generate RepoPalette
  id: repopalette
  uses: onovich/RepoPalette@e4b4dea8b8725de720a9d9d16468f4c5f4413209 # v0.6.1 implementation
  with:
    style: ribbon
    theme: paper
    title: Languages
    exclude-repositories: "old-demo,generated-site"
    exclude-languages: "HTML,CSS"
    show-branding: false
```

The Action defaults to the repository owner's public repositories and GitHub's temporary workflow token. It never needs a personal access token for that scope. See [`action.yml`](../action.yml) for every input and output.

The block above is the generation step. For a complete checkout, verification, and commit example, start from the pinned [reusable workflow implementation](../.github/workflows/profile.yml) and add only the inputs you need. If you move the two RepoPalette marker lines in your Profile README, keep them in order and move the whole block; later runs will update it in that location.

## Generated files

- Both display modes: `assets/top-langs.svg`
- Audit data: `assets/top-langs-data.json`

After a successful upgrade, RepoPalette removes the legacy `top-langs-manual.svg` and `top-langs-vibe.svg` pair. The deprecated `manual-svg-path` and `vibe-svg-path` Action outputs remain present but empty for compatibility.

The data file records language totals and the repositories included or excluded. Generated files are validated before replacement, so a failed update does not overwrite the last valid result.

## Troubleshooting scheduled updates

GitHub may disable scheduled workflows in a public repository after 60 days without repository activity. If Monday checks stop appearing, open the repository's **Actions** tab, enable the `RepoPalette` workflow if prompted, and run it manually once. This is a [GitHub scheduling rule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), not a RepoPalette account or server outage.

Repository rules or branch protection can also block the workflow's commit. In that case, allow the GitHub Actions bot to update the Profile branch or use the Direct Action workflow to adopt your repository's pull-request policy.
