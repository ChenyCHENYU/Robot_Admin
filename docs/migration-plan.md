# @agile-team/naive-ui-components 组件迁移方案

> 📅 编制日期：2026-02-27
> 📦 目标仓库：`d:\project\robot\naive-ui-components`（已有 C*Icon、C_Code）
> 📦 源仓库：`d:\project\robot\Robot_Admin`（48 个 C* 组件）

---

## 一、现有组件库架构评估

### 1.1 当前 naive-ui-components 结构

```
naive-ui-components/
├── src/
│   ├── index.ts              # 统一导出 + install 插件
│   ├── components/           # 组件目录（每个组件三件套）
│   │   ├── C_Code/
│   │   │   ├── index.vue
│   │   │   ├── index.ts      # 单独导出
│   │   │   └── index.scss    # 独立样式
│   │   └── C_Icon/
│   ├── hooks/                # 组合函数
│   │   └── useImage/
│   ├── plugins/              # 插件（highlight.js）
│   │   └── highlight.ts
│   └── styles/
│       └── global.scss       # 自动聚合所有组件 SCSS
├── types/                    # 全局类型声明
├── dev/                      # 开发调试 playground
├── scripts/
│   ├── gen-global-scss.js    # 自动生成 global.scss
│   └── watch-global-scss.js  # 开发模式监听
├── tsdown.config.ts          # 构建配置（ESM + CJS + DTS）
└── package.json              # peerDeps: vue + naive-ui
```

### 1.2 架构优势

| 方面       | 现状                                    | 评价                         |
| ---------- | --------------------------------------- | ---------------------------- |
| 构建工具   | tsdown（Rolldown 内核）                 | ✅ 极快，支持 Vue SFC + SCSS |
| 输出格式   | ESM + CJS + .d.ts                       | ✅ 标准                      |
| 样式方案   | 组件SCSS → global.scss → dist/style.css | ✅ 统一打包                  |
| peerDeps   | vue ^3.3 + naive-ui ^2.35               | ✅ 正确                      |
| 类型导出   | `dts: { vue: true }`                    | ✅ 自动生成                  |
| Playground | dev/ 独立 vite 项目                     | ✅ 方便调试                  |
| 发布流程   | `release:patch/minor/major`             | ✅ 一键发布                  |

### 1.3 需要扩展的部分

现有架构**基本满足**迁移需求，但需要以下扩展：

1. **composables 目录** — 当前只有 `hooks/useImage`，需扩展为 `composables/` 来承载组件配套的组合函数
2. **utils 目录** — 需新增，承载通用工具函数（localStorage 封装等）
3. **styles/variables.scss** — 需新增 CSS 变量默认值体系
4. **types/ 目录扩展** — 需承载组件类型定义（当前主项目的 `types/modules/*.d.ts`）

---

## 二、核心问题决策

### 2.1 UnoCSS 图标：peerDependency 还是替换？

**现状**：16 个组件使用了约 125 处 `i-mdi:xxx` UnoCSS 图标类

**推荐方案：组件库内部统一使用 C_Icon 组件，不依赖 UnoCSS**

```
❌ 不推荐：peerDependency UnoCSS
   - UnoCSS 是构建工具层面的依赖，不是运行时库
   - 消费者被迫配置 UnoCSS + 对应 preset
   - 增加接入成本，违背"开箱即用"原则

✅ 推荐：用 C_Icon（Iconify）替代所有 UnoCSS 图标类
   - C_Icon 已在组件库中，支持 Iconify 运行时加载
   - 迁移成本：将模板中 <div class="i-mdi:xxx" /> 改为 <C_Icon name="mdi:xxx" />
   - 零配置，消费者无需安装 UnoCSS
```

**迁移对照表**：

```vue
<!-- 迁移前（UnoCSS） -->
<div class="i-mdi:close" />
<span :class="isOpen ? 'i-mdi:chevron-up' : 'i-mdi:chevron-down'" />

<!-- 迁移后（C_Icon） -->
<C_Icon name="mdi:close" :size="16" />
<C_Icon :name="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" :size="16" />
```

> **对于 UnoCSS 工具类**（flex、p-4、gap-2 等）：改为原生 CSS / SCSS，组件库不应依赖原子化 CSS 框架。

### 2.2 Auto-import：组件库必须显式导入

**现状**：主项目通过 `unplugin-auto-import` 自动导入了 `ref`、`computed`、`watch`、`onMounted` 等 52+ 处 Vue API

**方案：迁移时所有 Vue API 必须显式 import**

```typescript
// ❌ 主项目当前写法（auto-import）
const count = ref(0)
const double = computed(() => count.value * 2)

// ✅ 组件库正确写法
import { ref, computed } from 'vue'
const count = ref(0)
const double = computed(() => count.value * 2)
```

