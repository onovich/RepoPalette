# Code token statistics feasibility

Research date: 2026-08-13

## Executive conclusion

RepoPalette can add code-token statistics, but the product must distinguish three different promises:

1. **Estimated current tokens** derived from GitHub language byte totals: easy, fast, and compatible with the current metadata-only architecture, but not an exact token count.
2. **Exact current-snapshot tokens** calculated from source files on each repository's default branch: feasible with moderate implementation effort. The hard part is safely selecting and downloading the right files, not running the tokenizer.
3. **Historical tokens authored over time** calculated across commits: substantially harder and semantically ambiguous. It should not be the MVP.

The recommended product is an opt-in **Token Footprint** metric or card that scans the current default-branch snapshot, pins the tokenizer and policy versions, and caches every repository by its head commit SHA.

## What “token” means

An LLM token count is not a universal property of a source file. It depends on a named tokenizer/encoding. OpenAI's `tiktoken`, for example, can select an encoding for a particular model, and its own guidance says that about four bytes per token is only an average rule of thumb, not an exact conversion ([tiktoken README](https://github.com/openai/tiktoken/blob/main/README.md?plain=1), [model-to-encoding mapping](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py)).

Therefore an auditable result must record at least:

- tokenizer and encoding name;
- tokenizer version;
- file-selection policy version;
- repository and default-branch head SHA;
- scanned and skipped files, including skip reasons;
- whether the result is complete or partial.

Programming-language lexer tokens (identifiers, operators, keywords) and LLM/BPE tokens are different metrics. This proposal concerns LLM/BPE tokens.

## Fit with the current implementation

RepoPalette currently asks GitHub for repository metadata and Linguist language byte totals. It neither lists files nor downloads repository contents. This is why the existing language card remains lightweight.

GitHub Linguist, which backs GitHub's language breakdowns, ignores binary and vendored files and suppresses generated files according to its rules; repositories can override those classifications with `.gitattributes` ([GitHub Linguist](https://github.com/github-linguist/linguist), [Linguist overrides](https://github.com/github-linguist/linguist/blob/main/docs/overrides.md)). An exact token scanner should follow equivalent exclusions where practical, otherwise its totals will disagree with the language card and can be inflated by dependencies or generated output.

The current local profile audit contains 168 repositories, 167 included repositories, and 55,176,649 language bytes. Dividing by four gives roughly 13.8 million tokens, but this is only an illustrative estimate based on the tokenizer rule of thumb. It must not be presented as an exact result.

## Feasibility levels

| Level | What it measures | Engineering estimate | Main limitation |
| --- | --- | ---: | --- |
| Byte-based estimate | Current GitHub language bytes divided by a documented heuristic | 0.5–2 days | Can be materially wrong; must say “estimated” |
| Exact current snapshot | Selected source files on every default branch, using one pinned tokenizer | Prototype 2–3 days; production 1–2 weeks | Requires safe downloads, filtering, limits, caching, and audit output |
| Full Git history | Tokens added/removed across commits | 3–6+ weeks | Merges, renames, reverts, generated code, authorship aliases, and deleted code make the meaning debatable |

These are engineering estimates for RepoPalette's current Node-based Action, not guarantees.

## Recommended exact-snapshot architecture

1. Extend repository discovery to collect the default-branch head SHA.
2. Compare each repository with a committed cache manifest. Unchanged SHAs reuse their previous token result.
3. For changed public repositories, download a default-branch archive or use a shallow checkout. GitHub's archive endpoint supports public read access ([repository archive API](https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-tar)).
4. Extract defensively without executing repository code. Do not run package managers, hooks, build scripts, submodules, or external symlink targets.
5. Skip binary, generated, vendored, documentation, minified, Git LFS, oversized, and user-excluded paths. Apply per-file, per-repository, and total-download limits.
6. Tokenize accepted text with a pinned encoding, then aggregate by repository, language, and manual/vibe group.
7. Commit only the compact audit/cache JSON and generated SVG. Never commit downloaded source.
8. If a scan is incomplete, either preserve the last known-good result or label it explicitly as partial; never silently call it complete.

Fetching every blob through GitHub's REST API is a poor default. The Contents API caps a directory response at 1,000 files and does not support files over 100 MB; recursive Git trees are capped at 100,000 entries or 7 MB and may be truncated ([Contents API limits](https://docs.github.com/en/rest/repos/contents#get-repository-content), [Git Trees limits](https://docs.github.com/en/rest/git/trees#get-a-tree)). GitHub also rate-limits `GITHUB_TOKEN` REST requests to 1,000 per hour per repository, while unauthenticated public requests get 60 per hour per originating IP ([REST API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)). Archive/shallow-download plus SHA caching is therefore simpler and more reliable than one API request per file.

## Authentication boundary

The feature can preserve RepoPalette's no-PAT experience for **public repositories** by using public archives or public clones. The workflow's built-in `GITHUB_TOKEN` is limited to the repository containing that workflow, so it cannot become a general private-repository reader ([GitHub `GITHUB_TOKEN`](https://docs.github.com/en/actions/concepts/security/github_token)).

Scanning private repositories would require a separately authorized PAT or GitHub App installation. That is a different product tier and weakens the current no-secret positioning, so it should be deferred.

## Packaging cost

RepoPalette currently runs as a dependency-light Node Action. OpenAI's official `tiktoken` implementation is primarily a Rust-backed Python package; OpenAI documents a community-supported JavaScript implementation rather than an official first-party JS package ([OpenAI Tokenizer](https://platform.openai.com/tokenizer)). Production implementation must therefore choose among:

- invoking the runner's Python environment and pinning `tiktoken`;
- bundling a reviewed native/WASM tokenizer for Node;
- implementing a clearly labeled approximation.

This packaging and cross-platform testing work is one reason the production estimate is higher than the tokenizer algorithm alone suggests.

## Product recommendation

- Do not add an unlabeled number to the existing default language card.
- Add an opt-in `token-footprint` mode or separate card.
- Define the first release as **current default-branch source snapshot**, not lifetime authorship.
- Default to a pinned encoding and show it in audit JSON; the SVG can use a short label such as `13.2M code tokens` with an info note in documentation.
- Before shipping, benchmark the exact scanner against the current 167 included repositories and measure download size, runtime, skipped files, cache hit rate, and divergence from the byte/4 estimate.

The best next step is a non-releasing benchmark prototype. It will answer the only important unknowns that documentation cannot: how much source must be downloaded for this particular account, how long the first run takes, and whether later SHA-cached runs stay comfortably lightweight.
