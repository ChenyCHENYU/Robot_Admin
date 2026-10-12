<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-12
 * @FilePath: \Robot_Admin\docs\internationalization.md
 * @Description: 从 README 收敛的国际化接入、补丁与翻译维护说明
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 国际化维护

语言切换使用组件库的 `C_Language`，自动扫描与编译使用 `vite-auto-i18n-plugin`。已有翻译始终可切换，普通开发和生产构建不调用翻译 API。

- `src/config/i18n.ts`：统一语言 key（`zh-cn / en / ja / ko`）、命名空间和持久化 key `robot_admin`。
- `lang/zh-cn.json`：中文源词条；`en.json / ja.json / ko.json`：按语言拆分的扁平词典。
- `src/utils/d_i18n.ts`：配置词典路径并导出包的运行时实例。中文不加载其他词典；外语只请求当前语言。
- `src/stores/language/index.ts`：同步组件库语言、Naive UI 文案与日期 locale。切换保留一次刷新，保证模块级文案、标签页与菜单一致。

`VITE_I18N_ENABLED=false` **仅关闭联网生成新翻译**，编译插件仍会把中文替换为运行时 `$t(hash, 原文, 'robot_admin')`。未翻译的词条回退原文；公司名称、路由路径、权限标识不依赖翻译结果。扫描覆盖项目页面和组件，依赖包内部的文案需通过组件自己的 locale 或文案 props 配置。

依赖固定为 `vite-auto-i18n-plugin@1.1.16`，Bun 通过 `patchedDependencies` 自动应用 `patches/` 中的适配补丁，无需使用者手动修改 `node_modules`。`/adapter` 承接 Vite 8 查询模块、源码映射、只读离线编译和有界编译缓存；`/runtime` 承接按需加载、并发去重、最新选择保护、存储容错、命名空间隔离和有界文案缓存。运行时入口不包含 Babel、Node 或联网翻译 SDK。升级上游版本时必须审核补丁并运行国际化测试，不可直接移除补丁。

配套的 `auto-i18n-plugin-core@1.1.16` 补丁移除深度扫描和 JSX 的调试输出，修复多行文案中的代码块、反斜杠和字面插值转义，并保留中文回退文案的原始引号。普通开发不会整理、生成或覆盖词典，也不启动自动翻译定时器或输出翻译进度。缺少词典或网络加载失败时回退中文，单个语言最多提示一次；修复资源后可重试。切换语言仍会刷新页面以更新静态文案，尚未保存的页面输入会随刷新丢失。

新增或修改菜单后，运行 `bun run gen:route-i18n` 更新扫描入口。需要生成新翻译时，在未跟踪的 `envs/.env.local` 中配置 `YOUDAO_APP_ID`、`YOUDAO_APP_KEY`，然后运行：

```bash
bun run i18n:generate
```

这条命令显式启用有道 API，扫描全部页面并更新拆分词典；临时构建放在 `node_modules/.cache/i18n-scan`。审核翻译文件后再执行常规构建 `bun run build`。API 凭据只用于本机或 CI，不使用 `VITE_` 前缀、不进入客户端产物。

切换语言使用的是语言 key 和已有词典，**不需要有道 App Key**。插件生成的 hash 是自动索引，项目只维护中文原文，无需逐页手写编号 key。