**处理策略**：

1. 在组件库的 `tsconfig.json` 中 **不配置** auto-import 相关类型
2. ESLint 规则强制 `no-undef`，确保编译期报错
3. 编写迁移脚本（见第六节）自动注入缺失的 import 语句

### 2.3 CSS 变量体系迁移（最佳方案）

**现状分析**：

组件中使用了三类 CSS 变量：
| 类型 | 变量前缀 | 来源 | 使用次数 |
|------|----------|------|----------|
| Naive UI 主题变量 | `--n-*` | Naive UI 自动注入 | ~42 种，最多 |
| 应用自定义变量 | `--app-*` | `theme-variables.scss` | ~21 种 |
| 无前缀变量 | `--primary-color` 等 | Naive UI `cssVars` 注入 | ~16 个组件 |

**推荐三层变量体系**：

```
┌─────────────────────────────────────────────────┐
│ 第一层：Naive UI 原生变量（零成本，自动生效）          │
│ --n-border-color, --n-primary-color, etc.        │
│ → 只要消费者安装了 naive-ui，这些变量自动可用          │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ 第二层：组件库变量（需组件库提供默认值 + 消费者可覆盖）    │
│ --c-primary, --c-bg-surface, --c-text-primary     │
│ --c-border-default, --c-shadow-sm, etc.           │
│ → 组件库 style.css 中内置默认值                      │
│ → 消费者可通过 :root 覆盖                            │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ 第三层：消费者自定义变量（完全由宿主控制）               │
│ --app-* 变量映射到 --c-* 变量                        │
│ → 消费者在主题配置中做映射                              │
└─────────────────────────────────────────────────┘
```

**具体实现**：

组件库新增 `src/styles/variables.scss`：

```scss
/* @agile-team/naive-ui-components 默认 CSS 变量 */
/* 消费者可通过 :root { --c-primary: #xxx } 覆盖 */

:root {
  /* 主色系 —— 默认跟随 Naive UI primary */
  --c-primary: var(--n-primary-color, #2080f0);
  --c-primary-hover: var(--n-primary-color-hover, #4098fc);

  /* 背景色系 */
  --c-bg-surface: var(--n-color, #ffffff);
  --c-bg-body: var(--n-body-color, #ffffff);
  --c-bg-content: var(--n-card-color, #ffffff);

  /* 文本色系 */
  --c-text-primary: var(--n-text-color, #333639);
  --c-text-secondary: var(--n-text-color-3, #999);
  --c-text-disabled: var(--n-text-color-disabled, #c0c0c0);

  /* 边框色系 */
  --c-border-default: var(--n-border-color, #e0e0e6);
  --c-border-light: var(--n-divider-color, #efeff5);

  /* 阴影 */
  --c-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --c-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 过渡 */
  --c-transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --c-transition-base: 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}
```

**组件内使用**（统一规范）：

```scss
// 组件库组件中：只用 --c-* 或 --n-* 变量
.c-notification-card {
  background: var(--c-bg-content);
  border: 1px solid var(--c-border-default);
  color: var(--c-text-primary);
}
```

**消费者（Robot_Admin）适配**：

```scss
/* 在主项目中，将 --app-* 映射到 --c-* */
:root,
[data-theme='light'] {
  --c-primary: var(--app-primary);
  --c-bg-surface: var(--app-bg-surface);
  --c-text-primary: var(--app-text-primary);
  --c-border-default: var(--app-border-default);
  /* ... */
}
```

> 这样组件库**开箱即用**（默认值从 Naive UI 变量回退），同时消费者**可完全定制**。

### 2.4 Composables（组合函数）管理策略

**推荐方案：组件 + 配套 composables 打包在一起，统一从组件库导出**

```
理由：
1. composables 是组件的内部实现细节，与组件 1:1 绑定
2. 分开管理会导致版本同步噩梦（组件升级但 composable 没跟上）
3. 消费者只需 import 一个包

例外：通用 utils（localStorage、格式化）单独放 utils/ 目录
```

**组件库目录规范**：

