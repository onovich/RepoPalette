# RepoPalette 低摩擦安装路径调研

> 调研日期：2026-08-13
> 证据范围：仅使用 GitHub 官方文档、官方 API 文档和 GitHub 官方仓库。

## 结论

对于**已经存在的 GitHub Profile 仓库**，在同时满足以下条件时：

- 用户不创建或保管 PAT；
- RepoPalette 不运行托管后端；
- 统计结果继续提交到用户自己的仓库；

GitHub 官方能力所允许的最低摩擦不是“匿名一键安装”，而是**用户确认一次仓库写入，也就是提交一个 workflow 文件**。

原因是：GitHub Actions workflow 必须以 YAML 文件存在于目标仓库的 `.github/workflows` 目录；GitHub 网页端创建文件最终需要一次 commit；用 API 创建该文件也必须携带有写权限的令牌。[Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows) · [Creating new files](https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files) · [Create or update file contents](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents)

因此，近期最值得做的默认方案是：

1. RepoPalette 提供一个完整的 **reusable workflow**；
2. 用户只需在 Profile 仓库提交一份很短的 caller workflow；
3. caller 在安装提交的 `push` 上自动运行，首次生成后不再要求用户去 Actions 页面手动点击；
4. called workflow 使用仓库自动获得的 `GITHUB_TOKEN` 生成并提交图片，必要时只在明确的 Markdown 标记范围内自动插入 README 图片引用；
5. README 把这个流程描述成“Create one file, then commit”，而不是承诺无法兑现的“one-click install”。

这条路线可以做到：**一次仓库确认、无 PAT、无 RepoPalette 后端、首次自动运行、以后定时更新**。

## GitHub 的权限边界

GitHub 会在每个 Actions job 开始时自动创建唯一的 `GITHUB_TOKEN`。它是仓库范围内的 GitHub App installation token，job 结束后失效，因此用户不需要生成长期个人令牌。[GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)

workflow 可以通过 `permissions: contents: write` 将该临时令牌限制为 RepoPalette 所需的仓库内容写权限。GitHub 同时建议显式授予最小权限。[Use GITHUB_TOKEN for authentication](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)

