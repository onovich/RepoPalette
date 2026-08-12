# RepoPalette 推广与 SEO 策略研究

> 研究快照：2026-08-13（Asia/Shanghai）
> 范围：GitHub 与 Google 的官方文档、GitHub Marketplace 当前公开页面、RepoPalette 当前公开仓库与本地源码。关键词清单是产品意图假设，不含第三方搜索量估算。

## 结论先行

RepoPalette **需要 SEO，但现在只需要轻量、基础的 SEO**。它首先是一个 GitHub Action，目标用户本来就在 GitHub；当前最短的增长路径不是建设博客矩阵，而是：

1. 让 GitHub 能在仓库名、描述和 Topics 中正确找到它；
2. 让访问者在 README 首屏立即理解差异、看到效果并完成安装；
3. 上架 GitHub Marketplace，获得 Action 专属页面与分类入口；
4. 用默认可关闭的小署名，让每张公开 Profile 图表成为产品示例；
5. 等出现真实安装、常见问题和案例后，再建设可由 Search Console 衡量的 GitHub Pages 落地页。

GitHub 的默认仓库搜索会搜索仓库名、描述和 Topics；README 只有在使用 `in:readme` 时才被纳入仓库搜索。因此，**仓库描述与 Topics 是 GitHub 内部获客入口，README 更偏向访问后的理解与转化**。[GitHub：Searching for repositories](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)