```
src/
├── components/
│   ├── C_Upload/
│   │   ├── index.vue          # 组件主体
│   │   ├── index.ts           # 导出
│   │   ├── index.scss         # 样式
│   │   ├── composables/       # ✅ composables 放在组件目录内
│   │   │   ├── useUploadCore.ts
│   │   │   ├── useFileHash.ts
│   │   │   ├── useChunkUpload.ts
│   │   │   ├── useDragDrop.ts
│   │   │   └── useUploadQueue.ts
│   │   ├── constants.ts       # 常量
│   │   └── types.ts           # 组件专属类型（或从顶层 types/ 引用）
│   ├── C_NotificationCenter/
│   │   ├── index.vue
│   │   ├── index.ts
│   │   ├── index.scss
│   │   ├── components/        # 子组件
│   │   │   ├── NotificationBadge.vue
│   │   │   ├── NotificationItem.vue
│   │   │   ├── NotificationList.vue
│   │   │   └── NotificationDetail.vue
│   │   ├── composables/
│   │   │   ├── useNotificationCore.ts
│   │   │   ├── useNotificationWS.ts
│   │   │   └── useNotificationFormat.ts
│   │   └── constants.ts
│   └── ...
├── utils/                     # 通用工具（跨组件复用）
│   ├── storage.ts             # localStorage 封装
│   └── index.ts
├── hooks/                     # 保留给通用 hooks（非组件绑定的）
│   └── useImage/
├── plugins/
├── styles/
│   ├── variables.scss         # CSS 变量默认值
│   └── global.scss            # 自动聚合
└── types/
    └── modules/               # 组件类型定义
```

**关键规则**：

- 组件专属 composables → 放进组件目录的 `composables/` 子目录
- 通用 utils（storage、format）→ 放 `src/utils/`
- 通用 hooks（useImage）→ 放 `src/hooks/`
- 组件专属类型 → 可放组件目录内 `types.ts`，也可放顶层 `types/modules/`

---

## 三、迁移前准备工作

### 3.1 主项目代码整理（在 Robot_Admin 中完成）

#### ① 合并 `hooks/useStorage` 到 `lib/utils.ts` 或独立 `utils/storage.ts`

**原因**：`useStorage` 不是真正的 Vue composable（不使用响应式 API），它就是纯函数工具，叫 `hooks` 不准确。

**当前**：

```
src/hooks/useStorage/index.ts  →  setItem, getItem, removeItem, removeAllItem
```

**建议**：在主项目中新建 `src/utils/storage.ts`，内容与 `useStorage` 相同。然后全局搜索替换引用路径。组件库迁移时直接拷贝到 `src/utils/storage.ts`。

**受影响组件**：C_NotificationCenter、C_FormSearch

#### ② 统一 CSS 变量命名

**当前问题**：部分组件使用了不规范的无前缀变量：

```scss
/* 不规范 */
color: var(--primary-color);
border: 1px solid var(--border-color);

/* 应改为 */
color: var(--n-primary-color); /* Naive UI 变量 */
border: 1px solid var(--n-border-color); /* 或 --app-border-default */
```

**受影响组件**：C_Cron、C_FormulaEditor、C_Upload 等约 16 个

#### ③ 消除 UnoCSS 图标依赖（逐步替换）

在迁移前或迁移过程中，将组件中的 UnoCSS 图标类替换为 `<C_Icon>` 组件调用。

**高度依赖 UnoCSS 图标的组件**（优先处理）：
| 组件 | 图标使用量 | 迁移难度 |
|------|-----------|---------|
| C_WorkFlow | ~20 处 | 中 |
| C_Form | ~19 处 | 中 |
| C_AntV | ~13 处 | 中 |
| C_Table | ~10 处 | 低 |
| C_NotificationCenter | ~8 处 | 低 |
| C_Upload | ~6 处 | 低 |

#### ④ 补齐显式 import

为即将迁移的组件补齐所有 Vue API 的显式 import。可使用以下命令批量检查：

```bash
# 查找使用了 ref 但未显式 import 的文件
grep -rn "ref(" src/components/global/C_Upload/ | grep -v "import.*ref"
```

#### ⑤ 消除 Store 依赖（针对可迁移组件）

以下组件已完成 store 解耦：

| 组件                 | 原 Store/Router 依赖       | 改造方案                                                  | 状态          |
| -------------------- | -------------------------- | --------------------------------------------------------- | ------------- |
| C_AntV               | `useThemeStore`            | `theme` prop（'light' \| 'dark'）                         | ✅ 已完成     |
| C_Editor             | `useThemeStore`            | `theme` prop                                              | ✅ 已完成     |
| C_VtableGantt        | `useThemeStore`            | `theme` prop                                              | ✅ 已完成     |
| C_Theme              | `useThemeStore`            | `v-model`（ThemeMode）；调用方（C_NavbarRight）绑定 store | ✅ 已完成     |
| C_NotificationCenter | `useRouter`（Detail 内部） | emit `navigate`，C_NavbarRight 接收后 `router.push`       | ✅ 已完成     |
| C_FormSearch         | `useStorage`（非 store）   | 迁移 storage util 即可                                    | ⬜ 迁移时处理 |

### 3.2 组件库基础设施扩展（在 naive-ui-components 中完成）

