# RepoPalette

> Generate a validated GitHub programming-language SVG and auditable data from your public, owned repositories.<br/>**根据你名下的公开仓库，生成经过校验的 GitHub 编程语言 SVG 和可核对数据。**

RepoPalette collects language data from your public, owned GitHub repositories and writes a validated SVG plus an auditable JSON file into your own repository.<br/>**RepoPalette 汇总你名下公开 GitHub 仓库的语言数据，并将经过校验的 SVG 和可核对的 JSON 文件写入你自己的仓库。**

## Status

RepoPalette is in its first extraction phase. The proven statistics core has moved out of the `onovich/onovich` Profile repository and now runs as a standalone, dependency-free JavaScript Action.<br/>**RepoPalette 目前处于第一阶段：已经将经过验证的统计核心从 `onovich/onovich` Profile 仓库迁出，并封装成零运行时依赖的独立 JavaScript Action。**

- Available now: complete public-repository pagination, language aggregation, filtering, validated SVG/JSON output, retries, and fail-safe file replacement.<br/>**当前可用：完整公开仓库分页、语言汇总、筛选、SVG/JSON 校验输出、失败重试，以及安全文件替换。**
- Current renderer: `bars` with the `light` theme, retained as the behavior-compatibility baseline.<br/>**当前渲染器：`bars` + `light`，作为行为兼容基线保留。**
- Planned renderers: redesigned `bars`, `orbit`, and `constellation`, followed by additional themes.<br/>**计划中的渲染器：新版 `bars`、`orbit` 和 `constellation`，随后增加更多主题。**

## Why RepoPalette

- It follows every repository page instead of silently stopping at GitHub's first page of results.<br/>**它会继续读取所有仓库分页，不会在 GitHub 第一页结果处悄悄截断。**
- It uses GitHub's automatic workflow token for public repositories, so users do not need to create or store a personal access token.<br/>**统计公开仓库时使用 GitHub 自动提供的工作流令牌，用户无需创建或保管个人访问令牌。**
- It commits ordinary SVG and JSON files to the user's repository; the Profile image does not depend on a third-party rendering endpoint staying online.<br/>**它把普通 SVG 和 JSON 文件保存在用户自己的仓库里；Profile 图片无需依赖第三方实时渲染服务持续在线。**
- It validates both outputs before replacement. If collection or rendering fails, the last successful files remain untouched.<br/>**替换前会同时校验两份输出；如果采集或渲染失败，上一次成功生成的文件会保持不变。**
- The JSON records included repositories, excluded repositories and reasons, filters, byte totals, percentages, and language colors so the displayed result can be checked.<br/>**JSON 会记录实际纳入的仓库、排除的仓库及原因、筛选条件、字节总量、占比和语言颜色，使展示结果可以被核对。**

## Quick Start

Add this workflow to the Profile repository named after your GitHub account, for example `.github/workflows/repopalette.yml`.<br/>**在与你 GitHub 用户名同名的 Profile 仓库中添加以下工作流，例如 `.github/workflows/repopalette.yml`。**

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
        uses: actions/checkout@v7

      - name: Generate language visual
        id: repopalette
        uses: onovich/RepoPalette@main
        with:
          style: bars
          theme: light

      - name: Commit changed outputs
        shell: bash
        env:
          REPOPALETTE_SVG: ${{ steps.repopalette.outputs.svg-path }}
          REPOPALETTE_DATA: ${{ steps.repopalette.outputs.data-path }}
        run: |
          git add -- "$REPOPALETTE_SVG" "$REPOPALETTE_DATA"
          if git diff --cached --quiet; then
            echo "RepoPalette outputs are already current."
            exit 0
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -m "chore(profile): update RepoPalette"
          git push
