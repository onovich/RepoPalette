# RepoPalette Agent Notes

## Source of truth

- The canonical local workspace is `D:\GithubProjects\RepoPalette`.
- The public remote is `git@github.com:onovich/RepoPalette.git`.
- Product behavior and non-goals are recorded in `docs/PRODUCT_DECISIONS.md`; do not infer a broader product promise from experiments or research notes.
- Treat the old `C:\Users\Administrator\Documents\Playground 2\RepoPalette` checkout as a retained migration safety copy, not an active workspace.

## Product invariants

- RepoPalette is a GitHub Action and public reusable workflow, not a hosted image service or GitHub App.
- Public-repository statistics work with the repository-scoped `GITHUB_TOKEN`; do not introduce a personal access token into the default path.
- Generated SVG and audit JSON belong to the user's repository. A failed refresh must preserve the last valid outputs.
- Default language percentages use GitHub language bytes and expose included/excluded repository audit details.
- Manual/Vibe grouping is opt-in and user-declared. Do not claim to detect AI-authored code.
- One non-empty coding group renders full width with the regular multi-language palette; two non-empty groups use the documented warm Manual / cool Vibe mapping.
- Zero-byte languages are omitted. Non-zero values below 0.1% remain visibly distinguishable and must not be labelled as zero.

## Editing and validation

- Node.js 24 or newer is required.
- Run `npm run check` before every commit or push. The suite currently covers syntax, 98 tests, gallery stability, release text, workflow pins, and cross-platform SVG determinism.
- Renderer changes must keep `docs/gallery/` synchronized and preserve accessible static SVG output.
- Installation changes must keep the README, reusable workflow, Action metadata, and fixed full-SHA pin chain aligned.
- Write release-facing text as UTF-8 without BOM.
- Keep the concise English README as the default and retain the Simplified Chinese entry near the top.

## Git workflow

- Use `project-git-workflow` / `git-flow` and the configuration in `.codex/project-git-workflow.json`.
- Preserve unrelated user changes and stage selected paths deliberately.
- Do not force-push or recreate deleted historical branches merely to mirror an older checkout.

## Release and external-action boundaries

- The current public Marketplace release is `v0.7.0`.
- Follow `docs/MARKETPLACE_RELEASE.md` and update `CHANGELOG.md` before a future release.
- Publishing releases, changing Marketplace metadata, posting promotional material, messaging testers, and uploading repository artwork each require explicit user authorization.
- Use `docs/LAUNCH_KIT.md` for approved launch copy and `docs/PROMOTION_AND_SEO_RESEARCH.md` for rollout priorities.