#### ① 创建 utils 目录

```bash
mkdir -p src/utils
```

新建 `src/utils/storage.ts`（从主项目拷贝 useStorage）
新建 `src/utils/index.ts`（统一导出）

#### ② 创建 CSS 变量默认值文件

新建 `src/styles/variables.scss`（见 2.3 节方案）

更新 `global.scss` 自动聚合脚本，在头部引入 variables.scss：

```scss
@use './variables.scss';
@forward '../components/C_Code/index.scss';
@forward '../components/C_Icon/index.scss';
// ... 自动生成
```

#### ③ 扩展 types 目录

```bash
mkdir -p types/modules
```

组件类型定义按需从主项目 `src/types/modules/` 拷贝。

#### ④ 更新 tsdown.config.ts

确保新增的 `utils/` 也被打包导出：

```typescript
// tsdown.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  // ... 其余不变
  external: ['vue', 'naive-ui', '@vueuse/core', '@iconify/vue', 'highlight.js'],
})
```

#### ⑤ 更新 package.json dependencies

根据迁移组件需要，逐步添加运行时依赖：

```jsonc
{
  "dependencies": {
    "@iconify/vue": "^5.0.0", // 已有
    "@vueuse/core": "^13.6.0", // 已有
    "highlight.js": "^11.11.1", // 已有
    // 按需添加：
    "spark-md5": "^3.0.2", // C_Upload 文件哈希
    "dayjs": "^1.11.0", // C_Time, C_FullCalendar
    "sortablejs": "^1.15.0", // C_Draggable
    // ... 随迁移进度添加
  },
  "peerDependencies": {
    "vue": "^3.3.0", // 已有
    "naive-ui": "^2.35.0", // 已有
  },
}
```

---

## 四、组件分类与迁移规划

### 4.1 三级分类（基于实际依赖分析）

#### 🟢 A 类：可直接迁移（31 个）

零 store/router 依赖，composables 完全自包含：

| 组件                     | composables | 第三方依赖                 | 备注                           |
| ------------------------ | ----------- | -------------------------- | ------------------------------ |
| **C_Upload**             | 5 个        | spark-md5                  | 🎯 基准组件，已验证            |
| **C_NotificationCenter** | 3 个        | 无                         | 需迁移 storage util            |
| **C_Signature**          | 2 个        | 无                         | 纯 Canvas                      |
| **C_SplitPane**          | 2 个        | 无                         | 纯 CSS+JS                      |
| **C_CollapsePanel**      | 1 个        | 无                         |                                |
| **C_Form**               | 4 个        | @robot-admin/form-validate | 需处理验证库                   |
| **C_FormSearch**         | 1 个        | 无                         | 需迁移 storage util            |
| **C_Table**              | 10 个       | 无                         | 依赖 C_Icon, usePrintWatermark |
| **C_Tree**               | 2 个        | 无                         |                                |
| **C_FilePreview**        | 3 个        | docx-preview等             |                                |
| **C_ImageCropper**       | 2 个        | cropperjs                  |                                |
| **C_QRCode**             | 1 个        | qrcode                     |                                |
| **C_WaterFall**          | 1 个        | 无                         |                                |
| **C_WorkFlow**           | 5+ 个       | @vue-flow/core             | 大型组件                       |
| **C_VideoPlayer**        | 5+ 个       | 无                         | 最自包含                       |
| C_Barcode                | 0           | jsbarcode                  |                                |
| C_Captcha                | 0           | 无                         |                                |
| C_Cascade                | 0           | 无                         |                                |
| C_City                   | 0           | 无                         | 依赖城市数据                   |
| C_Cron                   | 3 个        | 无                         |                                |
| C_Date                   | 0           | dayjs                      |                                |
| C_Draggable              | 2 个        | sortablejs                 |                                |
| C_FormulaEditor          | 3 个        | 无                         |                                |
| C_FullCalendar           | 2 个        | @fullcalendar              |                                |
| C_Guide                  | 0           | driver.js                  |                                |
| C_Map                    | 0           | 高德地图 SDK               |                                |
| C_Markdown               | 0           | v-md-editor                |                                |
| C_Progress               | 0           | 无                         |                                |
| C_Steps                  | 0           | 无                         |                                |
| C_Time                   | 1 个        | 无                         |                                |
| C_ActionBar              | 0           | 无                         |                                |

同时，以下三个组件 theme 依赖已解耦，移入 A 类：

| 组件              | composables | 第三方依赖             | 备注                 |
| ----------------- | ----------- | ---------------------- | -------------------- |
| **C_AntV**        | 无          | @antv/x6               | ✅ theme prop 已解耦 |
| **C_Editor**      | 无          | wangeditor             | ✅ theme prop 已解耦 |
| **C_VtableGantt** | 无          | @visactor/vtable-gantt | ✅ theme prop 已解耦 |