```

The example intentionally uses `@main` while the project is pre-release. The first stable release will provide the recommended `@v1` reference.<br/>**项目尚未正式发布，因此示例暂时使用 `@main`；首个稳定版本发布后将提供推荐的 `@v1` 引用。**

Embed the generated SVG in the Profile README.<br/>**在 Profile README 中嵌入生成的 SVG。**

```markdown
![GitHub languages](./assets/top-langs.svg)
```

Run the workflow once from the Actions tab. Future scheduled runs will update the files only when the statistics change.<br/>**在 Actions 页面手动运行一次；之后定时任务只会在统计结果变化时更新文件。**

## Configuration

The only presentation inputs are `style` and `theme`. During Phase 1 their supported values are deliberately limited to `bars` and `light`; unsupported values fail clearly rather than pretending to apply a design.<br/>**展示层只提供 `style` 和 `theme` 两项核心输入。第一阶段有意只支持 `bars` 和 `light`；传入尚未实现的值会明确失败，不会假装已经应用某种设计。**

Advanced collection inputs are optional.<br/>**以下采集类高级输入均为可选。**

- `username`: account to analyze; defaults to the current repository owner.<br/>**`username`：要分析的账号；默认使用当前仓库所有者。**
- `top`: number of displayed languages, from 1 to 12; defaults to `6`.<br/>**`top`：展示语言数量，范围为 1–12；默认 `6`。**
- `include-archived`: include archived repositories; defaults to `false`.<br/>**`include-archived`：是否包含归档仓库；默认 `false`。**
- `exclude-repositories`: comma-separated repository names to omit.<br/>**`exclude-repositories`：要排除的仓库名称，使用逗号分隔。**
- `exclude-languages`: comma-separated language names to omit.<br/>**`exclude-languages`：要排除的语言名称，使用逗号分隔。**
- `title`: SVG title; defaults to `Most Used Languages`.<br/>**`title`：SVG 标题；默认 `Most Used Languages`。**
- `width`: SVG width from 320 to 800 pixels; defaults to `400`.<br/>**`width`：SVG 宽度，范围为 320–800 像素；默认 `400`。**
- `output-directory`: repository-relative output directory; defaults to `assets`.<br/>**`output-directory`：相对于仓库的输出目录；默认 `assets`。**

## Data Scope

The default statistics include public repositories owned by the selected account, exclude forks, and exclude archived repositories. Repository and language exclusions are applied after collection.<br/>**默认统计所选账号名下的公开自有仓库，排除 fork，并排除归档仓库；仓库和语言排除项在采集后应用。**

RepoPalette reports language byte counts from GitHub's language data. It does not claim to measure proficiency, time spent, code quality, or whether code was written by AI.<br/>**RepoPalette 展示 GitHub 语言数据中的字节量；它不声称衡量熟练度、投入时间、代码质量，也不判断代码是否由 AI 编写。**

## Local Development

Node.js 24 or newer is required. The project has no runtime dependencies.<br/>**本项目要求 Node.js 24 或更高版本，并且没有运行时依赖。**

```bash
npm test
npm run check
```

To generate locally, edit `repopalette.config.json`, provide an authenticated GitHub token through the environment, and run the generator.<br/>**如需在本地生成，请编辑 `repopalette.config.json`，通过环境变量提供已认证的 GitHub 令牌，然后运行生成器。**

```bash
GITHUB_TOKEN="$(gh auth token)" npm run generate
```

Generated files are written to `assets/top-langs.svg` and `assets/top-langs-data.json`.<br/>**生成文件写入 `assets/top-langs.svg` 和 `assets/top-langs-data.json`。**

## Roadmap

The agreed product direction, competitive positioning, renderer roadmap, and optional self-declared coding-style concept are recorded in [`docs/PRODUCT_DECISIONS.md`](docs/PRODUCT_DECISIONS.md).<br/>**已经确认的产品方向、竞争定位、渲染器路线图，以及可选的用户自声明编程方式设想，记录在 [`docs/PRODUCT_DECISIONS.md`](docs/PRODUCT_DECISIONS.md) 中。**

## License

RepoPalette is available under the MIT License.<br/>**RepoPalette 采用 MIT License。**
