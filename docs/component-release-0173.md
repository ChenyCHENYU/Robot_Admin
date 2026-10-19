# 组件库 0.17.3 消费与验收

本次修复通过正式 `@robot-admin/naive-ui-components@0.17.3` 接入。常规启动与生产构建使用已安装的正式依赖；不需要本地源码 alias，也不再依赖 0.17.0 的临时组件补丁。

| 页面                              | 使用方式与验证动作                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/demo/table-manage/table-expand` | 父表选择、展开、序号列使用组件默认宽度；角色列与子表名称列承接剩余空间。点击全部展开，检查前三列约为 40 / 40 / 50 px、子表上下留白 8 px，勾选子项后清空所有选择。切换密度时父子表与操作按钮同步。 |
| `/plugins/calendar`               | 内置跨日和全天样例。打开后只修改标题，起止时间和全天状态应保持不变。全天结束日期在表单中包含当天，在日历与备份中保持排他结束日期。                                                                |
| `/plugins/file-preview`           | 同一个预览实例直接接收所选文件；切换文档不会重挂载。清空文件库后停止加载、清空旧正文与释放 PDF URL，恢复示例文件即可继续阅读。手动重新加载仍为显式操作。                                          |
| `/plugins/audio-player`           | 同一个播放器接收响应式列表，切换音源、移除曲目、清空与恢复无需额外 key。切换完整/迷你界面不打断播放；清空后停止，随后恢复列表不自动播放。                                                         |
| `/plugins/v-table-gantt`          | 初始化失败使用组件内的错误与重试视图。页面监听 `error`/`gantt-created` 同步状态，失效图实例不可继续执行定位；重试由公开 `reload()` 或图内按钮触发。                                               |
| `/plugins/video-player`           | 场景、本地和公开备用源直接切换；清空后退出旧媒体，恢复来源重新建立进度、章节、字幕与测验状态。同源题目配置变化也不沿用旧题状态；离线样例采用已验证可播放的 VP9/WebM。                             |

审批工作台 `/editor/work-flow-editor` 显式使用 `allow-cycles=false`，检查流程时拒绝循环连接；通用组件仍允许其他业务自行选择循环策略。

日程工作台继续用 `C_Form` 管理分类、地点和备注；跨日与全天日期模型保持与组件默认编辑器一致。无需为了复用默认弹窗而丢弃这些业务字段。

## 回归命令

```bash
bun test --max-concurrency=1 tests/component-release-consumption.test.ts tests/calendar-workspace.test.ts tests/robot-table-015.test.ts
bun run test:components tests/components/component-release-consumption.component.ts
bun run type-build
bun run type-build:components
bun run check:styles
bun run test:e2e e2e/component-release-recovery.pw.ts e2e/video-resource-consumption.pw.ts
```

浏览器用例面向正式构建产物，另覆盖 `e2e/plugin-workspaces.pw.ts`、`e2e/demo-workspaces.pw.ts`、`e2e/page-experience.pw.ts` 的原有演示能力。macOS Codex 沙箱中需按工作区指令为浏览器启动命令取得实际执行授权。

## 校验记录

- 组件库：`bun run verify` 通过，305 条核心测试、289 条组件回归，55 个按需入口、类型声明、ESM/CJS 消费契约及体积预算通过；npm latest 为 `0.17.3`，发布包 SHA512 与本地验证包一致。
- Robot_Admin：正式 registry 安装 `0.17.3`；`bun run verify` 通过，246 条项目测试、105 条组件挂载回归、生产演示与 application 两套构建通过。ESLint 保留 10 条既有提示，本轮修改无新增提示。
- 展开表浏览器测量：父表选择/展开/序号为 40/40/50 px，子表选择/序号为 40/50 px；密度以业务单元格验证，选择格固定零内边距不用于密度取样；子表序号标题在舒适密度下也保持单行。
- 浏览器：56 项相关验收通过，覆盖三种密度、明暗窄屏、真实媒体、图编辑器、甘特与工作台；冻结锁文件离线安装检查通过。
- 架构分支只读检查：`micro-app`、`module-federation` 仍使用组件库 `0.13.0`，`monorepo` 使用独立 workspace 布局，本轮仅同步目标项目 main/dev，架构分支需要单独迁移验证。

## 安全审计边界

2026-10-20 核查官方 npm 元数据与主公告后，应用根配置固定 `handlebars=4.7.10`，对应修复本轮三项 Handlebars 公告，实际锁文件已固定该版本，`bun run security:audit` 复核后不再报告 Handlebars，仍报告下方两项上游公告。[Own Property 公告](https://github.com/advisories/GHSA-p8wg-vrv2-v86f)、[内联预编译公告](https://github.com/advisories/GHSA-xw65-4hp5-5hc7)、[AST 公告](https://github.com/advisories/GHSA-8r5x-fm3f-whwj)。

以下两条依赖仍有未修复公告：

- `braces` 官方 latest 仍为 `3.0.3`，本次栈递归公告尚列无修复版。实际来自 `lint-staged`、ESLint 配置与 Commitizen 的 `micromatch` 开发工具链，不是页面运行时依赖；本次浏览器产物未发现其入口。[官方版本](https://registry.npmjs.org/braces/latest)、[公告](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)。
- `sprintf-js` 官方 latest 为 `1.1.3`，公告尚列无修复版。安装树包含 `组件库 → mammoth → argparse 1.x → sprintf-js`；已发布的 Mammoth latest `1.13.0` 仍声明 `argparse ~1.0.3`。预览实际调用 `mammoth.convertToHtml`，`argparse` 的引用位于 `mammoth/bin/mammoth` CLI，未在其浏览器/转换模块中找到引用；本轮标准与 application 构建产物也未发现 `ArgumentParser`、`sprintf-js` 等 CLI 特征。此结论说明当前入口的可达边界，不能代替依赖树审计通过。[sprintf 官方版本](https://registry.npmjs.org/sprintf-js/latest)、[Mammoth 官方版本](https://registry.npmjs.org/mammoth/latest)、[公告](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)。

根 overrides 只保护当前应用的安装解析，不会自动传递到组件库消费者。Mammoth 主分支已迁移到 `argparse ^3.0.3`，后续须等对应正式版本并验证文档转换与消费契约，再从组件库的生产依赖入口消除旧链；直接升级无修复的 `sprintf-js` 或仅在组件库填写 overrides 均不能完成这一步。[Mammoth 主分支](https://github.com/mwilliamson/mammoth.js/blob/master/package.json)、[npm overrides 规则](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides)。本轮保留审计原始结果，不新增忽略项。

本轮 GitHub Actions 运行受账户 billing 状态阻断；Vercel 是独立部署通道，其结果不能替代 Actions 与安全审计结论。
