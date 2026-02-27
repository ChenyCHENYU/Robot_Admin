# Robot Admin C\_ 组件迁移分析报告

## 📋 概述

本报告对 `src/components/global/` 目录下所有 **C\_** 开头的组件进行全面分析，评估其迁移到独立组件库的可行性、优先级和迁移方案。

---

## 📊 组件总览

| 序号 | 组件名称        | 复杂度 | 依赖等级 | 迁移优先级 | 迁移难度 |
| ---- | --------------- | ------ | -------- | ---------- | -------- |
| 1    | C_ActionBar     | 中     | 中       | P1         | 中       |
| 2    | C_AntV          | 高     | 高       | P2         | 高       |
| 3    | C_Barcode       | 低     | 低       | P3         | 低       |
| 4    | C_Breadcrumb    | 低     | 高       | P3         | 低       |
| 5    | C_Captcha       | 低     | 低       | P3         | 低       |
| 6    | C_Cascade       | 低     | 低       | P3         | 低       |
| 7    | C_City          | 中     | 低       | P2         | 低       |
| 8    | C_Code          | 中     | 低       | P2         | 中       |
| 9    | C_CollapsePanel | 中     | 低       | P1         | 中       |
| 10   | C_Cron          | 高     | 低       | P1         | 高       |
| 11   | C_Date          | 中     | 低       | P2         | 低       |
| 12   | C_Draggable     | 中     | 低       | P1         | 中       |
| 13   | C_Editor        | 中     | 低       | P3         | 中       |
| 14   | C_FilePreview   | 高     | 高       | P1         | 高       |
| 15   | C_Footer        | 低     | 高       | P3         | 低       |
| 16   | C_Form          | 高     | 高       | P1         | 高       |
| 17   | C_FormSearch    | 中     | 高       | P1         | 中       |
| 18   | C_FormulaEditor | 高     | 低       | P1         | 高       |
| 19   | C_FullCalendar  | 中     | 中       | P2         | 中       |
| 20   | C_GlobalSearch  | 中     | 高       | P2         | 中       |
| 21   | C_Guide         | 低     | 低       | P3         | 低       |
| 22   | C_Header        | 低     | 高       | P3         | 低       |
| 23   | C_Icon          | 高     | 低       | P1         | 中       |
| 24   | C_ImageCropper  | 高     | 中       | P1         | 高       |
| 25   | C_Language      | 低     | 高       | P3         | 低       |
| 26   | C_Layout        | 低     | 高       | P3         | 低       |
| 27   | C_Map           | 中     | 中       | P2         | 中       |
| 28   | C_Markdown      | 中     | 中       | P2         | 中       |
| 29   | C_Menu          | 中     | 高       | P3         | 中       |
| 30   | C_MenuTop       | 低     | 低       | P3         | 低       |
| 31   | C_NavbarRight   | 中     | 高       | P3         | 中       |
| 32   | C_Notice        | 中     | 高       | P3         | 中       |
| 33   | C_Progress      | 中     | 低       | P2         | 中       |
| 34   | C_QRCode        | 低     | 低       | P2         | 低       |
| 35   | C_ReLoginDialog | 低     | 高       | P3         | 低       |
| 36   | C_Settings      | 低     | 高       | P3         | 低       |
| 37   | C_Signature     | 高     | 低       | P1         | 高       |
| 38   | C_SplitPane     | 中     | 低       | P1         | 中       |
| 39   | C_Steps         | 低     | 低       | P2         | 低       |
| 40   | C_Table         | 高     | 高       | P1         | 高       |
| 41   | C_Theme         | 低     | 高       | P3         | 低       |
| 42   | C_Time          | 中     | 低       | P2         | 低       |
| 43   | C_TagsView      | 中     | 高       | P3         | 中       |
| 44   | C_Tree          | 中     | 低       | P1         | 中       |
| 45   | C_VideoPlayer   | 极高   | 中       | P1         | 极高     |
| 46   | C_VtableGantt   | 高     | 中       | P2         | 高       |
| 47   | C_WaterFall     | 高     | 低       | P1         | 高       |
| 48   | C_WorkFlow      | 高     | 中       | P1         | 高       |

---

## 🎯 迁移优先级分类

### P1 - 高优先级（核心业务组件）

这些组件具有高复用性、低业务耦合度，适合优先迁移：

