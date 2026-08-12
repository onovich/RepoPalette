# Install RepoPalette with an AI coding agent

This file is an installation contract for an AI agent working in a GitHub Profile repository.

## Goal

Install RepoPalette with its safe defaults, run it once, and verify that the language chart appears in the Profile README.

## Preconditions

- Confirm that the current repository is the user's Profile repository: its name should match its owner.
- Preserve all existing user content and unrelated changes.
- If the agent cannot edit the repository or run GitHub Actions, make the file change and tell the user exactly how to run the workflow in the GitHub UI.

## Required change

Create `.github/workflows/repopalette.yml` with exactly this content:

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
    uses: onovich/RepoPalette/.github/workflows/profile.yml@d15d0c57a8d71461fc247819fb041b95aab0b9a6 # v0.6.1
```

Commit and push only the intended installation change. Do not create a personal access token, repository secret, hosted service, or dependency lockfile.

## Run and verify

1. Push the installation commit to the default branch. Its `push` trigger starts the first `RepoPalette` run automatically.
2. Wait for the run to complete successfully. If it did not start, use `gh workflow run repopalette.yml` with an authenticated GitHub CLI or direct the user to **Actions → RepoPalette → Run workflow**.
3. Verify that `assets/top-langs.svg` and `assets/top-langs-data.json` exist.
4. Verify that `README.md` contains exactly one block between `<!-- repopalette:start -->` and `<!-- repopalette:end -->` and that the rest of the README is preserved.
5. Report the changed files and the workflow run result.

The workflow uses the `ribbon` layout with the `paper` theme, checks every Monday, and replaces only its own marked README block on later runs.

For requested customization, follow [Advanced usage](ADVANCED_USAGE.md). Do not add optional settings unless the user asks for them.
