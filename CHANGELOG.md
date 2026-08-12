# Changelog

All notable changes to RepoPalette are recorded here.<br/>**RepoPalette 的重要变更记录在此。**

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).<br/>**本文档采用 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。**

## [Unreleased]

## [0.5.0] - 2026-08-13

### Changed

- User-declared Manual/Vibe groups now share one SVG, one outer card, one header, and one watermark. A shared rail shows the groups' overall byte shares while each section keeps exact within-group language percentages.<br/>**用户声明的 Manual/Vibe 分组现在共用一张 SVG、一个外框、一个标题区和一个水印；共享总览带显示两组占全部字节的比例，各分区仍保留准确的组内语言百分比。**
- Split mode now writes `top-langs.svg` and removes the legacy two-file pair after a valid update. The old dedicated path outputs remain as empty compatibility fields.<br/>**分组模式现在写入 `top-langs.svg`，并在有效更新后清理旧的双文件；原有独立路径输出保留为空的兼容字段。**

## [0.4.0] - 2026-08-13

### Added

- A public reusable workflow reduces the default installation to one short file and one commit.<br/>**增加公共可复用工作流，将默认安装压缩为一个短文件和一次提交。**
- The first installation commit generates the chart automatically, maintains an idempotent marked block in the Profile README, and keeps weekly updates.<br/>**首次安装提交会自动生成图表，在 Profile README 中幂等维护带标记的区块，并保留每周更新。**
- A focused AI-agent installation contract and a separate advanced usage guide.<br/>**增加面向 AI 编程工具的安装约定，以及独立的高级使用说明。**
- `update-readme` and `readme-path` provide opt-in README placement for direct Action users.<br/>**为直接使用 Action 的用户增加可选的 `update-readme` 与 `readme-path`。**

### Changed

- Reworked both READMEs around a low-pressure beginner path, plain-language FAQs, and a clear advanced escape hatch.<br/>**围绕低心智压力的新手路径、大白话常见问题和清晰的高级入口重写中英文 README。**
- The default quick-start design is now `ribbon` with the `paper` theme.<br/>**Quick Start 默认视觉改为 `ribbon` 布局和 `paper` 主题。**

## [0.3.0] - 2026-08-13

### Added

- Optional, user-declared Manual Coding and Vibe Coding SVG outputs, disabled by default.<br/>**增加默认关闭、由用户主动声明的 Manual Coding 与 Vibe Coding 双 SVG 输出。**
- `show-branding` controls the small `RepoPalette` watermark, which remains enabled by default.<br/>**增加 `show-branding` 配置，用于控制默认开启的小号 `RepoPalette` 署名。**
- Schema v3 audit data records the classification rule, declared manual languages, and both group totals.<br/>**schema v3 审计数据会记录分组规则、用户声明的手动语言以及两组汇总。**
- Dedicated `manual-svg-path` and `vibe-svg-path` Action outputs for split mode.<br/>**分组模式新增独立的 `manual-svg-path` 与 `vibe-svg-path` Action 输出。**

### Changed

- Layout names such as `RIBBON` are no longer printed inside the SVG; machine-readable `data-style` metadata is retained.<br/>**SVG 画面中不再显示 `RIBBON` 等布局名称，同时保留机器可读的 `data-style` 元数据。**
- Split charts show within-group language composition and disclose each group's share of all language bytes.<br/>**双图按组内语言构成展示，并明确标出该组占全部语言字节的比例。**

## [0.2.0] - 2026-08-13

### Added

- Purpose-built `orbit` and `constellation` layouts with exact percentage legends.<br/>**增加专门设计的 `orbit` 与 `constellation` 布局，并保留准确的百分比图例。**
- Seven proportional layouts: `ribbon`, `bead-halo`, `matrix`, `halo`, `treemap`, `voronoi`, and `prism`.<br/>**增加七种比例构成布局：`ribbon`、`bead-halo`、`matrix`、`halo`、`treemap`、`voronoi` 与 `prism`。**
- Six independent themes: `light`, `paper`, `midnight`, `aurora`, `terminal`, and `neon`.<br/>**增加六套可独立选择的主题：`light`、`paper`、`midnight`、`aurora`、`terminal` 与 `neon`。**
- A checked-in comparison gallery generated from deterministic fixture data.<br/>**增加由固定示例数据生成并纳入版本管理的对比画廊。**
- Closed composition layouts add an explicit `Other` remainder when Top-N languages do not sum to 100%.<br/>**当 Top-N 语言不足 100% 时，封闭构成图会明确加入 `Other` 剩余项。**
- Public `style` and `theme` inputs for both the Action and local configuration.<br/>**Action 与本地配置均可通过公开的 `style` 和 `theme` 输入选择视觉方案。**

### Changed

- Redesigned `bars` with a language spectrum, ranked rows, and clearer information hierarchy.<br/>**重新设计 `bars`，增加语言光谱、排名行和更清晰的信息层级。**
- Refined the `paper` theme around the ivory, blue, blush, and coral reference palette.<br/>**依据象牙白、蓝色、淡粉与珊瑚色参考配色优化 `paper` 主题。**
- All layouts now share accessible descriptions, self-contained SVG output, responsive widths from 320 to 800 pixels, and support for up to 12 languages.<br/>**所有布局现在共享可访问性描述、自包含 SVG 输出、320 至 800 像素宽度适配，并支持最多 12 种语言。**

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

[Unreleased]: https://github.com/onovich/RepoPalette/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/onovich/RepoPalette/releases/tag/v0.5.0
[0.4.0]: https://github.com/onovich/RepoPalette/releases/tag/v0.4.0
[0.3.0]: https://github.com/onovich/RepoPalette/releases/tag/v0.3.0
[0.2.0]: https://github.com/onovich/RepoPalette/releases/tag/v0.2.0
[0.1.0]: https://github.com/onovich/RepoPalette/releases/tag/v0.1.0