| 组件                | 理由                                        | 迁移收益                             |
| ------------------- | ------------------------------------------- | ------------------------------------ |
| **C_Form**          | 表单是后台系统核心，配置化设计优秀          | 可独立维护表单引擎，多项目复用       |
| **C_Table**         | 超级表格功能丰富，"薄UI壳+厚Composable"架构 | 可独立维护表格引擎，降低主项目复杂度 |
| **C_FilePreview**   | 文件预览功能独立性强                        | 可作为独立包发布，支持多种文件格式   |
| **C_Cron**          | Cron表达式编辑器独立性强                    | 可作为独立工具包发布                 |
| **C_FormulaEditor** | 公式编辑器独立性强                          | 可作为独立工具包发布                 |
| **C_Signature**     | 电子签名功能独立                            | 可作为独立包发布                     |
| **C_ImageCropper**  | 图片裁剪功能独立                            | 可作为独立包发布                     |
| **C_CollapsePanel** | 折叠面板通用性强                            | 可作为基础UI组件发布                 |
| **C_Draggable**     | 拖拽功能通用性强                            | 可作为基础UI组件发布                 |
| **C_SplitPane**     | 分割面板通用性强                            | 可作为基础UI组件发布                 |
| **C_Tree**          | 树形组件通用性强                            | 可作为基础UI组件发布                 |
| **C_WaterFall**     | 瀑布流布局通用性强                          | 可作为独立布局组件发布               |
| **C_WorkFlow**      | 工作流组件独立性强                          | 可作为独立业务组件发布               |
| **C_VideoPlayer**   | 视频播放器功能完整独立                      | 可作为独立媒体组件发布               |
| **C_Icon**          | 图标组件基础性强                            | 可作为基础工具组件发布               |
| **C_ActionBar**     | 操作按钮栏配置化设计优秀                    | 可作为独立业务组件发布               |
| **C_FormSearch**    | 表单搜索功能独立                            | 可作为独立业务组件发布               |

### P2 - 中优先级（业务辅助组件）

这些组件有一定复用性，但可能包含特定业务逻辑：

| 组件               | 理由                   | 迁移收益                 |
| ------------------ | ---------------------- | ------------------------ |
| **C_AntV**         | 图表组件封装，依赖AntV | 可统一图表组件封装       |
| **C_City**         | 城市选择器独立性强     | 可作为独立数据组件发布   |
| **C_Code**         | 代码高亮组件独立性强   | 可作为独立工具组件发布   |
| **C_Date**         | 日期选择器封装         | 可作为基础UI组件发布     |
| **C_FullCalendar** | 日历组件封装           | 可作为独立业务组件发布   |
| **C_GlobalSearch** | 全局搜索功能独立       | 可作为独立功能组件发布   |
| **C_Map**          | 地图组件封装           | 可作为独立地图组件发布   |
| **C_Markdown**     | Markdown编辑器封装     | 可作为独立编辑器组件发布 |
| **C_Progress**     | 进度条组件封装         | 可作为基础UI组件发布     |
| **C_QRCode**       | 二维码组件独立         | 可作为独立工具组件发布   |
| **C_Steps**        | 步骤条组件封装         | 可作为基础UI组件发布     |
| **C_Time**         | 时间选择器封装         | 可作为基础UI组件发布     |
| **C_VtableGantt**  | 甘特图组件封装         | 可作为独立业务组件发布   |

### P3 - 低优先级（项目特定组件）

这些组件与当前项目耦合度较高，或过于简单不适合独立维护：

| 组件                | 理由                        |
| ------------------- | --------------------------- |
| **C_Barcode**       | 功能简单，与QRCode类似      |
| **C_Breadcrumb**    | 与路由系统强耦合            |
| **C_Captcha**       | 验证码组件，业务特定性强    |
| **C_Cascade**       | 级联选择器，功能简单        |
| **C_Editor**        | 富文本编辑器，已有成熟方案  |
| **C_Footer**        | 项目特定，无复用价值        |
| **C_Guide**         | 项目特定引导功能            |
| **C_Header**        | 与布局系统强耦合            |
| **C_Language**      | 与国际化系统强耦合          |
| **C_Layout**        | 已使用@robot-admin/layout包 |
| **C_Menu**          | 与路由系统强耦合            |
| **C_MenuTop**       | 项目特定，无复用价值        |
| **C_NavbarRight**   | 项目特定，无复用价值        |
| **C_Notice**        | 项目特定通知功能            |
| **C_ReLoginDialog** | 项目特定登录逻辑            |
| **C_Settings**      | 已使用@robot-admin/layout包 |
| **C_Theme**         | 与主题系统强耦合            |
| **C_TagsView**      | 与路由系统强耦合            |