Google 也明确说明：SEO 的重点是帮助搜索引擎理解内容和帮助用户判断是否访问；没有能保证第一名的“技巧”，真正有用、清晰、面向人的内容影响通常更大，而且改动往往要等数周才能评估。[Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## 当前状态与主要缺口

截至快照时，[RepoPalette 公开仓库](https://github.com/onovich/RepoPalette)创建约一天，仓库 API 显示 0 stars、0 forks、0 subscribers、7 个 Releases、Discussions 未启用、Homepage 为空；已有 Topics 为 `developer-tools`、`github-action`、`github-profile`、`language-statistics`、`profile-readme`、`svg`。[GitHub REST 仓库快照](https://api.github.com/repos/onovich/RepoPalette) 当前 [Marketplace 搜索 RepoPalette](https://github.com/marketplace?type=actions&query=RepoPalette)为 0 结果。

当前 [README](../README.md) 的基础已经较好：英文默认、顶部有中文入口、首屏说明用途、直接给预览和 Quick start，并将高级选项放到后续文档；[Gallery](GALLERY.md) 也已集中展示 10 种布局和多个主题。GitHub 官方同样把 README 定义为访问者通常最先看到、用于说明“做什么、为什么有用、如何开始、去哪里求助”的入口。[GitHub：About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

当前缺口按优先级排序：

- **未进入 Marketplace。** 仓库已有根目录 [`action.yml`](../action.yml)、版本标签与 Releases，已接近发布条件，但 Marketplace 页面还不存在。
- **仓库描述偏实现语言。** 现有描述 `Validated GitHub language SVGs and auditable JSON, generated in your own repository.` 准确，却没有把 `GitHub Profile`、`self-updating`、`language chart` 这些用户意图放在前面。
- **Topic 仍可补一个强意图词。** 现有 Topics 基本准确，缺少 `github-profile-readme`；不需要为了凑满上限加入模糊词。GitHub 允许最多 20 个 Topics，并通过 Topics 页面、相关 Topics 和 `topic:` 查询提供发现入口。[GitHub：Classifying a repository with topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics) · [GitHub：Searching topics](https://docs.github.com/en/search-github/searching-on-github/searching-topics)
- **社交分享识别度待确认。** GitHub 的公开 API 不暴露是否设置了自定义 Social preview，应在仓库 Settings 中人工确认；GitHub 建议使用至少 640×320、最佳 1280×640、1 MB 以下的 PNG/JPG/GIF。[GitHub：Social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
- **缺少外部用户证据。** 目前没有 stars、forks 或公开社区讨论。此时继续扩写大量“SEO 文章”不会解决信任和激活问题，先获得真实安装和可展示案例更重要。

## GitHub 内部发现机制：各入口应承担什么角色

| 入口 | 官方机制 | 对 RepoPalette 的作用 | 优先级 |
| --- | --- | --- | --- |
| 仓库名、Description、Topics | 默认仓库搜索覆盖这三类字段；可用 `topic:`、`in:name`、`in:description` 精确搜索 | 承接“GitHub Profile language chart / stats / Action”等高意图查询 | 最高 |
| README | 仓库访问者通常首先看到；应回答用途、价值、上手和帮助入口 | 把访问转成成功安装；不是堆关键词的页面 | 最高 |
| Marketplace | Action 可通过 Release 发布，并拥有独立页面、版本和分类；页面使用 `action.yml` 元数据 | 获得 Action 专属发现入口与可信的安装上下文 | 最高 |
| Social preview | 仓库链接在社交平台展开时显示自定义图片 | 提升分享识别度和点击意愿 | 高 |
| Gallery | 项目自有的视觉证据页 | 证明“多样式且仍可读”，帮助选择；主要负责转化，不应替代 README Quick start | 高 |
| Releases | Git tag 对应可用版本，可附 release notes；用户可以只订阅新 Release 通知 | 建立版本信任、升级路径和 Marketplace 发布载体；不是靠高频发布刷曝光 | 中高 |
| Discussions | 支持 Q&A、公告、开放讨论、投票、置顶和标记答案 | 有真实用户后沉淀问题、案例和产品反馈；空论坛的价值很低 | 条件启用 |

依据：[仓库搜索](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)、[README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)、[发布 Marketplace Action](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace)、[About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)、[About discussions](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions)。

### Marketplace 的具体判断

RepoPalette 应上架为 **GitHub Action，不是 GitHub App**。GitHub 官方要求 Action 位于公开仓库、根目录只有一个 `action.yml`/`action.yaml`、`name` 唯一，并通过一个 Release 选择发布到 Marketplace；符合条件的 Action 会立即发布而非经过人工审核。[GitHub：Publishing actions in GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace)

推荐分类：

- Primary：`Utilities`——当前 Marketplace 将其描述为增强 GitHub 使用体验的辅助工具，且同页已有 Profile SVG/统计类 Action。[Marketplace Utilities Actions](https://github.com/marketplace?category=utilities&type=actions)
- Secondary：`Reporting`——RepoPalette 的确生成统计报告，但该分类更偏开发过程洞察，因此放第二。[Marketplace Reporting Actions](https://github.com/marketplace?category=reporting&type=actions)

发布前要解决一个产品一致性问题：README 的主路径是调用 reusable workflow，而 Marketplace 展示的是根 Action 的 `action.yml`。Marketplace 文案必须明确：最省事的 Profile 安装仍使用短 workflow；直接 Action 适用于希望自己控制 checkout、提交和 README 更新的人。不要让 Marketplace 的“Use latest version”看起来像完整的一键安装。

## 推荐信息架构与关键词

以下是**基于产品意图的关键词假设**，不是搜索量结论。Google 建议同时考虑新手和专业用户可能使用的不同表达，并自然写入有用内容，不要关键词堆砌。[Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) Google 还建议标题清晰、简洁、准确，明确反对重复堆词。[Google：Title links](https://developers.google.com/search/docs/appearance/title-link)

### 英文核心词组

- `GitHub Profile language stats`
- `GitHub Profile language chart`
- `GitHub Profile languages card`
- `self-updating GitHub Profile`
- `GitHub Action for Profile README`
- `GitHub language composition SVG`
- `auditable GitHub language statistics`

### 中文核心词组

- `GitHub 主页语言统计`
- `GitHub Profile 语言卡片`
- `GitHub README 语言占比`
- `GitHub 语言统计 SVG`
- `GitHub Action 个人主页`

### 页面与查询意图映射

| 页面 | 主要意图 | 建议 |
| --- | --- | --- |
| GitHub README | 品牌词 + GitHub Profile language chart/stats | 保持短；首句自然覆盖用途、自动更新、自有 SVG，不额外堆同义词 |
| 中文 README | 中文安装与语言统计查询 | 保持独立中文入口；内容与英文功能一致，但用中文用户真实说法 |
| Marketplace listing | GitHub Action、Profile README、language stats | 用一张主预览、三条差异、短安装路径、权限/数据范围说明 |
| Gallery | language chart layouts、SVG themes | 每种布局有一句选择理由；保留完整 alt text 和回到 Quick start 的入口 |
| Install with AI | install GitHub Action with AI/coding agent | 聚焦“把这句话交给 AI”以及成功标准，避免扩成通用 AI 教程 |
| 未来 GitHub Pages 首页 | 非品牌搜索 + 社交落地 | 只有达到真实安装门槛后再建；首页整合效果、差异、安装、真实案例 |
| 未来 Compare/Examples 页 | 替代方案比较、真实使用案例 | 只写可验证差异；案例必须取得用户同意并链接真实 Profile |

GitHub Pages 不是当前获客的前置条件，但它是以后**真正可控、可量化的外部 SEO 载体**：可以控制页面标题、正文结构和多语言 URL，并验证为自己的 Search Console property。上线时建议英文使用 `/`、中文使用 `/zh/`，两页互相链接并声明对应语言版本；Google 建议不同语言使用不同 URL，并用 `hreflang` 标明关系。[GitHub Pages Quickstart](https://docs.github.com/en/pages/quickstart) · [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080) · [Google：Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

建议直接采用的元数据文案：

- Repository description：`Self-updating GitHub Profile language charts—validated SVG and auditable data, generated in your own repository.`
- README 首句可保留现有方向：`A self-updating language-composition chart for your GitHub Profile—designed to look intentional, stay accurate, and live in your own repository.`
- Marketplace short description：`Generates validated, self-updating GitHub Profile language charts and auditable data in your own repository.`
- 推荐 Topics：`github-action`, `github-profile`, `github-profile-readme`, `profile-readme`, `language-statistics`, `github-stats`, `readme-card`, `svg`, `developer-tools`。

Google 的搜索摘要主要根据页面正文自动生成，meta description 只会在 Google 判断它更合适时偶尔采用。因此，对于无法控制 HTML 的 GitHub 仓库页，优化首屏正文比追求不可控的 meta 标签更实际。[Google：Search snippets](https://developers.google.com/search/docs/appearance/snippet)

## 内置传播回路

当前图表默认显示一个小号 `RepoPalette` 水印，并允许通过 `show-branding: false` 关闭；这是合适的产品传播基础。[`action.yml`](../action.yml) · [`src/render-svg.mjs`](../src/render-svg.mjs) 当前 README 管理器只插入图片，没有外部追踪、强制链接或额外广告。[`src/profile-readme.mjs`](../src/profile-readme.mjs)

推荐按以下顺序增强：

1. **保留默认小水印和完整关闭选项。** 不加大、不动画、不把它放到数据主视觉中。
2. **品牌开启时，把 README 中的图片包装成指向 RepoPalette 仓库的链接；品牌关闭时恢复普通图片。** 这样水印从“看见名字”变成“可到达来源”，且关闭行为完整一致。
3. **首次运行的 Actions Job Summary 提供一段可复制的分享文案和 Gallery 链接。** 用户主动分享，不自动发帖。
4. **建立 opt-in Showcase。** 只收录用户主动提交或明确同意的真实 Profile；展示配置、样式与链接，而不是只放合成样例。
5. **将 `onovich/onovich` 保持为稳定的 live demo。** 文档和 Marketplace 都指向同一个真实输出，避免示例与实际版本漂移。

不要加入追踪像素、远程 SVG 服务、隐藏遥测或不可关闭署名。这些做法会破坏 RepoPalette“文件保存在用户仓库、不依赖外部图片服务”的核心差异，也不值得为了营销牺牲信任。

## 30 / 60 / 90 天执行计划

### 0–30 天：完成可发现性与首轮分发

1. 更新 repository description，并补充 `github-profile-readme`、`github-stats`、`readme-card` 三个强意图 Topics；删除任何未来发现无关的泛词，而不是追求 20 个上限。
2. 在 Settings 检查并上传 1280×640 的 Social preview：品牌名、短句 `Self-updating GitHub Profile language charts`，以及三个代表性布局的小幅预览；不放安装代码。
3. 微调 README 首句与 H1 附近文本，使 `GitHub Profile language chart` 自然出现一次；保持当前 Quick start 的长度和层级。
4. 为下一个稳定 Release 发布 Marketplace listing，Primary `Utilities`、Secondary `Reporting`；Listing 明确区分 reusable workflow 快速安装与底层 Action。
5. 找 5 位非作者账号完成真实安装；记录首次安装耗时、失败点、最终 Profile 链接。获得同意后收录至少 3 个 Showcase。
6. 每周保存一次 GitHub Traffic、stars/forks、公开依赖仓库数的快照。GitHub Traffic 只保留最近 14 天的完整 clones/visitors，并提供热门内容与外部 referrers，因此必须定期留存。[GitHub：Viewing traffic](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository)

**30 天建议门槛（目标，不是预测）：** Marketplace 已上线；至少 5 个独立公开安装；其中至少 3 个成功经历两次自动更新；首次安装中位数不超过 10 分钟；没有需要 PAT 或外部服务的支持案例。

### 31–60 天：把真实使用转成信任内容

1. 根据前 5–15 个安装者的问题，只修高频摩擦；不要先增加大量布局或统计指标。
2. 建立简短 Showcase 页面，展示 3–6 个真实 Profile、所用样式和用户可复用配置。
3. 当出现至少 3 个重复问题，或达到 10 个独立公开安装时启用 Discussions；保留 `Q&A`、`Ideas`、`Show and tell` 三类即可，并置顶安装反馈与展示帖。GitHub Discussions 支持问答、公告、投票、置顶和标记答案，适合把开放讨论与可执行 Issues 分开。[GitHub：About discussions](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions)
4. 实现“品牌开启时图片可点击”的传播增强，并保持 `show-branding: false` 完整退出。
5. 发布一次有实质内容的稳定 Release，用 release notes 说明用户可感知变化和升级方式；不要为制造动态连续发布微小版本。GitHub Releases 可被单独订阅，自动 release notes 可列出合并 PR、贡献者和完整 changelog。[GitHub：About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) · [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)

**60 天建议门槛：** 至少 15 个独立公开安装；8 个在 35 天内仍有有效输出更新；3 个经许可 Showcase；安装相关支持请求不超过每 10 个活跃安装 2 个。

### 61–90 天：按证据决定是否建设外部 SEO 页面

只有满足以下任一条件才建 GitHub Pages：

- 已有至少 20 个独立公开安装，需要比 README 更强的 Gallery/Compare/Examples 入口；
- 同一类外部搜索或社区问题反复出现，README 无法同时保持简洁并完整回答；
- 需要 Search Console 的查询、impressions、clicks、CTR 数据来判断非品牌搜索需求。

Pages 首页应只有四块：效果、差异、安装、真实案例；再按需求增加 `/examples/` 和一篇事实可核对的 `/compare/`。接入 Search Console 后重点看非品牌查询的 impressions、clicks、CTR 和落地页，不以平均排名作为唯一目标。Google 官方也建议更关注 impressions/clicks 的趋势，并用高曝光低 CTR 页面发现标题或内容不匹配。[Search Console Performance](https://support.google.com/webmasters/answer/17010961)

小站不需要先做复杂 sitemap 或结构化数据。Google 说明多数页面通过链接自动发现，sitemap 不是必需项，应该先让人知道这个站点。[Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

也不要为了富结果伪造评分。Google 的 `SoftwareApplication` 结构化数据要求满足相应属性，并遵守结构化数据政策；即使标记正确也不保证显示。等真实评价、价格与独立页面都存在后再评估。[Google：Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) · [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

**90 天建议门槛：** 至少 30 个独立公开安装；35 天活跃率至少 60%；公开安装中至少 50% 保留可见品牌（只做人工抽样，不加遥测）；如果已建 Pages，建立 Search Console 基线而不是强设流量承诺。

## 可量化指标与数据来源

| 指标 | 定义 | 数据来源 | 局限 |
| --- | --- | --- | --- |
| 独立公开安装数 | 排除作者/demo 后，公开仓库中引用 RepoPalette Action/reusable workflow 的仓库数 | Dependency graph / GitHub 搜索 / 人工核验 | 不含私有仓库；搜索有延迟 |
| 35 天活跃安装数 | 最近 35 天仍有 RepoPalette 输出更新的公开安装 | 公开 Profile 输出与 workflow | schedule 可能被 GitHub 暂停；只是一种代理指标 |
| 激活耗时 | 从添加 workflow 到首张图成功出现在 README 的分钟数 | 5–15 位测试用户记录 | 需要小样本人工记录 |
| 安装支持率 | 安装相关 Issues/Discussions ÷ 每 10 个活跃公开安装 | GitHub Issues/Discussions | 沉默失败不会被统计 |
| 仓库访问 | 14 天 views、unique visitors、clones、popular content | GitHub Insights → Traffic | 只保留短窗口；referrers 不包含搜索引擎和 GitHub 自身 |
| 传播保留率 | 活跃公开卡片中仍显示 RepoPalette 品牌的比例 | 每月人工抽样 | 不应为此加入遥测 |
| 外部自然搜索 | 非品牌 impressions、clicks、CTR、queries、pages | 自有 Pages 接入 Search Console 后 | 无法把 `github.com/onovich/RepoPalette` 当成自己的完整站点属性衡量 |
| 版本关注 | Release-only watchers 与升级反馈 | Releases/通知反馈 | Stars 不等于安装，Release 关注也不等于活跃使用 |

GitHub 的 dependency graph 能识别 `.github/workflows` 中 `jobs[*].steps[*].uses` 和 `jobs.<job_id>.uses` 引用的 Action 或 reusable workflow，因此公开调用仓库数可作为无遥测的安装代理。[GitHub：Understanding dependencies in workflows](https://docs.github.com/en/actions/reference/security/secure-use#understanding-dependencies-in-your-workflows)

建议的核心漏斗是：

```text
Repository / Marketplace visit
        -> first successful generated card
        -> survives two scheduled updates
        -> user keeps branding or submits a showcase
```

Stars、forks 和 README views 只做辅助信号；真正的北极星指标应是“仍在自动更新的独立 Profile 数”。

## 应避免的低价值做法

- **关键词堆砌。** 不把 H1、Description 或 README 写成同义词列表；Google 明确反对 keyword stuffing。[Google：Title links](https://developers.google.com/search/docs/appearance/title-link)
- **为每个布局/主题生成一页薄内容。** 10 个布局 × 6 个主题不等于 60 个有价值页面；集中 Gallery 更适合用户选择。
- **为了 SEO 复制 README 到 Pages。** 若建设 Pages，应增加互动选择、真实案例或比较价值，并指定清晰的主要页面；重复内容会分散用户判断。
- **把 Sitemap、结构化数据、博客数量当成早期增长。** 对一个刚创建、页面很少的 Action 项目，这些不如 Marketplace、Topics、真实安装和外部链接。
- **伪造 review/rating 以获得富结果。** 没有真实评价时不添加评分结构化数据；以后具备条件也不保证获得富结果。
- **购买 stars、互刷 stars 或追逐 Trending。** GitHub 文档提供 stars/forks 过滤，但未公开一个可被“优化”的推荐排名公式；虚假热度也无法证明安装成功。
- **用高频微版本制造 Release 动态。** Release 应对应可用的软件迭代和清晰说明，不是营销 feed。[GitHub：About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- **过早开启空 Discussions。** 没有问题和用户时先用 Issues；达到重复问题/安装门槛后再启用。
- **强制、放大或隐藏式署名。** 保持小水印与完整 opt-out，不引入追踪像素或外部图片服务。
- **为了“看起来更正式”改做 GitHub App。** 当前产品是一次 workflow 任务，Marketplace Action 已能完成分发；GitHub App 会引入另一套安装、权限、服务和政策成本。

## 最先执行的五件事

1. 更新 repository description，并补充 3 个高意图 Topics。
2. 制作并上传 1280×640 Social preview。
3. 准备 Marketplace 文案与主预览，在下一个稳定 Release 上架 `Utilities / Reporting`。
4. 招募 5 个外部安装者，记录激活耗时与两次自动更新结果。
5. 建立每周指标快照；先证明安装和留存，再决定 Pages 与持续 SEO 内容投入。

## 主要一手来源

### GitHub

- [RepoPalette repository](https://github.com/onovich/RepoPalette)
- [RepoPalette repository API snapshot](https://api.github.com/repos/onovich/RepoPalette)
- [Searching for repositories](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)
- [Classifying a repository with topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
- [Searching topics](https://docs.github.com/en/search-github/searching-on-github/searching-topics)
- [About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [Customizing the social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
- [Publishing actions in GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace)
- [Marketplace Utilities Actions](https://github.com/marketplace?category=utilities&type=actions)
- [Marketplace Reporting Actions](https://github.com/marketplace?category=reporting&type=actions)
- [About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [About discussions](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions)
- [Viewing repository traffic](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository)
- [Secure use: workflow dependencies](https://docs.github.com/en/actions/reference/security/secure-use#understanding-dependencies-in-your-workflows)

### Google Search Central / Search Console

- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Influencing title links](https://developers.google.com/search/docs/appearance/title-link)
- [Control search snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Search Console Performance report](https://support.google.com/webmasters/answer/17010961)
- [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080)
- [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
