<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-12
 * @FilePath: \Robot_Admin\docs\development.md
 * @Description: README 配套的开发命令、生态包联调与常见排查
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 开发环境

项目使用 Node.js ≥22.18.0、Bun ≥1.4.2，完整命令以根目录 [package.json](../package.json) 为准。

## 开发与构建

| 命令                                   | 用途                                          |
| -------------------------------------- | --------------------------------------------- |
| `bun run dev` / `dev:banner`           | 标准 localhost 开发，显示版本、Git 与访问地址 |
| `bun run dev:ip`                       | 自动开放局域网访问；终端显示实际网卡地址      |
| `bun run dev:quiet`                    | 关闭启动横幅                                  |
| `bun run dev:devtools`                 | 启用 Vue DevTools                             |
| `bun run build`                        | 当前生产环境的公开演示构建                    |
| `bun run build:test` / `build:staging` | 对应环境构建                                  |
| `bun run build:application`            | 使用预发配置生成业务验收产物                  |
| `bun run preview`                      | 先构建，再启动本地产物预览                    |
| `bun run analyze`                      | 构建并分析产物分布                            |

自定义监听地址使用 `bun run dev --host <本机实际IP> --port 1988`；IP 必须已配置在本机网卡上。HMR 跟随访问地址。localhost 与 IP 属于不同浏览器源，登录态与本地偏好独立保存。

## 生态包源码联调

普通 `dev`、构建与类型检查使用已安装的线上包。只有修改生态包本身时才启用源码联调：

| 命令                                          | 范围                                  |
| --------------------------------------------- | ------------------------------------- |
| `bun run dev:components`                      | 本地 `naive-ui-components`            |
| `bun run dev:table`                           | 本地组件库、MachTable 与 request-core |
| `bun run dev:local`                           | 本地全部生态包、组件库与 MachTable    |
| `bun run type-build:local`                    | 显式读取本地联调类型配置              |
| `bun run type-build` / `type-build:installed` | 按正式安装包检查应用与配置类型        |

本地目录与精确子入口规则见 [localPackagesAlias.ts](../src/config/vite/localPackagesAlias.ts)，类型配置见 [tsconfig.local.json](../tsconfig/tsconfig.local.json)。按实际仓库位置配置路径；MachTable 可通过 `MACH_TABLE_LOCAL_ROOT` 指定。不存在的兄弟仓库不会成为普通开发的依赖。

联调通过 Vite alias 读取源码并使用隔离缓存，不修改 `package.json` 和 `bun.lock`。TypeScript 联调配置读取包的公开声明；公开 API 变化后先在包仓库构建声明。正式发布时安装真实 npm 版本，并运行普通开发、类型与构建验证。生产构建拒绝本地 alias 标志。

## 验证与提交

```bash
bun run lint:check
bun run lint:eslint
bun run check:styles
bun run type-build
bun run test
bun run test:components
bun run verify
# 首次运行浏览器测试时安装 Chromium。
bunx playwright install chromium
bun run test:e2e
```

`lint:check` 只执行 Oxlint；ESLint 单独使用 `lint:eslint`。需要自动修复时显式运行 `bun run lint`，格式化使用 `bun run format`。`verify` 已串联双 Lint、样式边界、应用及组件类型、逻辑与组件测试、生产构建、体积预算和业务预发构建；浏览器测试单独运行。

提交使用 `bun run commit` 或符合 `<type>(<scope>): 中文描述` 的 Git 提交。应用版本与正式日志由 Release Please 管理；`bun run changelog:preview` 仅输出日志预览。`bun run deploy` 是功能分支 → dev → main 的验证、合并与多远端推送命令，不负责部署主机、版本号或标签。

## 常见排查

| 问题                   | 处理方式                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 端口 1988 已占用       | 先确认是否已有同项目服务；需要第二实例时使用 `bun run dev --port 1989`，或在未跟踪的 `envs/.env.local` 设置 `VITE_PORT=1989` |
| 依赖与锁文件不一致     | 保留仓库锁文件，执行 `bun install --frozen-lockfile`；不要通过删锁文件改变依赖树                                             |
| 本地包模式报路径不存在 | 核对联调路径，或返回普通 `bun run dev` 使用线上包                                                                            |
| 开发代理未转发         | `API_PROXY_TARGET` 默认无值；远端联调时显式配置真实后端，见 [环境说明](../envs/README.md)                                    |
| 类型或构建失败         | 先运行 `bun run type-build` 定位公开类型，再运行 `bun run verify`；不要用旧生成声明或类型断言掩盖接口差异                    |

浏览器目标是 Chrome、Firefox、Safari、Edge 的最近两个版本；具体场景仍需在目标设备验收。部署与后端接入见 [生产接入基线](./production-readiness.md)。