---

## 🔍 组件详细分析

### 1. C_Form（表单组件）

**文件结构：**

```
C_Form/
├── index.vue (314行)
└── layouts/
    ├── Card/
    ├── Custom/
    ├── Default/
    ├── Dynamic/
    ├── Grid/
    ├── Inline/
    ├── Steps/
    └── Tabs/
```

**依赖分析：**

- 外部依赖：Naive UI
- 内部依赖：`@/composables/Form/*` (5个composables)
- 类型定义：`@/types/modules/form.d.ts`

**架构特点：**

- "薄UI壳 + 厚Composable引擎"设计
- 支持7种布局模式
- 配置化表单项渲染

**迁移建议：**
✅ **强烈推荐迁移**

- 可独立维护表单引擎
- 需要同步迁移所有Form相关composables
- 需要提取类型定义

---

### 2. C_Table（超级表格）

**文件结构：**

```
C_Table/
├── index.vue (408行)
└── components/
    └── ColumnSettings/
```

**依赖分析：**

- 外部依赖：Naive UI
- 内部依赖：`@/composables/Table/*` (8个composables)
- 类型定义：`@/types/modules/table.d.ts`

**架构特点：**

- "薄UI壳 + 厚Composable引擎"设计
- 支持编辑、选择、展开、分页、动态行、工具栏
- 内置列设置功能

**迁移建议：**
✅ **强烈推荐迁移**

- 可独立维护表格引擎
- 需要同步迁移所有Table相关composables
- 需要提取类型定义

---

### 3. C_VideoPlayer（视频播放器）

**文件结构：**

```
C_VideoPlayer/
├── index.vue (459行)
├── types.ts (347行)
├── constants.ts
└── composables/
    ├── index.ts
    ├── useAntiCheat.ts
    ├── useBookmarks.ts
    ├── useChapters.ts
    ├── useKeyboard.ts
    ├── useMiniPlayer.ts
    ├── usePlaybackControl.ts
    ├── usePlayerCore.ts
    ├── useProgressTracker.ts
    ├── useQualitySwitch.ts
    ├── useQuiz.ts
    └── useSubtitle.ts
```

**依赖分析：**

- 外部依赖：xgplayer, xgplayer-hls
- 内部依赖：11个专用composables

**架构特点：**

- 教育场景专用视频播放器
- 支持章节、书签、字幕、测验、防作弊
- 完整的composable架构

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立教育媒体组件发布
- 功能完整独立，无业务耦合
- 迁移难度较高但价值巨大

---

### 4. C_WorkFlow（工作流）

**文件结构：**

```
C_WorkFlow/
├── index.vue (473行)
├── NodeConfigModal.vue
└── nodes/
    ├── ApprovalNode.vue
    ├── ConditionNode.vue
    ├── CopyNode.vue
    └── StartNode.vue
```

**依赖分析：**

- 外部依赖：@vue-flow/core
- 内部依赖：`@/composables/WorkFlow/*`

**架构特点：**

- 基于Vue Flow的审批流编辑器
- 支持多种节点类型
- 可视化流程设计

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立工作流组件发布
- 需要同步迁移WorkFlow composables

---

### 5. C_FilePreview（文件预览）

**文件结构：**

```
C_FilePreview/
├── index.vue (298行)
├── data.ts
└── components/
    ├── ExcelViewer/
    ├── PdfViewer/
    └── WordViewer/
```

**依赖分析：**

- 外部依赖：@tato30/vue-pdf, mammoth, xlsx
- 内部依赖：`@/composables/FilePreview/*`

**架构特点：**

- 支持Excel、PDF、Word预览
- 模态框/卡片双模式
- 全屏支持

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立文件预览包发布
- 功能独立，复用价值高

---

### 6. C_FormulaEditor（公式编辑器）

**文件结构：**

