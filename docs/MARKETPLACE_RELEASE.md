# GitHub Marketplace release

RepoPalette is published as a GitHub Action, not a GitHub App. The root `action.yml` is the Marketplace product; the public reusable workflow remains the easiest installation path for most GitHub Profile users.

## Listing position

- Name: `RepoPalette`
- Description: `Generate validated, self-updating GitHub Profile language charts and auditable data in your own repository.`
- Primary category: `Utilities`
- Secondary category: `Reporting`
- Recommended user path: the one-file Quick start in the main README
- Advanced user path: the lower-level Action shown in the advanced guide

## Release gate

Publish the Marketplace listing only from a release whose tag contains the current `action.yml`, implementation, tests, and documentation.

## Published release

- Marketplace: [RepoPalette](https://github.com/marketplace/actions/repopalette)
- First Marketplace release: [`v0.7.0`](https://github.com/onovich/RepoPalette/releases/tag/v0.7.0)
- Published: 2026-08-13
- Categories: `Utilities` and `Reporting`
- Validation: release tag CI, the live Action smoke test, and the public listing all passed

## Future releases

Before publishing:

- Merge the release pull request into `main` before creating the tag.
- Confirm the repository is public and contains exactly one root Action metadata file.
- Open `action.yml` on GitHub and use **Draft a release** from the Marketplace banner.
- Select **Publish this Action to the GitHub Marketplace**.
- Resolve any metadata validation messages and confirm the `RepoPalette` name is available.
- Accept the GitHub Marketplace Developer Agreement if GitHub prompts for it.
- Choose `Utilities` and `Reporting`, create the version tag from `main`, and publish with two-factor authentication.
- Open the resulting Marketplace page and verify the description, README, inputs, icon, categories, and install example.

GitHub publishes qualifying Actions immediately without a manual review. See GitHub's official [Marketplace publishing guide](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace).
