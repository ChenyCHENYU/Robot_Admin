# 组件运行时回归

这组回归通过独立的 Vite 生产构建消费当前安装的 `@robot-admin/naive-ui-components`，覆盖大数据渲染与同一页面反复挂载资源的释放。它不修改业务菜单、鉴权或生产路由，也不使用源码别名替代发布包。

## 执行

先安装要验收的正式版本或已冻结发布包，记录版本与包校验和，再执行：

```bash
bunx vue-tsc --noEmit -p tsconfig/tsconfig.runtime.json
bunx vite build --config vite.runtime-regression.config.ts
bunx playwright test --config playwright.runtime.config.ts --list
bunx playwright test --config playwright.runtime.config.ts
```

浏览器运行会启动仅监听 `127.0.0.1:4176` 的生产预览。前一条 `--list` 只列出测试，不启动浏览器。macOS Codex 的 seatbelt 环境必须将最后一条作为具体命令交给执行工具并使用 `sandbox_permissions=require_escalated`；启动前检查会拒绝仍在 seatbelt 的进程，不能删除环境标记或加 `--no-sandbox` 绕过。普通终端遵循项目原有执行约定。

构建目录为 `node_modules/.cache/runtime-regression`；三内核运行结果与测量附件写入 `node_modules/.cache/runtime-regression-results.json`，失败 trace 写入 Playwright 的 `test-results`。这些目录不提交。

## 固定场景与硬断言

| 场景   | 数据与次数                                                | 断言                                                                                                      |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 瀑布流 | 1,200 项，4 列，600px 滚动容器，24 次挂载/卸载            | 默认窗口化时首尾挂载均少于 120 项；滚到最后一项仍得到原始索引 1,199；回顶正常；关闭窗口化可以展示全部项目 |
| 大表单 | 240 个输入字段，24 次挂载/卸载                            | 首尾值跨挂载保留；卸载后表单节点消失，观察目标恢复基线                                                    |
| 编辑器 | Markdown 含 CodeMirror、富文本各 12 次交替挂载            | 编辑内容可见；卸载后编辑器节点消失；观察目标恢复基线；按需 CSS 加载后基础宿主按钮的计算样式不变           |
| 媒体   | 本地 PCM WAV 与 VP9 WebM 各 12 次挂载，每次更换来源后卸载 | 对浏览器声明支持的格式实际加载并调用播放；卸载后原生媒体暂停、来源清空；宿主创建的 Blob URL 全部释放      |

所有场景都检查未捕获脚本异常。媒体结果逐内核记录 `canPlayType`；不支持的格式只验证生命周期，并明确 `decoded: false`，不视为该格式解码或播放已验证。Blob URL 由夹具创建并由夹具释放，验证的是使用侧资源所有权闭环，不暗示组件会替宿主撤销传入 URL。

## 资源探针与测量边界

探针继承浏览器原生 `ResizeObserver` 和 `IntersectionObserver`，原样转发构造回调、`observe`、`unobserve`、`disconnect`。只有原生操作成功后才更新目标集合；重复观察去重，断开后删除登记。观察器和目标均用 `WeakRef` 记录，探针不会通过强引用延长其生命周期；仍存活且未解除观察的脱离文档目标照常计数，并保留首次观察调用栈帮助定位。Blob URL 同样在浏览器原生方法成功后记录。探针不模拟布局、交集、媒体事件或播放状态。

音频播放器通过公开播放按钮延迟创建原生 `Audio`，该元素不必插入 DOM。探针透明转发原生 `Audio` 构造器并弱引用记录返回对象，报告分别包含 DOM 媒体节点数与程序创建的音频数。测试只在播放、换源及卸载断言期间持有短期句柄，确认旧实例与当前实例均已暂停、移除 `src` / 子 `source`，并恢复 `readyState=HAVE_NOTHING`、`networkState=NETWORK_EMPTY` 后立即释放句柄。`programmaticMediaLive` 只描述尚可观测的对象数量，不要求 GC 将它归零；硬断言要求仍在播放、携带来源或未清空媒体状态的 `programmaticMediaActive` 恢复基线。