```
C_FormulaEditor/
├── index.vue (348行)
├── constants.ts
└── components/
    ├── FormulaInput.vue
    ├── FormulaPreview.vue
    ├── VariablePanel.vue
    └── VirtualKeyboard.vue
```

**依赖分析：**

- 外部依赖：expr-eval
- 内部依赖：`@/composables/FormulaEditor/*`

**架构特点：**

- 支持变量和函数
- 虚拟键盘输入
- 实时预览和验证

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立公式编辑器发布
- 功能完整独立

---

### 7. C_Cron（Cron表达式编辑器）

**文件结构：**

```
C_Cron/
├── index.vue (754行)
├── constants.ts
└── components/
    ├── CronFieldEditor.vue
    ├── CronPreview.vue
    └── CronTemplates.vue
```

**依赖分析：**

- 外部依赖：无
- 内部依赖：`@/composables/Cron/*`

**架构特点：**

- 可视化Cron表达式编辑
- 支持模板和预览
- 完整的字段编辑器

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立Cron编辑器发布
- 功能完整独立

---

### 8. C_Signature（电子签名）

**文件结构：**

```
C_Signature/
├── index.vue (360行)
└── data.ts
```

**依赖分析：**

- 外部依赖：无
- 内部依赖：`@/composables/Signature/*`

**架构特点：**

- 画笔/橡皮擦切换
- 颜色和粗细调节
- 撤销/重做功能

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立签名组件发布
- 功能完整独立

---

### 9. C_ImageCropper（图片裁剪）

**文件结构：**

```
C_ImageCropper/
├── index.vue (387行)
└── components/
    ├── CropperPreview.vue
    └── CropperToolbar.vue
```

**依赖分析：**

- 外部依赖：vue-cropper
- 内部依赖：`@/composables/ImageCropper/*`

**架构特点：**

- 支持多种裁剪比例
- 旋转、翻转、缩放
- 实时预览

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为独立裁剪组件发布
- 功能完整独立

---

### 10. C_Icon（图标组件）

**文件结构：**

```
C_Icon/
└── index.vue (366行)
```

**依赖分析：**

- 外部依赖：@iconify/vue
- 内部依赖：无

**架构特点：**

- 支持5种图标使用方式
- 统一错误处理
- 可点击、加载状态

**迁移建议：**
✅ **强烈推荐迁移**

- 可作为基础图标组件发布
- 功能独立，复用价值高

---

## 📦 依赖分析

### 外部依赖汇总

| 依赖包                    | 使用组件        | 用途           |
| ------------------------- | --------------- | -------------- |
| naive-ui                  | 所有组件        | 基础UI组件库   |
| @antv/x6                  | C_AntV          | 图表绘制       |
| @chenfengyuan/vue-barcode | C_Barcode       | 条形码生成     |
| @fullcalendar/\*          | C_FullCalendar  | 日历组件       |
| @iconify/vue              | C_Icon          | 图标渲染       |
| @kangc/v-md-editor        | C_Markdown      | Markdown编辑器 |
| @tato30/vue-pdf           | C_FilePreview   | PDF预览        |
| @visactor/vtable-gantt    | C_VtableGantt   | 甘特图         |
| @vue-flow/core            | C_WorkFlow      | 工作流图       |
| echarts                   | C_AntV          | 图表库         |
| expr-eval                 | C_FormulaEditor | 公式计算       |
| highlight.js              | C_Code          | 代码高亮       |
| html2canvas               | 多个组件        | 截图功能       |
| leaflet                   | C_Map           | 地图渲染       |
| mammoth                   | C_FilePreview   | Word预览       |
| motion-v                  | 多个组件        | 动画库         |
| qrcode                    | C_QRCode        | 二维码生成     |
| vue-cropper               | C_ImageCropper  | 图片裁剪       |
| vue-draggable-plus        | C_Draggable     | 拖拽功能       |
| vue3-puzzle-vcode         | C_Captcha       | 拼图验证码     |
| wangeditor                | C_Editor        | 富文本编辑器   |
| xgplayer                  | C_VideoPlayer   | 视频播放器     |
| xlsx                      | C_FilePreview   | Excel预览      |

### 内部Composables依赖

需要同步迁移的Composables目录：

