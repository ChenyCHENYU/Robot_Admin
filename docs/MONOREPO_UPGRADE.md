# Monorepo 分支升级说明（2.6.3）

此分支保留 Bun Workspaces：`apps/admin-internal` 与 `apps/admin-saas` 可独立开发、构建、部署，`packages/shared-config` 保留共享配置入口。两个应用均同步单体主线 2.6.3 的页面、插件锁定版本、环境校验、构建预算、类型与浏览器回归。旧版未维护的 Markdown 插件及样式已移除。

`admin-saas` 目前是面向未来多租户能力的独立应用入口，**尚无多租户后端、租户隔离或计费实现**；升级没有宣称这些功能已经完成。两个应用暂时共享同一套前端演示页，后续可在工作区内独立细化。

## 工作区命令

从仓库根目录执行：

```sh
bun ci
bun run dev:internal   # 127.0.0.1:1988
bun run dev:saas       # 127.0.0.1:1989
bun run verify         # 两个应用顺序验证
bun run security:audit
bun run test:e2e       # 两个生产预览的浏览器回归
```

生产构建：`bun run build:internal` 或 `bun run build:saas`。`vercel.json` 的默认部署目标是 internal；如需单独部署 SaaS，应将 Vercel 项目根目录设为 `apps/admin-saas`，使用该目录自己的 `vercel.json`。两套环境文件相互独立，生产凭据只能通过部署平台环境变量注入，不能提交到仓库。

根目录不提供会合并或覆盖 `dev`、`main` 的 deploy 命令，也不提供跨工作区递归清理脚本。分支通过验证后仅快进原 `monorepo` 分支。

Windows 上如遇 Bun 1.4.2 在输出检查结果后仍不退出，不要把输出的“通过”当成整条 `verify` 已完成；可分别进入两个应用目录执行 `bun run lint:check`、`bun run lint:eslint`、`bun run build`、`bun run type-build`、`bun test`、`bun run check:bundle`、`bun run build:application` 和 `bun run test:e2e`，逐项确认退出码。CI 在 Linux 上按根脚本串联执行。

## 共享边界

`shared-config` 仍供工作区 TypeScript/ESLint 配置使用。Vite 8 生产配置目前由每个应用显式维护，以便应用分别校验环境与分包预算；共享 Vite 工厂保留给其他工作区扩展，但内置应用不再依赖旧工厂。旧 README 中涉及 `createViteConfig()` 的内置应用示例属于升级前说明，以本页和当前配置文件为准。

根 `tsconfig.json` 只承担工具自动发现入口，跨应用项目引用放在 `tsconfig.solution.json`，避免构建器把工作区引用误当作应用源码的配置链。两个应用直接使用 Vue Flow 的样式，因此各自显式依赖 `@vue-flow/core`；工作区不能依赖组件库的传递依赖偶然提升到根目录。

应用版本统一为 2.6.3，生态包按各自已发布版本锁定；版本号相同表示同一主线基线，不表示 Monorepo 与单体可以互相合并部署。
