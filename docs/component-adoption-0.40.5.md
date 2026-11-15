<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @Description: 正式组件依赖升级、使用侧收敛与验收边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 组件库 0.40.5 接入核对

Robot_Admin 从 npm 正式安装并精确锁定 `@robot-admin/naive-ui-components@0.40.5`。组件库先完成中英文 README、组件选择和迁移指南，再发布文档补丁；运行时与 0.40.4 相同。应用未启用本地包替换或源码别名，MachTable 继续使用 `@agile-team/mach-table-vue@0.42.0`。

## 页面使用方式

| 场景                 | 本轮收敛                                                                                                  | 业务边界                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 表单、级联、搜索     | 使用公开 `CascadeProps / CascadeValue`；网格响应式开关实际控制布局；搜索重置走 `searchOnReset + onSearch` | 页面保留字段配置、查询草稿和提交动作             |
| 自定义展开表         | 包内管理严格／宽松联动、行资格和选择快照；页面仅桥接子表差异键                                            | 子表业务列、详情加载和重试由页面提供             |
| 操作按钮             | 直接使用 `ActionBarConfig`，分隔方向通过 `dividerType` 切换                                               | 不增加项目按钮包装层和补丁样式                   |
| 验证码、条码、二维码 | 复用包内协议、属性类型及公开实例类型                                                                      | 格式说明、示例数据、下载流程保留在页面           |
| 代码与富文本         | 删除页面重复的语言加载、主题传递和配置类型；富文本配置放入 `data.ts`                                      | 代码文件草稿、保存和下载仍由页面管理             |
| 审批与图编辑         | 复用工作流公开类型；展示连线信息和分支去向；只读切换保留当前画布实例                                      | 场景草稿、审批人员顺序和本机保存由项目管理       |
| 签名                 | 使用组件的隔离快照，移除重复 JSON 深拷贝；接通橡皮尺寸                                                    | 页面保留快照列表、恢复及导出                     |
| 瀑布流、进度         | 瀑布流从业务条目推导字段；进度业务模拟在缓存离开时暂停                                                    | 不把业务模型改成组件的宽泛记录类型               |
| 全局导航与反馈       | 删除同义默认配置、菜单适配断言和手写实例子集；纠正引导说明                                                | 菜单权限、导航、消息业务协议与焦点管理仍属于应用 |

清理未使用的时间场景配置；未新增通用包装组件、额外状态库、全局 CSS 或主题变量覆盖。

## 63 个公开组件的核对范围

通过应用本地 MCP 逐项查询实际安装的 0.40.5 API，再核对正式声明与源码调用。以下列出全部公开组件；稳定调用保持现有写法，不为版本升级强行改写。

| 分组         | 核对组件                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 表单与查询   | `C_Form`、`C_FormModal`、`C_FormSearch`、`C_Date`、`C_Time`、`C_Select`、`C_AutoComplete`、`C_Cascade`、`C_Transfer`、`C_Density`、`C_ErrorSummary`、`C_BatchResult`、`C_SectionNav`         |
| 列表与操作   | `C_Table`、`C_ActionBar`、`C_Tree`、`C_OrgChart`、`C_UserPicker`、`C_DataPicker`、`C_Tabs`                                                                                                   |
| 导航与反馈   | `C_Menu`、`C_Breadcrumb`、`C_TagsView`、`C_GlobalSearch`、`C_Language`、`C_Theme`、`C_Guide`、`C_ContextMenu`、`C_CollapsePanel`、`C_PageLoading`、`C_Loading`、`C_NotificationCenter`       |
| 展示与输入   | `C_Icon`、`C_Code`、`C_Editor`、`C_Markdown`、`C_Steps`、`C_Progress`、`C_WaterFall`、`C_Timeline`、`C_Skeleton`、`C_AvatarGroup`、`C_City`、`C_Captcha`、`C_Login`、`C_Barcode`、`C_QRCode` |
| 图形与工作区 | `C_SplitPane`、`C_WorkFlow`、`C_AntV`、`C_FullCalendar`、`C_VtableGantt`、`C_Draggable`、`C_Map`、`C_FormulaEditor`                                                                          |
| 文件与媒体   | `C_FilePreview`、`C_Upload`、`C_Signature`、`C_ImageCropper`、`C_Chat`、`C_AudioPlayer`、`C_VideoPlayer`、`C_Cron`                                                                           |