Profile 仓库是公开仓库时，标准 GitHub-hosted runner 免费；运行环境由 GitHub 临时提供，不是 RepoPalette 自建服务。[Billing and usage](https://docs.github.com/en/actions/concepts/billing-and-usage)

不可消除的一步是：**仓库所有者必须允许 workflow 文件进入自己的仓库**。网页端表现为 commit；App/API 路线则表现为安装授权或 OAuth 授权。任何声称既不授权、也不提交、还能修改用户仓库的方案，都不在 GitHub 官方权限模型内。

## 安装路径对比

| 路径 | 适用于已有 Profile 仓库 | 用户仍需确认什么 | 无 PAT | 无 RepoPalette 后端 | 判断 |
| --- | --- | --- | --- | --- | --- |
| Reusable workflow | 是 | 创建并提交一份很短的 caller workflow | 是 | 是 | **近期默认方案** |
| Workflow template | 有条件 | 在 Actions 中选择 Configure，检查内容并 commit | 是 | 是 | 适合组织内部，不适合作为 RepoPalette 面向所有人的独立分发入口 |
| GitHub 全局 starter workflow | 理论上是 | Configure 并 commit | 是 | 是 | 当前不是可申请的近期入口；官方仓库现在不接受贡献 |
| Repository template | 否；只能创建新仓库 | 选择 owner、填写仓库名、确认可见性并创建 | 是 | 是 | 只适合“还没有 Profile 仓库”的新用户 |
| Marketplace Action 页面 | 是 | 复制 `uses:` 语法，粘贴进 workflow 并 commit | 是 | 是 | 解决发现与信任，不是安装器 |
| 网页 create-file 深链接 | 不存在已文档化的一键版本 | 至少检查内容并 commit | 网页 UI 是 | 是 | 可做辅助导航，不应依赖未文档化参数做主入口 |
| Contents REST API | 是 | 授权有 Contents/Workflows 写权限的 token | 视认证方式 | 通常否 | 能做安装器，但会引入认证应用或服务 |
| GitHub App | 是 | 安装 App、选择仓库并批准权限 | 是 | **否** | 真正接近“点击安装”的远期方案，但把复杂度转移给产品方 |

## 1. Reusable workflow：近期最优

GitHub 支持从公开仓库调用 reusable workflow。caller 在 job 的 `uses` 中引用 `{owner}/{repo}/.github/workflows/{file}@{ref}`；完整 commit SHA 是官方建议的最安全引用方式。[Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)

它适合 RepoPalette 的关键原因：

- 用户仓库只保留触发条件、最小权限和一个 `uses`；checkout、生成、校验、提交等实现集中在 RepoPalette；
- called workflow 的 `github` context 属于 caller，且自动获得 caller 的 `github.token`；它无法把 caller 授予的权限升级，因此用户仍控制写权限。[Reusing workflow configurations](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations)
- `actions/checkout` 默认 checkout `${{ github.repository }}`，token 默认 `${{ github.token }}`；与 caller context 组合后，called workflow 操作的是用户的 Profile 仓库。[actions/checkout action metadata](https://github.com/actions/checkout/blob/main/action.yml)

建议最终让用户只提交类似下面的文件；实际发布时将占位符换成新版本的不可变 SHA：

```yaml
name: RepoPalette
on:
  workflow_dispatch:
  schedule:
    - cron: "17 3 * * 1"
  push:
    paths: [.github/workflows/repopalette.yml]

permissions:
  contents: write

jobs:
  update:
    uses: onovich/RepoPalette/.github/workflows/profile.yml@<immutable-release-sha>
```

这里的 `push.paths` 让“安装 workflow 的那次 commit”直接触发第一次生成，省掉当前 Quick Start 中“再去 Actions 手动运行一次”的步骤。`workflow_dispatch` 仍作为手动重试入口，`schedule` 负责后续更新。GitHub 官方确认 workflow 可由仓库事件、手动操作或计划任务触发。[Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows)

仍需在故障排查中提前说明三个 GitHub 约束：组织的 Actions policy 可能禁止调用外部 workflow；分支保护或 ruleset 可能阻止 bot 直接 push；计划任务只在默认分支执行，而且公开仓库连续 60 天无活动时可能被自动停用。[Actions policy](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization) · [Schedule event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

若要把用户步骤从“提交 workflow + 修改 README”进一步减为只提交 workflow，called workflow 可以在首次成功后自动插入以下受控区块，并在以后只更新区块内部：

```markdown
<!-- repopalette:start -->
![GitHub languages](./assets/top-langs.svg)
<!-- repopalette:end -->
```

这不需要新权限，因为 README 与 SVG 都属于同一仓库的 Contents 写入；但实现必须幂等，并且绝不能重写标记范围之外的用户内容。

## 2. Workflow templates 与 starter workflows

GitHub 的 workflow template 体验确实比手写文件轻：用户进入 Actions，选择模板的 **Configure**，然后仍需 **Start commit** 并提交。[Using workflow templates](https://docs.github.com/en/actions/how-tos/write-workflows/use-workflow-templates)

但第三方的自助发布机制是组织级的：需要在一个组织的 `.github` 仓库中建立 `workflow-templates` 目录。它适合让同一组织的团队复用，不是个人项目向所有 GitHub 用户发布模板的 Marketplace。[Creating workflow templates for your organization](https://docs.github.com/en/actions/how-tos/reuse-automations/create-workflow-templates)

GitHub 面向全站展示的模板来自官方 [`actions/starter-workflows`](https://github.com/actions/starter-workflows) 仓库。该仓库当前明确写着“不接受贡献”，所以把 RepoPalette 加入全局 Actions 模板选择器不能作为近期计划。

即使未来进入 starter workflows，用户依然需要 Configure、审阅和 commit；它是更好的发现入口，不会越过仓库写入确认。

## 3. Repository template：仅适合尚未建立 Profile 的用户

Repository template 会创建一个全新的仓库，复制模板的目录与文件，并从一个新提交开始。它不能把内容覆盖到一个已经存在的 Profile 仓库中。[Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

GitHub 正式支持用 URL query 预填新仓库表单，包括 `owner=@me`、`template_owner`、`template_name` 和可见性。因此可以为“我还没有 Profile 仓库”提供一个模板入口，例如预选 RepoPalette 模板与 public；用户仍需把仓库名填写为自己的 GitHub 用户名并点击创建。[Creating a new repository from a URL query](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository#creating-a-new-repository-from-a-url-query)

Profile README 只有在仓库公开、仓库名等于用户名、根目录存在非空 `README.md` 时才会显示。[Managing your profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme)

所以它应当是 Quick Start 中一个折叠的分支：**“No profile repository yet?”**，不能取代已有用户的默认流程。

## 4. Marketplace：分发入口，不是安装按钮

Action 的 Marketplace 页面提供版本信息和可复制的 workflow 语法。GitHub 官方步骤本身就是：复制语法、粘贴到 workflow 的一个 step、按需填写 inputs。[Using pre-written building blocks in your workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/find-and-customize-actions)

因此 Marketplace 能带来：

- 搜索与分类；
- 统一的版本/发布页面；
- 更清楚的 `uses:` 示例；
- 后续的信任与可发现性建设。

它不能自动创建 schedule、授予 `contents: write`、提交输出或修改 Profile README。RepoPalette 仍值得上架 Marketplace，但不要把 Marketplace 的 “Use latest version” 描述成“一键安装”。官方发布要求与流程见 [Publishing actions in GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace)。

## 5. Direct create-file URL 与 Contents API

GitHub 官方记录的已有仓库网页流程是：进入仓库，选择 **Add file → Create new file**，填写文件名与内容，然后 commit。[Creating new files](https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files)

本次查阅的官方文档中，没有找到用于**已有仓库**、可通过 URL 同时预填任意文件路径与完整内容的稳定公共接口。GitHub 有正式文档的 URL query 是“创建新仓库”表单，而不是“向已有仓库写入文件”表单。因此：

- 可以提供进入 Profile 仓库或创建文件页面的导航链接；
- 可以提供复制按钮和精确文件名；
- 不应把社区中流传的未文档化 `new?...&filename=...&value=...` 形式当成唯一 Quick Start，以免 GitHub UI 调整后失效。

正式的程序化写入方式是 Contents REST API。修改 `.github/workflows` 时，classic PAT/OAuth token 需要 `workflow` scope；fine-grained token 或 GitHub App token需要 Contents 写权限，并可能需要 Workflows 写权限。[Create or update file contents](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents)

换句话说，API 可以支撑未来的安装器，但认证与授权不会消失，只会从“用户 commit”变成“用户授权一个应用”。

## 6. GitHub App：远期真正的安装型产品

GitHub App 的用户体验最接近传统插件安装：用户打开官方安装 URL，查看权限，并选择 **All repositories** 或 **Only select repositories**；对 RepoPalette 应只选择 Profile 仓库。[Installing a GitHub App from a third party](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party)

它可以不使用用户 PAT，并通过 installation token 写回图片或安装 workflow；若要编辑 Actions 文件，还必须请求 Workflows repository permission。[Choosing permissions for a GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)

代价在产品方：

- App 需要私钥来签 JWT 并换取 installation token；私钥必须安全保存。[Managing private keys for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)
- installation token 一小时后过期，需要服务按需生成。[Generating an installation access token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
- 若依赖仓库事件，必须提供接收 HTTP POST 的 webhook server URL；即使关闭 webhook，周期更新仍需要外部 scheduler/worker。[Using webhooks with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps)

因此 GitHub App 能做到“用户侧更像点击安装”，但做不到“RepoPalette 方无需托管”。在目前免费开源 Action 阶段，它不是 Quick Start 优化的合理前置条件；可以在安装量和服务需求得到验证后再评估。

## 推荐的 README 安装信息架构

### 默认入口：适合所有人

只展示一个目标和两个动作：

1. **Create this file** — `.github/workflows/repopalette.yml`
2. **Commit changes** — 第一次生成自动开始

紧接着显示一张默认效果图，并写清楚：“No token to create. No server to deploy.” 不在首屏解释 runner、installation token、checkout 或 git push。

### 新手帮助

- 提供可复制的完整 caller workflow；
- 提供 GitHub 网页端逐步截图或短 GIF，但正文只保留两个动作；
- 明确告诉用户成功标志：Actions 变绿，Profile README 出现图片；
- 提供 “I do not have a profile repository” 模板入口；
- 把权限解释翻译为一句话：`contents: write` 只让这次自动任务更新当前 Profile 仓库里的图片和数据。

### 专家入口

- 展开显示直接使用 Action 的完整 workflow；
- 列出全部 inputs、输出路径、分组模式和不可变 SHA；
- 说明 reusable workflow 的权限继承与版本固定策略；
- 提供 CLI/API 安装方法，但不放在默认 Quick Start 前面。

### 必须保留的诚实表述

- “One file” 或 “one-commit setup” 可以承诺；“one-click install” 只能留给未来有后端的 GitHub App。
- “No PAT” 可以承诺，因为使用仓库临时 `GITHUB_TOKEN`。
- “No RepoPalette server” 可以承诺，因为工作在 GitHub-hosted runner 上执行。
- “Automatic after commit” 只有在 caller workflow 加入安装文件 `push` 触发，并且 called workflow负责首次生成与 README 插入后才能承诺。