```
src/composables/
├── AntV/              → C_AntV
├── CollapsePanel/      → C_CollapsePanel
├── Cron/              → C_Cron
├── Draggable/         → C_Draggable
├── FilePreview/       → C_FilePreview
├── Form/              → C_Form
├── FormSearch/        → C_FormSearch
├── FormulaEditor/     → C_FormulaEditor
├── FullCalendar/      → C_FullCalendar
├── GlobalSearch/      → C_GlobalSearch
├── ImageCropper/      → C_ImageCropper
├── QRCode/            → C_QRCode
├── Signature/         → C_Signature
├── SplitPane/         → C_SplitPane
├── Table/             → C_Table
├── Time/              → C_Time
├── Tree/              → C_Tree
├── WaterFall/         → C_WaterFall
└── WorkFlow/          → C_WorkFlow
```

### 类型定义依赖

需要同步迁移的类型文件：

```
src/types/modules/
├── action-bar.d.ts
├── calendar.d.ts
├── collapse-panel.d.ts
├── cron.d.ts
├── draggable.d.ts
├── file-preview.d.ts
├── form.d.ts
├── formula-editor.d.ts
├── globalSearch.d.ts
├── image-cropper.d.ts
├── menu.d.ts
├── qrcode.d.ts
├── signature.d.ts
├── split-pane.d.ts
├── table.d.ts
├── time.d.ts
└── waterfall.d.ts
```

---

## 🚀 迁移方案建议

### 方案一：渐进式迁移（推荐）

**阶段1：基础组件迁移（1-2周）**

- C_Icon
- C_Progress
- C_Steps
- C_QRCode
- C_Barcode

**阶段2：业务组件迁移（2-4周）**

- C_ActionBar
- C_CollapsePanel
- C_Draggable
- C_SplitPane
- C_Tree

**阶段3：复杂组件迁移（4-8周）**

- C_Form + composables/Form
- C_Table + composables/Table
- C_FormulaEditor + composables/FormulaEditor
- C_Cron + composables/Cron

**阶段4：独立功能组件迁移（4-6周）**

- C_FilePreview + composables/FilePreview
- C_Signature + composables/Signature
- C_ImageCropper + composables/ImageCropper
- C_WaterFall + composables/WaterFall

**阶段5：高级组件迁移（6-10周）**

- C_VideoPlayer + composables/VideoPlayer
- C_WorkFlow + composables/WorkFlow
- C_AntV + composables/AntV

### 方案二：按模块迁移

**模块A：表单相关**

- C_Form
- C_FormSearch
- C_FormulaEditor
- C_Cron

**模块B：表格相关**

- C_Table
- C_Tree
- C_Draggable

**模块C：媒体相关**

- C_VideoPlayer
- C_FilePreview
- C_ImageCropper
- C_Signature

**模块D：布局相关**

- C_SplitPane
- C_CollapsePanel
- C_WaterFall

### 方案三：按依赖关系迁移

**第一层：无依赖组件**

- C_Icon
- C_Progress
- C_Steps
- C_QRCode
- C_Barcode

**第二层：基础UI组件**

- C_CollapsePanel
- C_Draggable
- C_SplitPane
- C_Tree

**第三层：业务组件**

- C_ActionBar
- C_FormSearch
- C_City
- C_Date
- C_Time

**第四层：复杂组件**

- C_Form
- C_Table
- C_FilePreview
- C_FormulaEditor
- C_Cron

**第五层：高级组件**

- C_VideoPlayer
- C_WorkFlow
- C_AntV

---

## 📝 迁移注意事项

### 1. 组件解耦

**需要移除的业务依赖：**

- 路由系统依赖（C_Breadcrumb, C_Menu, C_TagsView）
- Store依赖（C_Header, C_Layout, C_Settings）
- 国际化依赖（C_Language）
- 主题系统依赖（C_Theme）

**解决方案：**

- 通过props传入必要的状态和回调
- 使用provide/inject解耦
- 提供配置化接口

### 2. 样式处理

**当前样式：**

- 使用SCSS
- 依赖项目主题变量
- 使用UnoCSS工具类

**迁移方案：**

- 提取独立样式文件
- 使用CSS变量支持主题
- 提供样式覆盖接口

### 3. 类型定义

**当前问题：**

- 类型定义分散在`src/types/modules/`
- 部分类型与业务逻辑耦合

**迁移方案：**

- 将类型定义迁移到组件库
- 使用泛型增强灵活性
- 提供完整的TypeScript支持

### 4. Composables迁移