应用有 62 个组件的直接源码调用；`C_NotificationCenter` 的公共 API 已核对，但应用消息入口使用独立企业消息业务工作区，未为了升级强行替换。`C_Tabs` 在 MachTable 场景页的用法兼容，本轮未改该页及其专项实现。

## 验证记录

| 检查             | 结果                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 静态检查         | Oxlint 0 错误／0 告警；ESLint 0 错误，保留 10 项未涉及文件的既有复杂度告警；样式边界通过          |
| 类型             | 应用、Node 配置、组件测试、表格、三浏览器夹具与新增消费 E2E 均通过                                |
| 业务测试         | 72 文件、316 项通过，1,971 次断言                                                                 |
| 组件挂载         | 38 文件、189 项通过（`bun run test:components --maxWorkers=2`）                                   |
| 生产构建         | production 与 application 两种构建通过；均使用正式安装包                                          |
| 体积预算         | 入口 140.36 KiB；预加载 794.00 KiB／90 个；样式 298.88 KiB；首屏合计 1,233.24 KiB；原预算检查通过 |
| 页面浏览器回归   | 115 项通过：既有 113 项，加本轮 2 项父子选择／按钮分隔方向消费回归                                |
| 跨浏览器资源回归 | Chromium／Firefox／WebKit 共 27 项通过；包含 400 字段、1,200 项窗口化、反复挂载、媒体换源与卸载   |
| 依赖安全         | 0 项告警，67 项实际行为检查通过                                                                   |
| 文档与格式       | 150 个相对链接目标存在；改动文件格式及 diff 检查通过                                              |

首次 `verify` 的默认并发挂载阶段，已有矩阵打印测试在 5 秒限制内超时；未修改该测试或业务实现。使用 2 个工作进程重跑全部挂载测试后通过，其后构建与预算步骤也已逐项执行通过。新增浏览器测试首次将 Naive 的隐藏 radio 当作可见输入，已改为点击可见标签并重跑通过；禁用复选框同时验证禁用样式及全选不可带起其选中状态。

组件库提交 [08ccb6c](https://github.com/ChenyCHENYU/naive-ui-components/commit/08ccb6c1e2a405dc9c706ec572e3853bd1b6b1ae) 的 [GitHub CI](https://github.com/ChenyCHENYU/naive-ui-components/actions/runs/43737938919) 因账户计费锁定未启动任何检查步骤；不能将其记为远端 CI 通过。该发布已完成本地完整校验和 npm 发布完整性核对。

验证使用正式安装的包，未提高体积预算。生产演示继续使用项目既有本地源，不将本轮验证描述为真实业务后端或生产性能验收。

## 分支同步边界

本轮交付同步 `main / dev`。本项目未安装 PC Kit，按自身 `branch-sync / convention-audit` 及实际工程命令核验。

| 架构分支            | 后续同步建议                 | 需要独立验证的内容                     |
| ------------------- | ---------------------------- | -------------------------------------- |
| `micro-app`         | 升级依赖并选择性同步页面收敛 | 门户和子应用各自安装、主题及权限上下文 |
| `module-federation` | 升级依赖并选择性同步页面收敛 | 远程模块、共享依赖及容器内样式加载     |
| `monorepo`          | 按 workspace 清单同步        | 应用目录、workspace 引用与各应用构建   |

三个架构分支只记录建议，本轮不执行架构变基。它们的运行验证不能由 SPA 主线结果替代。