#### 🟡 B 类：需轻度适配（4 个）

| 组件       | 当前依赖                                 | 改造方案                                        |
| ---------- | ---------------------------------------- | ----------------------------------------------- |
| C_Code     | highlight plugin                         | ✅ 已在组件库                                   |
| C_Icon     | useImagePath（含 import.meta.glob）      | 需调整路径策略                                  |
| C_Theme    | useThemeStore（mode + cycleTheme）       | ✅ 已完成：`v-model`，emit 驱动                 |
| C_Language | window.localStorage + window.$changeLang | 改为 `emit('change', lang)`，调用方决定切换行为 |

#### 🔴 C 类：不迁移（11 个）

深度耦合 store/router/api，属于项目专属布局/业务组件：

```
C_Layout, C_Header, C_Footer, C_NavbarRight, C_Breadcrumb,
C_Menu, C_MenuTop, C_TagsView, C_GlobalSearch,
C_Settings, C_ReLoginDialog
```

> 这些是项目的"整合层"，负责将组件库和业务 store/router/api 粘合在一起，应保留在主项目中。

### 4.2 迁移阶段规划

```
阶段 0 ──────────────────────────────────── 基础设施
  ▸ 组件库扩展（utils/, variables.scss, types/）
  ▸ 验证 C_Upload 端到端（构建→发布→主项目安装→使用）
  ▸ 建立迁移规范文档和代码风格指南

阶段 1 ──────────────────────────────────── 核心基础组件
  ▸ C_Upload（🎯 基准，带 5 个 composables）
  ▸ C_NotificationCenter（带 3 个 composables + storage util）
  ▸ C_Signature, C_SplitPane, C_CollapsePanel

阶段 2 ──────────────────────────────────── 表单/表格体系
  ▸ C_Form（带 4 个 composables）
  ▸ C_FormSearch（带 1 个 composable + storage util）
  ▸ C_Table（带 10 个 composables）
  ▸ C_Tree

阶段 3 ──────────────────────────────────── 功能型组件
  ▸ C_FilePreview, C_ImageCropper, C_QRCode
  ▸ C_Draggable, C_WaterFall, C_VideoPlayer
  ▸ C_Barcode, C_Captcha, C_Cascade

阶段 4 ──────────────────────────────────── 复杂业务组件
  ▸ C_WorkFlow（最大最复杂）
  ▸ C_AntV, C_VtableGantt（theme prop 已解耦 ✅）
  ▸ C_FullCalendar, C_FormulaEditor, C_Cron

阶段 5 ──────────────────────────────────── 收尾
  ▸ C_Editor（theme prop 已解耦 ✅），C_Markdown, C_Map
  ▸ C_Date, C_Time, C_City, C_Guide
  ▸ C_Progress, C_Steps, C_ActionBar
  ▸ C_Theme, C_Language（B类，小改造后迁入）
  ▸ 主项目移除已迁移组件源码，全部改为 import 组件库
```

---

## 五、单个组件迁移标准流程

以 **C_Upload** 为例：

### Step 1：创建组件目录结构

```bash
# 在 naive-ui-components/src/components/ 下
mkdir -p C_Upload/composables
```

### Step 2：拷贝源文件

```
从 Robot_Admin 拷贝：
  src/components/global/C_Upload/*.vue      → C_Upload/
  src/composables/Upload/*.ts               → C_Upload/composables/
  src/types/modules/upload.d.ts             → types/modules/ 或 C_Upload/types.ts
```

### Step 3：适配改造

```typescript
// 1. 补齐显式 import
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

// 2. 替换路径别名
// ❌ import { setItem } from '@/hooks/useStorage'
// ✅ import { setItem } from '../../utils/storage'
// 或使用组件库内部的 @/ alias

// 3. 替换 UnoCSS 图标
// ❌ <div class="i-mdi:cloud-upload" />
// ✅ <C_Icon name="mdi:cloud-upload" :size="16" />

// 4. 替换 CSS 变量
// ❌ var(--app-primary)
// ✅ var(--c-primary)

// 5. 消除 Store 依赖（如果有）
// ❌ const themeStore = useThemeStore()
// ✅ const props = defineProps<{ theme?: 'light' | 'dark' }>()
```

### Step 4：创建导出文件

```typescript
// C_Upload/index.ts
import C_Upload from './index.vue'
export default C_Upload
export { C_Upload }
export type { UploadProps, UploadExpose } from './index.vue'
```

### Step 5：注册到主入口

