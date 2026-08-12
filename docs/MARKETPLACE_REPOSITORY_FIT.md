# GitHub Marketplace 产品类型与 onovich 最近 20 个仓库适配度

> 调研快照：2026-08-12 17:15（Asia/Shanghai，09:15 UTC）  
> 结论对象：GitHub 公开仓库与 GitHub Marketplace 当时可见页面  
> 结论性质：产品形态判断，不是对仓库质量、完成度或商业价值的评价

## 结论先行

1. **RepoPalette 应先做 GitHub Action，不应先做 GitHub App。** 它当前要完成的是一次可结束的任务：读取公开仓库统计，生成 SVG，再把文件写回 Profile 仓库。这个过程不需要自建常驻服务器、数据库或 webhook 服务，恰好属于 GitHub 官方定义的 Action 适用区间。
2. 最近 20 个非 fork 仓库中，**没有一个按当前产品形态适合直接作为 GitHub App 上架**。大部分是游戏、网站、桌面程序、研究内容或 Codex Skill，并不是“安装进 GitHub 后长期工作的在线服务”。
3. 最值得准备 Marketplace 的候选依次是：
   - **RepoPalette：强 Action 候选，可作为本轮正式产品。**
   - **SteamPackFlow：强 Action 候选，但必须先解决非交互登录、凭据和跨 runner 行为。**
   - **Research：中等 Action 候选，只适合把隐私、SEO、构建和发布检查抽成一个独立质量门，不适合把完整 AI 研究 Skill 冒充 Action。**
   - **LitPng：弱到中等 Action 候选，必须先抽出无界面的图片处理 CLI；当前浏览器产品本身不属于 Marketplace。**
   - **JustGoal.skill：弱 Action 候选，只能把项目状态校验脚本拆成 CI 检查；主体仍然是 Agent Skill。**
4. 截至快照时间，这 20 个仓库根目录均没有 `action.yml` 或 `action.yaml`，所以“适合”表示产品方向匹配，**不表示已经满足发布条件**。

## 一、Marketplace 上的 GitHub Apps 一般是什么

GitHub Marketplace 陈列两大类产品：**GitHub Actions** 与 **Apps**。Marketplace 的 Apps 还可能包含 GitHub App 和 OAuth App；GitHub 官方更推荐 GitHub App，因为它支持更细的权限、安装时可限定仓库，并使用短期令牌。[GitHub Marketplace 官方概览](https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/about-github-marketplace-for-apps) · [何时选择 GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app)

### 常见产品形态

