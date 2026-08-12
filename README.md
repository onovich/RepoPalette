# RepoPalette

[简体中文](README.zh-CN.md)

[![CI](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml/badge.svg)](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/onovich/RepoPalette?include_prereleases)](https://github.com/onovich/RepoPalette/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A language-composition chart for your GitHub Profile—designed to look intentional, stay accurate, and update itself.

RepoPalette reads your public repositories, creates an SVG in your Profile repository, and checks for changes every Monday.

One small file, one commit. No separate account, secret key, or image server to set up.

![RepoPalette ribbon preview](docs/gallery/ribbon-paper.svg)

## Quick start

### Install with AI

If an AI coding agent can edit your Profile repository, paste this message into it:

> Install RepoPalette in this GitHub Profile repository. Follow https://github.com/onovich/RepoPalette/blob/a99ae0dfc85ae77c61bb003138ae72ff65fdc789/docs/INSTALL_WITH_AI.md, use the defaults, and verify the first automatic run.

The guide tells the agent exactly what to change and what to leave alone. You do not need to explain GitHub Actions to it.

### Install yourself

In your Profile repository (`your-name/your-name`), create `.github/workflows/repopalette.yml` and paste:

```yaml
name: RepoPalette
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/repopalette.yml
  schedule:
    - cron: "17 3 * * 1"
permissions:
  contents: write
jobs:
  update:
    uses: onovich/RepoPalette/.github/workflows/profile.yml@c4abbdc8488e4166cde8b25575a4022b174afe5a # v0.5.0
```

<details>
<summary><strong>New to GitHub's file editor?</strong></summary>

Open your Profile repository, choose **Add file → Create new file**, enter `.github/workflows/repopalette.yml` as the file name, paste the block above, then choose **Commit changes**.
</details>

Commit the file. That first commit starts RepoPalette automatically; when the Actions check turns green, the chart is already in your Profile README. It then checks every Monday. **Actions → RepoPalette → Run workflow** remains available whenever you want to refresh it manually.

The readable `@v0.5.0` tag is available after release. The full commit reference above is safer for a workflow that can write to your repository.

## Why RepoPalette?

- **More than a standard bar card.** Ten layouts balance visual character with exact language names and percentages.
- **Your Profile does not depend on a live image service.** The generated chart belongs to your repository and remains visible if a later update fails.
- **The result can be checked.** A readable data file lists the repositories that were included or excluded instead of hiding the counting scope.
- **The setup stays small.** The short workflow handles generation, validation, README placement, and future updates.

[Compare all layouts and themes in the gallery.](docs/GALLERY.md)

## Common questions

<details>
<summary><strong>I do not have a Profile repository yet. What should I do?</strong></summary>

[Create a public repository](https://github.com/new?visibility=public) whose name exactly matches your GitHub username, initialize it with a README, then follow the Quick start above. GitHub will display that README on your Profile.
</details>

<details>
<summary><strong>What gets counted?</strong></summary>

Public repositories owned by your account. Forks are excluded, archived repositories are excluded by default, and percentages use GitHub's language byte counts. New public repositories are picked up on the next run. GitHub may pause schedules in a public repository after 60 days without repository activity; if that happens, re-enable the workflow in Actions and run it once. [Details](docs/ADVANCED_USAGE.md#troubleshooting-scheduled-updates)
</details>

<details>
<summary><strong>Do I need to create a secret or personal token?</strong></summary>

No. GitHub gives each run a temporary permission slip, then expires it. You do not create or store a long-lived private key, register another account, or deploy a server.
</details>

<details>
<summary><strong>Why does the workflow need write permission?</strong></summary>

Only to save the generated chart and data in your Profile repository and maintain its small marked section in `README.md`. It does not write to the repositories being measured.
</details>

<details>
<summary><strong>Does it measure skill or detect AI-written code?</strong></summary>

No. It reports language composition, not ability, time, quality, or authorship. An optional combined Manual/Vibe view is available only as a grouping you declare yourself.
</details>

## Need more control?

The default is `ribbon` with the `paper` theme. See the [gallery](docs/GALLERY.md) to choose a look, then use the [advanced guide](docs/ADVANCED_USAGE.md) for themes, filters, titles, branding, the combined Manual/Vibe view, or the lower-level Action. Every input is also listed in [`action.yml`](action.yml).

Contributors need Node.js 24 or newer and can run `npm run check`. See the [changelog](CHANGELOG.md), [product decisions](docs/PRODUCT_DECISIONS.md), and [MIT license](LICENSE).