```typescript
// src/index.ts
import C_Upload from './components/C_Upload/index.vue'
export { C_Upload }

const components: Component[] = [C_Code, C_Icon, C_Upload]
```

### Step 6：创建 SCSS

```scss
// C_Upload/index.scss
.c-upload {
  /* ... */
}
```

`gen-global-scss.js` 会自动收集。

### Step 7：Playground 验证

在 `dev/` 中引入并测试。

### Step 8：构建验证

```bash
bun run build
# 确认 dist/ 输出正确
# 确认 dist/index.d.ts 包含类型
```

### Step 9：发布

```bash
bun run release:patch  # 0.1.5
```

### Step 10：主项目切换

```typescript
// Robot_Admin/main.ts 或对应页面
// ❌ 原来的全局注册（通过 import.meta.glob 自动扫描）
// ✅ 从组件库导入
import { C_Upload } from '@agile-team/naive-ui-components'
```

---

## 六、迁移工具与脚本

### 6.1 Auto-import 补齐脚本

```bash
# scripts/fix-auto-imports.sh
# 扫描 .vue/.ts 文件，检测未 import 的 Vue API 并自动补齐

VUE_APIS="ref|computed|watch|watchEffect|onMounted|onBeforeUnmount|onUnmounted|nextTick|provide|inject|reactive|toRef|toRefs|shallowRef|triggerRef|defineProps|defineEmits|defineExpose|withDefaults|useSlots|useAttrs"

find src/components -name "*.vue" -o -name "*.ts" | while read file; do
  for api in ref computed watch watchEffect onMounted onBeforeUnmount onUnmounted nextTick provide inject reactive toRef toRefs shallowRef triggerRef; do
    if grep -q "\b${api}\b" "$file" && ! grep -q "import.*${api}.*from 'vue'" "$file"; then
      echo "⚠️  $file uses '$api' without explicit import"
    fi
  done
done
```

### 6.2 UnoCSS 图标替换脚本

```bash
# scripts/replace-unocss-icons.sh
# 将 class="i-mdi:xxx" 替换为 <C_Icon name="mdi:xxx" />

# 这需要更精细的 AST 解析，建议手动逐组件处理
# 以下仅用于快速检查哪些文件需要处理

grep -rn 'class="i-' src/components/ --include="*.vue" | \
  sed 's/.*class="\(i-[^"]*\)".*/\1/' | sort -u
```

### 6.3 CSS 变量替换映射

```bash
# scripts/replace-css-vars.sh
# 将 --app-* 替换为 --c-*

declare -A VAR_MAP=(
  ["--app-primary"]="--c-primary"
  ["--app-primary-hover"]="--c-primary-hover"
  ["--app-bg-body"]="--c-bg-body"
  ["--app-bg-surface"]="--c-bg-surface"
  ["--app-bg-content"]="--c-bg-content"
  ["--app-text-primary"]="--c-text-primary"
  ["--app-text-secondary"]="--c-text-secondary"
  ["--app-text-disabled"]="--c-text-disabled"
  ["--app-border-default"]="--c-border-default"
  ["--app-border-light"]="--c-border-light"
  ["--app-border-deep"]="--c-border-deep"
  ["--app-shadow-sm"]="--c-shadow-sm"
  ["--app-shadow-md"]="--c-shadow-md"
  ["--app-shadow-lg"]="--c-shadow-lg"
  ["--app-transition-fast"]="--c-transition-fast"
  ["--app-transition-base"]="--c-transition-base"
)

for old_var in "${!VAR_MAP[@]}"; do
  new_var="${VAR_MAP[$old_var]}"
  find src/components -name "*.vue" -o -name "*.scss" | \
    xargs sed -i "s/${old_var}/${new_var}/g"
done
```

---

## 七、组件库导出设计

### 7.1 主入口 `src/index.ts`（最终形态示例）