**当前架构：**

- 组件使用"薄UI壳 + 厚Composable引擎"
- Composables位于`src/composables/`

**迁移方案：**

- 将Composables与组件一起迁移
- 保持架构一致性
- 提供独立的Composables导出

### 5. 测试覆盖

**迁移要求：**

- 为每个组件编写单元测试
- 编写集成测试
- 编写E2E测试

**测试工具：**

- Vitest
- Vue Test Utils
- Playwright

---

## 📊 迁移收益评估

### 技术收益

| 收益项         | 说明                   |
| -------------- | ---------------------- |
| **代码复用**   | 组件可在多个项目中复用 |
| **维护性提升** | 独立维护，版本控制清晰 |
| **测试覆盖**   | 组件级测试更易实现     |
| **文档完善**   | 独立文档，使用示例丰富 |
| **类型安全**   | 完整的TypeScript支持   |

### 业务收益

| 收益项       | 说明                       |
| ------------ | -------------------------- |
| **开发效率** | 组件即插即用，减少重复开发 |
| **统一规范** | 统一的API和设计规范        |
| **快速迭代** | 组件独立升级，不影响主项目 |
| **团队协作** | 组件团队专注组件开发       |

### 长期收益

| 收益项       | 说明               |
| ------------ | ------------------ |
| **开源贡献** | 可开源贡献社区     |
| **商业价值** | 可作为商业产品发布 |
| **生态建设** | 构建组件生态体系   |
| **品牌影响** | 提升团队技术影响力 |

---

## 🎯 最终建议

### 迁移策略

1. **采用渐进式迁移方案**
   - 优先迁移P1高优先级组件
   - 按阶段逐步推进
   - 每个阶段完成后评估效果

2. **建立组件库项目**
   - 独立的Git仓库
   - 独立的CI/CD流程
   - 独立的文档站点

3. **保持架构一致性**
   - 继续使用"薄UI壳 + 厚Composable引擎"架构
   - 统一的命名规范
   - 统一的代码风格

4. **完善配套设施**
   - 组件文档
   - 使用示例
   - 单元测试
   - Storybook展示

### 不迁移的组件

以下组件不建议迁移：

| 组件            | 原因                        |
| --------------- | --------------------------- |
| C_Breadcrumb    | 与路由系统强耦合            |
| C_Header        | 与布局系统强耦合            |
| C_Layout        | 已使用@robot-admin/layout包 |
| C_Menu          | 与路由系统强耦合            |
| C_TagsView      | 与路由系统强耦合            |
| C_Language      | 与国际化系统强耦合          |
| C_Theme         | 与主题系统强耦合            |
| C_Settings      | 已使用@robot-admin/layout包 |
| C_ReLoginDialog | 项目特定登录逻辑            |
| C_Notice        | 项目特定通知功能            |

这些组件应保留在主项目中，或考虑迁移到@robot-admin/layout包中。

---

## 📅 迁移时间表

| 阶段         | 时间      | 内容               | 交付物                     |
| ------------ | --------- | ------------------ | -------------------------- |
| **准备阶段** | 第1周     | 搭建组件库项目结构 | 项目骨架                   |
| **阶段1**    | 第2-3周   | 迁移基础组件       | 5个基础组件                |
| **阶段2**    | 第4-5周   | 迁移业务组件       | 5个业务组件                |
| **阶段3**    | 第6-9周   | 迁移复杂组件       | C_Form + C_Table           |
| **阶段4**    | 第10-13周 | 迁移独立功能组件   | 4个独立组件                |
| **阶段5**    | 第14-19周 | 迁移高级组件       | C_VideoPlayer + C_WorkFlow |
| **收尾阶段** | 第20周    | 文档、测试、发布   | 完整组件库                 |

**总计：约5个月**

---

## 📚 参考资料

- [Vue 3 组件库最佳实践](https://vuejs.org/guide/components/registration.html)
- [Naive UI 组件开发指南](https://www.naiveui.com/en-US/os-theme/docs/component-develop-guide)
- [TypeScript 组件开发](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Vite 库模式](https://vitejs.dev/guide/build.html#library-mode)

---

**报告生成时间：** 2026-02-27  
**分析组件数量：** 48个  
**建议迁移组件：** 18个（P1优先级）  
**不建议迁移组件：** 12个（P3优先级）