根据 [Marketplace 当前 Apps 分类与热门产品](https://github.com/marketplace?type=apps)，常见 GitHub App 可以用大白话归成五组：

- **代码检查员**：看 PR、查 bug、测覆盖率、找依赖和安全问题，例如 CodeRabbit、Codecov、SonarQube、Snyk。
- **自动发布员**：收到 push 后持续构建、部署或同步到外部平台，例如 Render、CircleCI、Google Cloud Build、Azure Pipelines。
- **项目联络员**：把 GitHub 和 Jira、Linear、Slack 等外部系统长期双向同步。
- **仓库管家和报表员**：跨仓库收集数据、长期保存历史、生成仪表盘、监控或备份。
- **AI Agent**：监听 Issue、PR 或评论，随后审查、回答、改代码或创建提交。

官方分类还包括 Agent apps、AI Assisted、API management、Backup Utilities、Chat、Code quality、Code review、Code search、Continuous integration、Dependency management、Deployment、Monitoring、Project management、Publishing、Reporting、Security、Testing、Utilities 等。[Marketplace Apps 分类](https://github.com/marketplace?type=apps)

这些产品的共同点不是“有一个 GitHub 仓库”，而是：**用户把它安装进账户或组织，授权若干仓库；它随后作为一个长期服务持续响应 GitHub 事件。** GitHub 官方列出的 App 常见用途包括后台自动化、代表用户操作、响应 webhook，以及把外部服务接入 GitHub。[GitHub App 官方用途说明](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps)

## 二、Action 与 GitHub App 的边界

一句话区别：

> **Action 是“把一个工具放进自己的流水线跑一次”；GitHub App 是“把一个长期在线的服务安装进 GitHub”。**

| 维度 | GitHub Action | GitHub App |
| --- | --- | --- |
| 怎么启动 | push、PR、定时或手动触发 | 安装后由 webhook、外部事件或用户操作持续触发 |
| 运行多久 | 一次任务，跑完退出 | 通常是常驻服务 |
| 在哪里运行 | GitHub-hosted/self-hosted runner 或容器 | 开发者提供的服务器、云服务，或用户设备 |
| 擅长什么 | 克隆代码、构建、测试、扫描、生成文件、部署 | 跨仓库服务、实时机器人、集中仪表盘、长期数据和外部系统同步 |
| 用户怎么用 | 在 workflow 中写 `uses: owner/action@v1` | 点击 Add，选择账户、组织和授权仓库 |
| 开发者运维 | 通常不用维护在线后端 | 通常要维护服务、凭据、webhook、监控和数据 |

GitHub 官方明确说明：Action 不常驻，只响应所在仓库的事件，并能直接访问检出的仓库；App 适合跨多个仓库或组织、持续响应事件和提供托管服务。[GitHub Actions vs GitHub Apps](https://docs.github.com/en/actions/get-started/actions-vs-apps) · [选择 App 或 Action](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app)

### 对 RepoPalette 的直接判断

当前 RepoPalette 的任务链是：

```text
定时或手动触发 → 读取统计 → 生成 SVG → 提交回 Profile 仓库 → 结束
```

这是一条标准 Action 流水线。首发建议：

- 类型：**GitHub Action**
- Primary category：**Utilities**
- Secondary category：**Reporting**
- 使用形式：`uses: onovich/RepoPalette@v1`

[Marketplace 的 Utilities Actions](https://github.com/marketplace?category=utilities&type=actions) 已经陈列 Metrics embed、GitHub Readme Streak Stats Action 和 GitHub-Profile-Summary-Cards 等同类“生成 Profile 图片并写回仓库”的产品，说明分类和分发形态是成立的。

GitHub App 不是永远不能做，但应等到出现这些需求以后：

- 用户希望点击一次 Add，不写 workflow；
- 需要实时监听多个仓库；
- 需要集中保存历史统计或提供网页仪表盘；
- 需要统一处理私有仓库；
- 准备运营付费托管服务。

相近案例 [Repography](https://github.com/marketplace/repography) 就是 GitHub App：它提供在线 README 仪表盘、私有仓库额度和多档订阅，快照时显示 1,794 installs。这证明 RepoPalette 将来存在 App 路线，也同时说明那将变成一个要维护服务器、隐私政策、支持体系和订阅状态的 SaaS，而不是给当前 Action 换一个上架标签。

## 三、最近 20 个非 fork 仓库的取样口径

使用 GitHub REST API：

```http
GET /users/onovich/repos?type=owner&sort=pushed&direction=desc&per_page=100
```

然后分页取完公开自有仓库、排除 `fork: true`，再按 `pushed_at` 降序取前 20。GitHub 官方说明该接口列出指定用户的公开仓库，`type=owner` 限定自有仓库，`sort=pushed` 和 `direction=desc` 分别表示按推送时间倒序。[REST API：List repositories for a user](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user)

因此本文中的“最近”是**仓库最近一次 push 的时间**，不是 `updated_at`、仓库创建时间、Release 时间，也不是个人贡献图时间。取样截止到 **2026-08-12 17:15（北京时间）**；后续任何 push 都可能改变排名。判断依据为 REST 元数据、根目录结构和仓库自身 README。

## 四、逐仓判断

判定标签：

- **Action（强）**：现有核心任务天然能在 runner 中完成，只需产品化和发布包装。
- **Action（条件）**：能抽出有用 Action，但需要明显改造；不是把原仓库原样上架。
- **两者都不适合**：当前主产品不是 GitHub 自动化或集成。未来若另做新产品，不在本判断范围内。

| # | 仓库与 `pushed_at`（北京时间） | 当前仓库证据 | 判断 | 直接理由 |
| ---: | --- | --- | --- | --- |
| 1 | [RepoPalette](https://github.com/onovich/RepoPalette) · 08-12 17:04 | 快照时为空的新产品仓库；已确定承接 Profile 语言统计器 | **GitHub Action（强）** | 生成 SVG 并写回仓库是一次性 runner 任务，无需常驻后端；这是最值得首发上架的候选。App 只留作未来托管版。 |
| 2 | [onovich](https://github.com/onovich/onovich#readme) · 08-12 15:35 | Profile README 引用 `assets/top-langs.svg`；根目录含脚本、配置和 workflow | **两者都不适合** | 这是用户 Profile 和 RepoPalette 的首个使用方，不应把个人主页本身当 Marketplace 产品；通用生成器应迁往 RepoPalette。 |
| 3 | [Research](https://github.com/onovich/Research#readme) · 08-11 02:42 | Agent Skills、研究模板、检查脚本与 GitHub Pages 报告站 | **GitHub Action（条件，中）** | 可把隐私、SEO、构建和静态发布验证抽成“研究报告质量门”Action；完整研究流程依赖 AI Agent Skill，不应伪装成普通 Action，也不需要常驻 App。 |
| 4 | [onovich.github.io](https://github.com/onovich/onovich.github.io) · 08-10 21:47 | 个人静态站点与 Pages 源码 | **两者都不适合** | 一个网站项目不是可安装的 GitHub 集成；其构建发布可消费现成 Actions，但不是独立 Marketplace 产品。 |
| 5 | [Game-Primitives](https://github.com/onovich/Game-Primitives#readme) · 07-31 09:22 | 游戏设计基础结构的长期研究、书稿、术语和案例库 | **两者都不适合** | 核心价值是研究内容和知识体系，不是仓库自动化，也没有需要长期响应 GitHub 事件的服务。 |
| 6 | [LitPng](https://github.com/onovich/LitPng#readme) · 07-27 21:18 | 浏览器本地批量压缩、改名、裁剪、转换图片；Web Worker/WASM | **GitHub Action（条件，弱到中）** | 若先抽出无界面 CLI，可做“PR/仓库图片自动压缩”Action；当前浏览器交互产品不能原样运行成 Action，且没有 GitHub App 必需的长期集成。 |
| 7 | [codex-iab-guard.skill](https://github.com/onovich/codex-iab-guard.skill#readme) · 07-25 06:53 | Windows 本机 Codex Desktop 故障诊断与恢复 Skill | **两者都不适合** | 目标资源是用户本机的 Windows/Codex 状态，GitHub runner 和 GitHub webhook 都不是正确运行环境。 |
| 8 | [goal-next.skill](https://github.com/onovich/goal-next.skill#readme) · 07-22 18:55 | 可见 Codex 任务之间的规划、执行、审查和交接 Skill | **两者都不适合** | 主产品依赖 Agent/任务交互，不是仓库事件自动化；即使存储 Git 状态，也不足以构成 App 或 Action。 |
| 9 | [fix-codex-lag.skill](https://github.com/onovich/fix-codex-lag.skill#readme) · 07-22 18:19 | Windows 本机 Codex 进程诊断和修复 Skill | **两者都不适合** | 必须观察并谨慎操作用户桌面进程；runner 无法访问该环境，云端 App 也不应获得这种本机权限。 |
| 10 | [SteamPackFlow](https://github.com/onovich/SteamPackFlow#readme) · 07-18 21:59 | 校验包名、规范入口、生成 VDF，并通过 SteamCMD 上传 Windows/macOS 构建 | **GitHub Action（条件，强）** | 构建验证和发布天然属于 CI/CD Action；但当前账号在运行时输入、Steam Guard 可交互重试，必须先设计非交互凭据、Secrets、日志脱敏和失败恢复。不是 GitHub App。 |
| 11 | [SnapLex](https://github.com/onovich/SnapLex#readme) · 07-17 20:10 | Python/PySide6 桌面悬浮 OCR 与翻译工具 | **两者都不适合** | 核心依赖用户屏幕、热键、剪贴板和桌面 UI，不是仓库 runner 或长期 GitHub 服务。 |
| 12 | [RoomAxioms](https://github.com/onovich/RoomAxioms#readme) · 07-15 01:53 | 浏览器推理游戏，以及项目内部 schema/solver/proof/authoring 包 | **两者都不适合** | 主产品是游戏；内部内容校验 CLI 只服务该项目，尚未显示为跨仓库通用工具，单独上架会把内部脚本误当产品。 |
| 13 | [WumingTown](https://github.com/onovich/WumingTown#readme) · 07-14 23:36 | 游戏产品、技术和 Codex 执行交接包 | **两者都不适合** | 这是具体游戏的文档与工程起点；仓库级 Skill 和任务协议与项目强绑定，不能包装成通用 GitHub 集成。 |
| 14 | [Suitweave](https://github.com/onovich/Suitweave) · 07-13 12:09 | 私有 npm 应用包；React/Vite 游戏，含测试、E2E 和内部架构检查 | **两者都不适合** | 当前是游戏产品。它可以使用 CI Actions，但 lint/test/架构检查没有从项目语境中抽成独立通用工具。 |
| 15 | [DontStopTheLine](https://github.com/onovich/DontStopTheLine#readme) · 07-13 03:22 | Web 优先的节点式自动化产线游戏，含项目 CI 命令 | **两者都不适合** | 游戏和它自己的构建门禁不是 Marketplace 集成；没有跨仓库、可复用的独立产品边界。 |
| 16 | [MonsoonSovereigns](https://github.com/onovich/MonsoonSovereigns#readme) · 07-11 11:35 | 游戏设计/技术交接包及项目专用 Codex 协作 Skill | **两者都不适合** | Skill 直接依赖本项目文档、任务协议和质量门禁，不能脱离仓库作为通用 Action；也不是在线 App。 |
| 17 | [LunTian](https://github.com/onovich/LunTian#readme) · 07-05 13:23 | Vite 类播棋肉鸽卡牌原型与 Pages 部署 | **两者都不适合** | 它是静态游戏，现成 GitHub Pages Actions 已能满足部署；没有新的可安装集成能力。 |
| 18 | [EternalRicochet](https://github.com/onovich/EternalRicochet#readme) · 07-02 15:35 | Vite 单屏霓虹街机生存游戏、PWA 与本地运行时 | **两者都不适合** | 产品运行在浏览器，不围绕 GitHub 仓库事件提供服务；项目测试和 Pages 发布只是消费 CI。 |
| 19 | [MicroGapRadar](https://github.com/onovich/MicroGapRadar#readme) · 06-29 04:54 | 本地 Next.js/SQLite 搜索机会扫描 MVP；README 明确暂无公网部署、生产认证、cron 和真实外部账号 | **两者都不适合（当前）** | 定时扫描和集中数据库在运行形态上接近 SaaS，但当前核心没有 GitHub 集成，且官方要求 App 必须提供登录之外的 GitHub 平台价值。若未来能把机会转成 Issues/项目并长期双向同步，才可能另做 App。 |
| 20 | [JustGoal.skill](https://github.com/onovich/JustGoal.skill#readme) · 06-28 04:40 | Agent Skill，附 `taskctl`、`modelctl`、handoff 和 checksum 校验脚本 | **GitHub Action（条件，弱）** | 可单独抽出“项目任务状态/交接格式校验”Action 用于 PR 门禁；主体仍是 Agent 编排 Skill，直接把整个仓库上架会让用户误解运行方式。 |

## 五、候选优先级与产品化缺口

### 1. RepoPalette：现在就按 Action 建设

最小 Marketplace 路线：

1. 将通用统计、渲染和配置能力从 `onovich/onovich` 迁入独立仓库；Profile 仓库仅作为消费方和演示。
2. 在根目录提供唯一 `action.yml`，定义明确的 inputs、outputs 和最小权限。
3. 加入 README 快速安装、完整 workflow 示例、生成效果图、隐私/数据范围说明和版本策略。
4. 打包 Action 所需运行时代码，建立测试与端到端示例。
5. 发布 `v1.0.0`，并维护可移动的 `v1` 大版本标签。
6. 接受 Marketplace Developer Agreement、启用 2FA，在 Release 中选择 Utilities / Reporting 后发布。

GitHub 要求 Action 使用公开仓库、根目录单一 Action metadata、唯一名称和版本 Release；符合条件时会立即发布，GitHub 不做人工审核。[Action 官方发布要求](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace)

### 2. SteamPackFlow：第二个真正有 Action 味道的产品

建议先拆成两层：

- `validate-and-prepare`：校验包名、入口和配置，生成 VDF；可优先上架，风险较低。
- `upload`：真正调用 SteamCMD；等非交互认证、Secrets、Steam Guard、日志脱敏和 runner 支持验证完成后再开放。

这样用户可以先把无凭据的构建检查接入 PR，再自行决定是否授权自动发布。

### 3. Research、LitPng、JustGoal：只能上架“抽出来的工具”

- Research 上架的应是可重复执行的报告质量门，不是“AI 替你研究”这一整套 Agent 工作流。
- LitPng 上架的应是无头图片压缩 CLI，不是浏览器 UI。
- JustGoal 上架的应是项目状态校验器，不是多代理执行流程。

如果抽出来的能力没有独立用户、稳定输入输出和脱离母项目的文档，就暂不上架。

## 六、为什么现在没有 GitHub App 候选

这批仓库中最接近 App 运行形态的是 MicroGapRadar 和 RepoPalette 的未来托管版，但它们当前分别缺少：

- MicroGapRadar：缺少 GitHub 平台集成和公开在线服务；
- RepoPalette：当前根本不需要常驻后端，Action 已能完成目标。

免费 GitHub App 上架也不是“注册一个 App 名称”就结束。官方要求它公开可用、提供 GitHub 登录之外的集成价值、定价方案、联系方式、隐私政策、支持渠道、logo/feature card/截图，并处理 Marketplace 方案变更和取消 webhook；付费 App 还需要组织验证，GitHub App 原则上至少有 100 次安装，并处理购买、升级、降级、取消和试用事件。[App 上架要求](https://docs.github.com/en/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app)

因此当前最经济的路线不是“为了显得高级而做 App”，而是：

```text
RepoPalette Action 验证安装与传播
    ↓ 只有出现跨仓库、历史存储、私有仓库或付费托管需求
RepoPalette Hosted / GitHub App
```

## 来源范围

- GitHub 官方 Marketplace、GitHub Docs、GitHub REST API 文档；
- `onovich` 各仓库自身 README、根目录与 API metadata；
- 未使用第三方评测、SEO 文章或未经仓库证据支持的功能推测。