```typescript
import type { App, Component } from 'vue'

// ====== 组件导入 ======
import C_Code from './components/C_Code/index.vue'
import C_Icon from './components/C_Icon/index.vue'
import C_Upload from './components/C_Upload/index.vue'
import C_NotificationCenter from './components/C_NotificationCenter/index.vue'
import C_Signature from './components/C_Signature/index.vue'
import C_SplitPane from './components/C_SplitPane/index.vue'
import C_CollapsePanel from './components/C_CollapsePanel/index.vue'
import C_Form from './components/C_Form/index.vue'
import C_Table from './components/C_Table/index.vue'
// ... 更多组件

// ====== 导出组件 ======
export {
  C_Code,
  C_Icon,
  C_Upload,
  C_NotificationCenter,
  C_Signature,
  C_SplitPane,
  C_CollapsePanel,
  C_Form,
  C_Table,
  // ...
}

// ====== 导出 Composables（供高级用户直接使用） ======
export { useUploadCore } from './components/C_Upload/composables/useUploadCore'
export { useNotificationCore } from './components/C_NotificationCenter/composables/useNotificationCore'
// ...

// ====== 导出 Utils ======
export { setItem, getItem, removeItem } from './utils/storage'

// ====== 导出 Plugins ======
export { setupHighlight, useHighlight } from './plugins/highlight'

// ====== 导出 Types ======
export type { UploadProps } from './components/C_Upload/index.vue'
export type { NotificationMessage } from './types/modules/notification'
// ...

// ====== 全量安装 ======
export interface ComponentLibOptions {
  highlight?: HighlightPluginOptions
}

const components: Component[] = [
  C_Code,
  C_Icon,
  C_Upload,
  C_NotificationCenter,
  C_Signature,
  C_SplitPane,
  C_CollapsePanel,
  C_Form,
  C_Table,
]

const install = (app: App, options: ComponentLibOptions = {}) => {
  components.forEach(component => {
    const name =
      (component as any).__name || (component as any).name || 'Unknown'
    app.component(name, component)
  })

  if (options.highlight !== undefined) {
    setupHighlight(app, options.highlight)
  }
}

export default { install, version: '0.2.0' }
```

### 7.2 package.json exports（支持 Tree-shaking）

```jsonc
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
    },
    "./style": {
      "import": "./dist/style.css",
      "require": "./dist/style.css",
    },
    // 按需导入子路径（可选，未来扩展）
    "./C_Upload": {
      "types": "./dist/components/C_Upload/index.d.ts",
      "import": "./dist/components/C_Upload/index.js",
    },
  },
  "sideEffects": ["dist/style.css", "**/*.scss"],
}
```

---

## 八、主项目适配方案

### 8.1 安装组件库

```bash
bun add @agile-team/naive-ui-components
```

### 8.2 全局注册

```typescript
// main.ts
import NaiveUIComponents from '@agile-team/naive-ui-components'
import '@agile-team/naive-ui-components/style'

app.use(NaiveUIComponents, {
  highlight: { autoDetect: true },
})
```

### 8.3 CSS 变量映射

```scss
// src/styles/component-lib-bridge.scss
// 将主项目主题变量映射到组件库变量

:root,
[data-theme='light'] {
  --c-primary: var(--app-primary);
  --c-primary-hover: var(--app-primary-hover);
  --c-bg-surface: var(--app-bg-surface);
  --c-bg-body: var(--app-bg-body);
  --c-bg-content: var(--app-bg-content);
  --c-text-primary: var(--app-text-primary);
  --c-text-secondary: var(--app-text-secondary);
  --c-text-disabled: var(--app-text-disabled);
  --c-border-default: var(--app-border-default);
  --c-border-light: var(--app-border-light);
  --c-border-deep: var(--app-border-deep);
  --c-shadow-sm: var(--app-shadow-sm);
  --c-shadow-md: var(--app-shadow-md);
  --c-shadow-lg: var(--app-shadow-lg);
  --c-transition-fast: var(--app-transition-fast);
  --c-transition-base: var(--app-transition-base);
}
```

### 8.4 移除已迁移组件

当组件稳定运行后，从主项目中移除源码：

```bash
# 移除迁移完毕的组件
rm -rf src/components/global/C_Upload
rm -rf src/composables/Upload
rm -rf src/types/modules/upload.d.ts

# 更新 DynamicComponent 排除列表（如果使用 import.meta.glob 自动注册）
# 已迁移的组件通过组件库全局注册，不再需要本地注册
```

### 8.5 DynamicComponent 兼容

主项目使用 `import.meta.glob` 自动注册全局组件。迁移后需注意：

- 通过组件库 `app.use(NaiveUIComponents)` 注册的组件，不会再被 glob 扫描到（因为源码已删除）
- 这是正确行为——组件库注册优先级等同于全局注册
- 如果有组件名冲突，组件库注册的会覆盖本地的

---

## 九、其他准备建议

### 9.1 `hooks/useStorage` → `utils/storage` 重构

**在主项目中（迁移前执行）**：

```bash
# 1. 创建 utils/storage.ts（纯拷贝）
cp src/hooks/useStorage/index.ts src/utils/plugins/storage.ts

# 2. 全局搜索替换引用
# 将 @/hooks/useStorage → @/utils/plugins/storage
# 或放到 @/lib/storage.ts

# 受影响文件：
# - src/composables/NotificationCenter/useNotificationCore.ts
# - src/composables/FormSearch/useFormSearch.ts（如果有的话）
```

### 9.2 `usePrintWatermark` hook 处理

C_Table 依赖 `@/hooks/usePrintWatermark`。迁移时：