2026-10-24 的 Chromium、Firefox、WebKit 原生对照未加载组件或资源探针：`new Audio()` 播放本地 WAV 后执行 `pause()`、移除 `src` 和 `load()`，三内核都恢复暂停、空来源及上述空媒体状态，但仍保留历史 `currentSrc`。因此 `currentSrc` 只进入诊断附件，不能单独认定资源仍在使用；测试没有改写它或用撤销 Blob URL 代替播放器清理。

硬断言关注可直接确认的 DOM、仍被观察的目标、脱离文档却仍被观察的目标、未释放媒体来源和 Blob URL。堆内存仅在浏览器实际提供 `performance.memory` 时报告，其他内核为 `null`；同时记录 GC 接口是否存在，但不强制 GC。观察计数归零不等于证明不存在堆泄漏。堆数值、每轮耗时和浏览器版本保存为 JSON 附件，不设置与硬件相关的毫秒或 FPS 门槛。

这是一组有限轮次的回归，不等价于长时间堆快照分析，也不覆盖远程流媒体、DRM 或全部编解码器。动态模块和样式首次加载后由浏览器缓存，保留缓存不算组件实例泄漏。

## 验收记录

2026-10-24 实际执行结果见[测量记录](./runtime-regression-20261024.json)。记录由 Playwright JSON 附件提取，包含每轮数据、浏览器版本、最终资源状态及原报告 SHA256。正式 npm 安装后逐文件核对了组件包 606 个文件、文件工具包 67 个文件，均与验收归档完全相同。

| 项目                     | 记录                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 组件包版本 / SHA256      | `0.22.0` / `ef0d26ba40ea6af0f9c96af21974363d304f9893fe36759f92202d8c8d82e6f2`                                          |
| App 源码 / 构建命令      | 基于 `df5aaa4` 的本次运行时收敛提交；`bun run type-build:runtime`、`bun run build:runtime`、`bun run test:e2e:runtime` |
| Chromium 版本与结果      | `153.0.8010.12`，4 / 4 通过                                                                                            |
| Firefox 版本与结果       | `155.0`，4 / 4 通过                                                                                                    |
| WebKit 版本与结果        | `26.6`，4 / 4 通过                                                                                                     |
| 瀑布流首部 / 底部 DOM 数 | 1,200 项时三内核均为 20 / 18 张卡片；变高、键盘跨窗口、嵌套滚动及 3 档宽度通过                                         |
| 表单 / 编辑器 / 媒体轮次 | 每内核：240 字段表单 24 次；Markdown / 富文本各 12 次；音频 / 视频各 12 次并换源                                       |
| 媒体真实解码支持         | 三内核均声明支持本地 PCM WAV 与 VP9 WebM；每轮实际播放并验证时间推进                                                   |
| 资源基线与最终值         | 三内核各场景的 RO / IO / 脱离文档观察目标 / Blob URL / 活动媒体均恢复 0；音视频清空来源并归零就绪与网络状态            |
| 耗时、heap、GC 可用性    | 原测量值保存在 JSON；Chromium 返回精度受限的 heap，其他内核无 heap 接口，均无强制 GC                                   |

浏览器二进制存在只说明可以尝试运行，不能替代真实测试通过记录。

## API 兼容入口复核

在组件库源码运行只读 AST 工具：

```bash
bun scripts/check-legacy-usage.js /path/to/Robot_Admin/src --global-components --strict --json
```

本轮检查 394 个文件，确定旧 API 为 0、解析错误为 0；工具保留 4 处动态组件的未静态解析标记，另行人工核对：

| 位置                        | 动态目标与结论                                 |
| --------------------------- | ---------------------------------------------- |
| `demo/07-form`              | 8 个本地布局组件；模型与各布局使用当前表单接口 |
| `preview/PreviewLayout.vue` | RouterView 提供的页面组件，仅传路由 key        |
| `sys-manage/role-manage`    | 详情展示中的原生 div 与 Naive NTag             |
| `sys-manage/user-manage`    | 详情展示中的原生 div 与 Naive NTag             |

主布局菜单已使用 `modelValue`，仍由现有路由决定选中值并通过 `select` 导航。组件包中的兼容入口继续保留，迁移不增加使用侧类型包装。
