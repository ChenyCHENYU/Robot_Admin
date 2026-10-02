# 模块联邦架构示例

本分支在 Robot Admin `2.6.3` 的单体基线上演示组件级模块联邦，不改变单体主线的运行方式。当前已验证的路径是：主应用单独发布 `C_Form`、`C_Table`、`C_Tree`、`C_Icon`、`C_Editor`，物流子应用在浏览器中按需加载。`federation/bridge/` 保留应用级桥接的探索代码，但它没有纳入当前浏览器验收；不要据此宣称完整应用级联邦已经可用。

## 版本与构建边界

- 根应用与物流子应用均标记 `2.6.3`；组件库为 `@robot-admin/naive-ui-components@0.13.0`。
- 联邦插件固定为 `@module-federation/vite@1.13.5`，Vite 为 `8.2.2`。按锁文件安装，避免两个容器意外使用不同的共享依赖。
- `bun run build` 只构建普通单体 SPA，不注入联邦运行时；`bun run build:remote` 使用 `federation/remote.html` 单独构建五个暴露模块，输出到 `dist/federation/`。两个构建互不删除对方的产物。
- `bun run build:logistics` 构建消费端到 `sub-apps/logistics/dist/`。根目录 Vercel 构建命令同时构建 SPA 和远程入口，但不部署物流子应用。

```bash
bun install --frozen-lockfile
bun run build
bun run build:remote
bun run --cwd sub-apps/logistics type-build
bun run build:logistics
bun run test:e2e:federation
```

运行 `bun run verify:federation` 可一次执行单体质量门禁、远程与物流端构建，以及浏览器联调。也可单独执行 `bun run test:e2e:federation`；它会在 `127.0.0.1:1988` 和 `127.0.0.1:2001` 启动两个预览服务，验证远程组件真实加载及运单筛选。

## 部署与环境

物流端的 `VITE_MF_REMOTE_URL` 必须在**构建物流端时**设为可访问的绝对 URL，且指向宿主的 `/federation/remoteEntry.js`。本地缺省为 `http://127.0.0.1:1988/federation/remoteEntry.js`，不能把这个地址用于线上物流端。远程入口和 `mf-manifest.json` 使用 no-cache；带 hash 的 `/federation/js/*` 和 `/federation/assets/*` 可长期缓存。远程域名必须给入口及所有 JS/CSS chunk 设置允许物流端访问的 CORS 响应头。现有 `vercel.json` 为联邦目录提供这些头；其他托管平台需配置同等规则。

发布时先确保新远程入口及其全部 chunk 可访问，再切换物流端使用的入口地址。不能只替换 `remoteEntry.js`，也不能先删除旧 hash chunk；否则旧会话可能在懒加载时失败。独立部署的物流端需要自己的 SPA 回退路由和安全头，不能直接复用根目录的部署脚本。

## 运行时约束

两端共享 Vue、Vue Router、Pinia、Naive UI，并使用 `shareStrategy: 'loaded-first'`。`version-first` 在当前 Vite 8/插件组合下会让两个容器启动时互等，表现为网络请求均成功但页面空白。这个行为由浏览器联调覆盖，升级联邦插件时必须重新验证。

暴露入口采用组件库的深层入口及对应 CSS，避免从包根入口引入整个组件库。消费端以 `defineAsyncComponent` 按需加载，类型从同版本组件库的公开深层入口获取。表单和表格的配置应遵循组件库当前 API，例如 `C_Form` 使用 `v-model` 和 `config.layout`，`C_Table` 列使用 `key/title` 并指定 `row-key`。远程加载错误要展示明确错误状态，不要默默渲染空组件。

`MfRemoteContainer` 用于需要宿主主题继承或样式隔离的嵌入场景；物流端作为独立页面直接消费远程组件，不需要无条件包一层容器。应用级桥接模块与 Vue Router 5 的兼容性尚未完成端到端验证，生产场景请只采用这里已测试的组件级方案。

## 故障定位

1. 检查 `remoteEntry.js`、被请求的联邦 chunk 和 CSS 是否为 200，且跨域响应头存在。
2. 检查物流端构建产物中实际写入的远程 URL，而不是只看运行时环境变量。
3. 如果资源成功但 `#app` 为空，优先检查共享依赖初始化与 `shareStrategy`，不要只延长组件加载超时。
4. 运行 `bun run test:e2e:federation`。测试会捕获浏览器异常、请求失败和 HTTP 错误，并断言 Form/Table 的实际交互。