- 如果只有 C_Table 用 → 移入 C_Table/composables/
- 如果多组件共用 → 移入组件库 `hooks/usePrintWatermark/`

### 9.3 `@robot-admin/form-validate` 处理

C_Form 依赖这个私有包。迁移时：

- 如果是 npm 包 → 组件库 `dependencies` 中添加
- 如果是 workspace 包 → 考虑也发布到 npm，或合并到组件库

### 9.4 C_Icon 的 `useImagePath` 处理

当前 C_Icon 使用 `import.meta.glob` 动态加载宿主项目的图片资源，这在组件库中无法工作。

**方案**：

- `type="image"` 模式改为接收完整 URL 或 import 后的模块
- 不再支持自动路径探测（这是宿主项目的行为）
- 组件库中的 C_Icon 已经这样处理了（直接接收 `src` prop）

### 9.5 组件内部 C_Icon 引用方式

在组件库内部，组件之间的引用应使用**显式 import**而非全局注册：

```typescript
// ✅ 组件库内部引用
import C_Icon from '../C_Icon/index.vue'

// ❌ 不要依赖全局注册
// <C_Icon> 直接在模板中使用（依赖消费者全局注册了组件库）
```

这样即使消费者按需导入单个组件，内部引用也不会断裂。

### 9.6 资产数据文件处理

部分组件依赖静态数据文件（如 C_City 的城市数据、C_FormulaEditor 的 formula.json）：

- 将这些数据文件打包在组件目录内
- 使用 `import` 导入 JSON（tsdown 默认支持）

---

## 十、风险清单与应对

| 风险                      | 影响         | 应对                                    |
| ------------------------- | ------------ | --------------------------------------- |
| 组件库构建后 CSS 变量丢失 | 样式异常     | 确保 SCSS → CSS 编译保留 `var()` 引用   |
| 按需导入时样式未加载      | 组件无样式   | `sideEffects` 声明 + 文档提示导入 style |
| TypeScript 类型导出不完整 | 消费者无提示 | `dts: { vue: true }` + 手动补充         |
| Naive UI 版本不兼容       | 运行时报错   | peerDeps 宽松范围 `^2.35.0`             |
| 第三方包体积过大          | 打包膨胀     | external 声明 + 文档说明需自行安装      |
| UnoCSS 工具类残留         | 样式失效     | CI 检查脚本，禁止 `i-` 类名             |
| Auto-import 残留          | 编译报错     | ESLint no-undef + CI 检查               |
| @vueuse/core 版本冲突     | 运行异常     | 考虑纳入 peerDeps 或固定兼容范围        |

---

## 十一、检查清单（每个组件迁移完成后）

- [ ] 所有 Vue API 显式 import
- [ ] 无 `@/stores/` 引用
- [ ] 无 `@/router` 引用
- [ ] 无 `@/hooks/` 引用（已内化到组件或 utils/）
- [ ] 无 `@/api/` 引用
- [ ] 无 `i-` UnoCSS 图标类名
- [ ] 无 `--app-*` CSS 变量（已替换为 `--c-*`）
- [ ] CSS 变量在未定义时有 fallback 值
- [ ] 内部组件引用为显式 import
- [ ] index.ts 导出组件 + 类型
- [ ] index.scss 样式文件存在
- [ ] Playground 手动测试通过
- [ ] `bun run build` 构建成功
- [ ] dist/ 中类型文件完整

---

## 十二、总结

| 维度           | 结论                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 现有组件库架构 | ✅ 基本满足，需扩展 utils/、variables.scss、types/                                                       |
| Naive UI       | ✅ 继续作为 peerDependency                                                                               |
| UnoCSS         | ❌ 不做 peerDep，用 C_Icon 替代图标，样式改原生 SCSS                                                     |
| Auto-import    | ❌ 组件库不可使用，迁移时补显式 import                                                                   |
| CSS 变量       | ✅ 三层方案：`--n-*`（Naive UI）→ `--c-*`（组件库默认）→ 消费者覆盖                                      |
| Composables    | ✅ 与组件打包在一起，放进组件目录的 composables/ 子目录                                                  |
| 通用 Utils     | ✅ 单独放 src/utils/（storage、format 等）                                                               |
| 基准组件       | C_Upload → 阶段 0 验证全流程                                                                             |
| 总迁移组件     | A 类 34 + B 类 4 = **38 个**，C 类 11 个不迁移                                                           |
| 预计阶段       | 5 个阶段，建议从阶段 0 + 1 开始（约 6 个组件）                                                           |
| 已完成解耦     | C_AntV、C_Editor、C_VtableGantt、C_Theme、C_NotificationCenter store/router 依赖已全部解除（2026-02-27） |
