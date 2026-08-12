# Changelog

All notable changes to RepoPalette are recorded here.<br/>**RepoPalette 的重要变更记录在此。**

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).<br/>**本文档采用 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。**

## [Unreleased]

### Planned

- Redesigned `bars`, plus `orbit` and `constellation` layouts.<br/>**重新设计 `bars`，并增加 `orbit` 与 `constellation` 布局。**
- Additional themes and a preview gallery.<br/>**增加更多主题与预览画廊。**
- Optional user-declared coding-style grouping, disabled by default.<br/>**增加默认关闭、由用户主动声明的编程方式分组。**

## [0.1.0] - 2026-08-12

### Added

- Standalone, dependency-free JavaScript Action running on Node.js 24.<br/>**独立、零运行时依赖、基于 Node.js 24 的 JavaScript Action。**
- Complete pagination across public repositories owned by the selected account.<br/>**完整翻页采集所选账号拥有的公开仓库。**
- Language aggregation with repository, language, archive, and fork filtering.<br/>**支持仓库、语言、归档状态与 fork 筛选的语言汇总。**
- Validated SVG output and schema v2 audit JSON with included and excluded repository scope.<br/>**生成经过校验的 SVG，以及记录纳入和排除仓库范围的 schema v2 审计 JSON。**
- Retry handling, complete language fallback, deterministic rendering, and last-good-output preservation.<br/>**支持失败重试、完整语言数据回退、确定性渲染和上一份有效输出保护。**
- Action outputs for generated paths and collection counts.<br/>**提供生成文件路径与采集数量等 Action 输出。**
- Cross-platform CI on Linux, Windows, and macOS, plus a live Action smoke test.<br/>**提供 Linux、Windows、macOS 三平台 CI 与真实 Action 冒烟测试。**
- End-to-end adoption in the author's live GitHub Profile repository.<br/>**已在作者的真实 GitHub Profile 仓库中完成端到端接入。**

### Preview Limitations

- The only available renderer is `bars` with the `light` theme.<br/>**当前仅提供 `bars` 布局与 `light` 主题。**
- Collection is limited to public repositories owned by a GitHub user.<br/>**采集范围限于 GitHub 用户拥有的公开仓库。**
- Historical timelines, hosted dashboards, automatic AI-code detection, and Marketplace publication are not included.<br/>**暂不包含历史时间线、托管仪表盘、AI 代码自动检测与 Marketplace 上架。**

[Unreleased]: https://github.com/onovich/RepoPalette/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/onovich/RepoPalette/releases/tag/v0.1.0
