# GitHub Marketplace release

RepoPalette is published as a GitHub Action, not a GitHub App. The root `action.yml` is the Marketplace product; the public reusable workflow remains the easiest installation path for most GitHub Profile users.

## Listing position

- Name: `RepoPalette`
- Description: `Generate validated, self-updating GitHub Profile language charts and auditable data in your own repository.`
- Primary category: `Reporting`
- Secondary category: `Utilities`
- Recommended user path: the one-file Quick start in the main README
- Advanced user path: the lower-level Action shown in the advanced guide

## Release gate

Publish the Marketplace listing only from a release whose tag contains the current `action.yml`, implementation, tests, and documentation. For the present work, merge the feature pull request first and then create the next minor release from `main`.

Before publishing:

- Confirm the repository is public and contains exactly one root Action metadata file.
- Open `action.yml` on GitHub and use **Draft a release** from the Marketplace banner.
- Select **Publish this Action to the GitHub Marketplace**.
- Resolve any metadata validation messages and confirm the `RepoPalette` name is available.
- Accept the GitHub Marketplace Developer Agreement if GitHub prompts for it.
- Choose `Reporting` and `Utilities`, create the version tag from `main`, and publish with two-factor authentication.
- Open the resulting Marketplace page and verify the description, README, inputs, icon, categories, and install example.

GitHub publishes qualifying Actions immediately without a manual review. See GitHub's official [Marketplace publishing guide](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace).
