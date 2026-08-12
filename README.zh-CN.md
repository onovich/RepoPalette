# RepoPalette

[English](README.md)

[![CI](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml/badge.svg)](https://github.com/onovich/RepoPalette/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/onovich/RepoPalette?include_prereleases)](https://github.com/onovich/RepoPalette/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

根据你的公开 GitHub 仓库生成编程语言构成图。

RepoPalette 在 GitHub Actions 中运行，把经过校验的 SVG 和审计数据直接保存到你的 Profile 仓库。统计公开仓库时使用 GitHub 内置令牌，无需创建个人访问令牌，也无需部署在线服务。

[![RepoPalette 实际示例](https://raw.githubusercontent.com/onovich/onovich/main/assets/top-langs.svg)](https://github.com/onovich/onovich/blob/main/assets/top-langs-data.json)

> **预览版说明：** v0.1 当前提供 `bars` 布局和 `light` 主题，后续会增加更多布局和主题。

## 为什么使用 RepoPalette？

- 配置一次，之后由定时工作流自动更新。
- 读取公开仓库列表的全部分页，不会统计到一半就停止。
- SVG 和 JSON 保存在你自己的仓库，不依赖实时图片服务。
- 更新失败时保留上一张有效图片，并可通过审计 JSON 核对统计范围。

## 快速开始

1. 在你的 GitHub Profile 仓库（`你的用户名/你的用户名`）中创建 `.github/workflows/repopalette.yml`，内容如下：

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

2. 打开仓库的 **Actions** 页面，手动运行一次 **Update RepoPalette**。

3. 在 Profile 的 `README.md` 中加入生成的图片：

```markdown
![GitHub languages](./assets/top-langs.svg)
```

工作流会在每周一检查统计变化，有变化时才提交文件。你也可以使用更易读的 `@v0.1.0` Release 标签；不过工作流拥有写权限时，上方固定的完整提交 SHA 更安全。

## 自定义

在 **Generate language chart** 步骤中添加 `with`。例如：

```yaml
with:
  top: "8"
  title: My Languages
  exclude-repositories: "demo,sandbox"
  exclude-languages: "HTML,CSS"
```

所有输入与输出见 [`action.yml`](action.yml)。

## 统计范围

- 统计所选 GitHub 账号拥有的公开仓库。
- 排除 fork；默认排除归档仓库。
- 语言占比基于 GitHub 提供的语言字节数。
- 结果不代表熟练度、投入时间、代码质量，也不判断代码是否由 AI 编写。

RepoPalette 还会生成 `assets/top-langs-data.json`，列出纳入和排除的仓库，以及每项被排除的原因。

## 开发

RepoPalette 需要 Node.js 24 或更高版本，并且没有运行时依赖。

```bash
npm run check
```

另见[版本记录](CHANGELOG.md)、[产品决策](docs/PRODUCT_DECISIONS.md)和 [MIT 许可证](LICENSE)。
