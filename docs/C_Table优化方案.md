# C_Table 组件优化方案

> 📅 创建时间：2026-02-15
> 📋 目标：高内聚 · 精简API · 可维护 · 可扩展

---

## 一、现状全景分析

### 1.1 当前文件结构与代码量

```
C_Table/                        # 组件目录
├── index.vue                   # 619 行 — 组件主体（模板+逻辑严重耦合）
├── data.ts                     # 531 行 — 混合了类型/配置/渲染/工具函数
├── index.scss                  # 482 行 — 样式（大量 !important）
└── components/                 # 子组件目录
    ├── TableEditModal.vue      # 165 行 — 编辑弹窗
    ├── TableViewModal.vue      # 105 行 — 详情弹窗
    └── TableSettings/          # 设置面板
        ├── index.vue           #  68 行 — 设置入口
        ├── index.scss          # 336 行 — 设置样式
        └── ColumnManagement.vue # 531 行 — 列管理

composables/Table/              # Hook 目录
├── useTableManager.ts          # 667 行 — 统一管理器（嵌套过深）
├── useTableActions.ts          # 280 行 — 操作按钮
├── useTableExpand.ts           # 651 行 — 展开/选择/父子联动
├── usePagination.ts            # 200 行 — 分页逻辑
├── useRowEdit.ts               # 226 行 — 行编辑
├── useCellEdit.ts              # 173 行 — 单元格编辑
├── useModalEdit.ts             # 165 行 — 弹窗编辑
└── useDynamicRow.ts            # 780 行 — 动态行（最大文件！）

types/modules/table.d.ts        # 513 行 — 类型定义
```

**总计：约 5,500+ 行代码**

### 1.2 核心问题诊断

| #   | 问题                         | 严重性 | 说明                                                                 |
| --- | ---------------------------- | ------ | -------------------------------------------------------------------- |
| 1   | **index.vue 职责过重**       | 🔴 高  | 619 行包含：渲染函数、列映射、配置合并、事件处理、状态管理全混在一起 |
| 2   | **data.ts 是个"杂物间"**     | 🔴 高  | 531 行混合了 4 种职责：类型定义、配置构建、渲染函数、工具函数        |
| 3   | **Props 膨胀**               | 🔴 高  | EnhancedTableProps 有 30+ 个 props，使用侧冗长                       |
| 4   | **useTableManager 嵌套过深** | 🟡 中  | `tableManager.editStates.modalEdit.isModalVisible.value` 访问链太长  |
| 5   | **useDynamicRow 太大**       | 🟡 中  | 780 行，渲染函数（工具栏/确认框）应属于 UI 层                        |
| 6   | **components/ 子目录散落**   | 🟡 中  | 违背"C_Table只要3个文件"的管理原则                                   |
| 7   | **console.log 泛滥**         | 🟡 中  | useModalEdit 6处、index.vue 3处调试日志                              |
| 8   | **SCSS !important 过多**     | 🟠 低  | 482 行中约 50+ 处 `!important`，维护困难                             |
| 9   | **客户端/服务端分页混淆**    | 🟠 低  | usePagination 仅做 slice，但实际有 remote 模式                       |
| 10  | **操作列硬编码**             | 🟠 低  | `_actions` 列强制添加、:last-child 样式误伤                          |

---

## 二、目标架构设计

### 2.1 设计原则

你提到的核心诉求：

> **"C_Table 里面就 index.scss、data.ts、index.vue 就行了，composables/Table 里面可以扩展"**

这个思路非常好。结合 VBen Admin、ProComponents、TanStack Table 的最佳实践，我建议一个 **"薄 UI 壳 + 厚 Composable 引擎"** 的架构：

```
核心理念：组件是视图层薄壳，composable 是逻辑引擎
```

- **index.vue（薄壳）**：只做声明式模板渲染，所有逻辑通过 `useTable()` 一个 hook 注入
- **data.ts（配置中心）**：类型、默认值、列处理、编辑组件映射
- **index.scss（样式）**：所有表格相关样式收拢
- **composables/Table/（逻辑引擎）**：分层清晰的 hooks

### 2.2 目标文件结构

```
C_Table/
├── index.vue           # ≤200 行 — 纯模板薄壳
├── data.ts             # ≤300 行 — 配置 + 类型 + 列处理
└── index.scss          # ≤350 行 — 所有样式（含子组件）

composables/Table/
├── useTable.ts         # 🆕 对外唯一入口 — 聚合所有功能，返回扁平API
├── useTableConfig.ts   # 🆕 配置合并 — 从 data.ts 迁出 createUnifiedConfig
├── useTableColumns.ts  # 🆕 列处理引擎 — 列映射/渲染/设置/index序号
├── useTableEdit.ts     # 合并 useRowEdit + useCellEdit + useModalEdit
├── useTableExpand.ts   # 保持 — 展开/选择/父子联动
├── useTableActions.ts  # 保持 — 操作按钮渲染
├── usePagination.ts    # 保持 — 增加 mode: 'client' | 'server'
└── useDynamicRow.ts    # 精简 — UI渲染部分移至 index.vue 的 slot/template
```

### 2.3 关键变更对比

| 变更点       | 当前                                    | 目标                         | 收益              |
| ------------ | --------------------------------------- | ---------------------------- | ----------------- |
| 组件入口     | 30+ props 散开传                        | `config` 对象 + 3个核心 prop | 使用侧减 60% 代码 |
| data.ts      | 531行杂混                               | 300行纯配置                  | 职责单一          |
| index.vue    | 619行 逻辑+模板                         | ≤200行 纯模板                | 可读性飞升        |
| 编辑状态     | 3个独立hook + manager嵌套               | useTableEdit 统一            | 访问扁平化        |
| 列处理       | 分散在 index.vue 内                     | useTableColumns 集中         | 可测试/可复用     |
| 对外API      | `tableManager.editStates.modalEdit.xxx` | `table.startEdit(key)`       | DX 提升           |
| 子组件       | components/ 目录4个文件                 | 合并到 index.vue 的模板中    | 文件归一          |
| 动态行工具栏 | h() 渲染函数 780 行                     | template + slot              | 可读性飞升        |

---

## 三、详细设计

### 3.1 使用侧目标 API（最终效果）

```vue
<!-- ✅ 优化后：极简用法 -->
<template>
  <C_Table
    :columns="columns"
    :data="data"
    :loading="loading"
    :config="tableConfig"
  />
</template>

<script setup lang="ts">
  const columns: TableColumn[] = [
    { key: 'name', title: '姓名', editType: 'input' },
    { key: 'age', title: '年龄', editType: 'number' },
    { key: 'status', title: '状态', editType: 'select', editProps: { options: [...] } },
  ]

  const tableConfig: TableConfig = {
    // 编辑模式
    edit: {
      mode: 'modal',           // 'row' | 'cell' | 'modal' | 'both' | 'none'
      modalTitle: '编辑员工',
      modalWidth: 700,
    },
    // 操作按钮
    actions: {
      edit: (row) => api.update(row),
      delete: (row) => api.delete(row.id),
      detail: (row) => api.getDetail(row.id),
      custom: [
        { key: 'export', label: '导出', icon: 'mdi:download', onClick: handleExport },
      ],
    },
    // 分页
    pagination: {
      mode: 'client',          // 'client' | 'server'
      pageSize: 20,
    },
    // 工具栏
    toolbar: {
      settings: true,          // 列设置 drawer
    },
  }
</script>
```

**对比当前用法：**

```vue
<!-- ❌ 当前：冗长、props 泛滥 -->
<C_Table
  ref="tableRef"
  v-model:data="data"
  :columns="columns"
  :loading="loading"
  :edit-mode="editMode"
  :editable="true"
  :show-row-actions="true"
  :modal-title="'编辑员工'"
  :modal-width="700"
  :actions="actions"
  :pagination="pagination"
  :expandable="false"
  :enable-selection="false"
  :enable-child-selection="false"
  :enable-parent-child-link="false"
  :parent-child-link-mode="'loose'"
  :show-toolbar="true"
  :enable-column-settings="true"
  @save="handleSave"
  @cancel="handleCancel"
  @pagination-change="handlePageChange"
  @row-delete="handleRowDelete"
  @view-detail="handleDetail"
/>
```

### 3.2 `useTable` — 对外唯一入口

```typescript
// composables/Table/useTable.ts
// 这是所有表格功能的唯一聚合点

export function useTable(options: UseTableOptions) {
  const config = useTableConfig(options)
  const columns = useTableColumns(config)
  const edit = useTableEdit(config)
  const pagination = usePagination(config)
  const expand = useTableExpand(config)   // 仅按需初始化
  const actions = useTableActions(config)
  const dynamicRows = useDynamicRow(config) // 仅按需初始化

  // ✅ 返回扁平化 API，不暴露内部层级
  return {
    // 传给 C_Table 的 props 包
    tableProps: computed(() => ({ ... })),

    // 编辑 API
    startEdit: edit.start,
    cancelEdit: edit.cancel,
    saveEdit: edit.save,
    isEditing: edit.isEditing,

    // 分页 API
    currentPage: pagination.currentPage,
    pageSize: pagination.currentPageSize,
    resetPage: pagination.resetToFirstPage,

    // 选择 API
    selectedRows: expand.getSelectedRows,
    clearSelection: expand.clearSelection,

    // 展开 API
    expandAll: expand.expandAll,
    collapseAll: expand.collapseAll,
  }
}
```

### 3.3 `data.ts` — 只保留配置职责

```typescript
// C_Table/data.ts — 精简后 ≤300 行

// ========================= 类型 =========================
export interface TableConfig {
  edit?: EditConfig
  actions?: ActionsConfig
  pagination?: PaginationConfig
  toolbar?: ToolbarConfig
  expand?: ExpandConfig
  selection?: SelectionConfig
  dynamicRows?: DynamicRowsConfig
}

// ========================= 默认值 =========================
export const DEFAULT_TABLE_CONFIG: Required<TableConfig> = { ... }

// ========================= 编辑组件映射 =========================
export const EDIT_COMPONENTS: Record<EditType, Component> = { ... }

// ========================= 列处理工具 =========================
export function processColumns(columns: TableColumn[]): TableColumn[] { ... }
export function generateFormOptions(columns: TableColumn[]): FormOption[] { ... }
export function getDisplayValue(column: TableColumn, data: DataRecord): string { ... }
```

**移出去的内容：**

| 移出内容                   | 移动到                     | 原因                       |
| -------------------------- | -------------------------- | -------------------------- |
| `createUnifiedConfig()`    | `useTableConfig.ts`        | 运行时配置合并，属于逻辑层 |
| `renderEditComponent()` 等 | `useTableColumns.ts`       | 列渲染逻辑，属于逻辑层     |
| `createEditModeChecker()`  | `useTableEdit.ts`          | 编辑模式判断，属于编辑逻辑 |
| `buildSettingsConfig()`    | `useTableColumns.ts`       | 列设置相关                 |
| `TablePresetConfig` 等类型 | `types/modules/table.d.ts` | 类型应统一管理             |

### 3.4 `index.vue` — 纯模板薄壳

```vue
<!-- C_Table/index.vue — 目标 ≤200 行 -->
<template>
  <div class="c-table-wrapper">
    <!-- 动态行工具栏 — 用 slot 替代 h() -->
    <slot
      name="toolbar-dynamic"
      v-bind="dynamicRows"
    />

    <!-- 表格工具栏 -->
    <div
      v-if="showToolbar"
      class="table-toolbar"
    >
      <div class="toolbar-left"><slot name="toolbar-left" /></div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
        <SettingsButton
          v-if="enableSettings"
          @click="showSettings = true"
        />
      </div>
    </div>

    <!-- 表格主体 -->
    <NDataTable v-bind="tableBindings" />

    <!-- 分页 -->
    <NPagination
      v-if="paginationConfig"
      v-bind="paginationConfig"
      class="pagination-wrapper"
    />

    <!-- 编辑弹窗 — 直接内联，不用子组件文件 -->
    <NModal
      v-if="edit.mode === 'modal'"
      v-model:show="edit.modalVisible"
      ...
    >
      <C_Form ... />
    </NModal>

    <!-- 列设置 Drawer — 直接内联 -->
    <NDrawer
      v-model:show="showSettings"
      :width="420"
      placement="right"
    >
      <NDrawerContent
        title="列设置"
        closable
      >
        <!-- 列管理 UI 直接写在这里 -->
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  // 只需导入一个 hook
  import { useTableCore } from '@/composables/Table/useTableCore'

  const props = defineProps<{
    columns: TableColumn[]
    data: DataRecord[]
    loading?: boolean
    config?: TableConfig
  }>()

  const emit = defineEmits<TableEmits>()

  // 一行搞定所有逻辑
  const {
    tableBindings, // 传给 NDataTable 的所有 props
    paginationConfig, // 传给 NPagination 的 props
    edit, // 编辑相关状态
    dynamicRows, // 动态行相关
    showToolbar, // 是否显示工具栏
    enableSettings, // 是否启用设置
  } = useTableCore(props, emit)
</script>
```

### 3.5 `useTableColumns.ts` — 列处理引擎（从index.vue抽出）

当前 index.vue 中 **280+ 行** 的列处理逻辑（`renderCell`、`renderCellEdit`、`mapRegularColumn`、`mapIndexColumn`、`getBaseColumns`、`addActionsColumn`、`computedColumns`）全部迁入此文件：

```typescript
// composables/Table/useTableColumns.ts

export function useTableColumns(options: {
  columns: Ref<TableColumn[]>
  config: ComputedRef<TableConfig>
  editState: EditState
  actionsRenderer: (row, index) => VNodeChild
}) {
  // 列可见性/固定/排序状态
  const columnState = reactive<Map<string, ColumnMeta>>()

  // 序号列
  const mapIndexColumn = (col) => { ... }

  // 普通列 + 编辑渲染
  const mapDataColumn = (col) => { ... }

  // 操作列
  const mapActionsColumn = () => { ... }

  // 最终合成
  const resolvedColumns = computed(() => { ... })

  // 列设置变更
  const updateColumnMeta = (key, meta) => { ... }

  return { resolvedColumns, columnState, updateColumnMeta }
}
```

### 3.6 `useTableEdit.ts` — 统一编辑管理（合并3个hook）

当前 useRowEdit (226行) + useCellEdit (173行) + useModalEdit (165行) = **564行**，加上 useTableManager 中的编辑调度逻辑，总计 **800+ 行**。

合并后目标 **≤300 行**：

```typescript
// composables/Table/useTableEdit.ts

export function useTableEdit(options: EditOptions) {
  const mode = computed(() => options.config.edit?.mode || 'none')

  // === 统一状态 ===
  const editingKey = ref<DataTableRowKey | null>(null)
  const editingData = ref<DataRecord>({})
  const modalVisible = ref(false)

  // === 统一 API ===
  const start = (rowKey, columnKey?) => {
    switch (mode.value) {
      case 'modal': startModal(rowKey); break
      case 'cell':  startCell(rowKey, columnKey!); break
      case 'row':
      case 'both':  startRow(rowKey); break
    }
  }

  const save = async () => { ... }
  const cancel = () => { ... }
  const isEditing = (rowKey, columnKey?) => { ... }

  // === 内部实现（私有） ===
  const startModal = (rowKey) => { ... }
  const startRow = (rowKey) => { ... }
  const startCell = (rowKey, columnKey) => { ... }

  return { start, save, cancel, isEditing, modalVisible, editingData, editingKey }
}
```

### 3.7 子组件处理方案

你不想要 `components/` 子目录，有两个方案：

#### 方案 A：内联到 index.vue（推荐）

TableEditModal (165行) 和 TableSettings (68+531行) 的 **模板部分** 直接写在 index.vue 中，逻辑在 composables 里。这样 index.vue 纯模板大约 200 行（其中弹窗/drawer 各占 20-30 行模板），完全可控。

#### 方案 B：移入 composables 作为渲染函数

如果不想 index.vue 太长，渲染部分可以作为 composable 返回的 render 函数：

```typescript
// useTableColumns.ts 中返回
const renderEditModal = () => h(NModal, { ... })
const renderSettingsDrawer = () => h(NDrawer, { ... })
```

**推荐方案 A**，因为模板可读性远好于 h() 渲染函数。

---

## 四、composables 层级关系设计

```
用户调用层
    ↓
useTable()              ← 对外唯一入口，聚合所有功能
    ├── useTableConfig()   ← 配置合并 + 默认值
    ├── useTableColumns()  ← 列处理 + 渲染 + 设置面板状态
    ├── useTableEdit()     ← 编辑（行/单元格/弹窗统一）
    ├── useTableActions()  ← 操作按钮（只渲染，不管状态）
    ├── usePagination()    ← 分页（client/server 模式）
    ├── useTableExpand()   ← 展开 + 选择 + 父子联动
    └── useDynamicRow()    ← 动态行（增删复制移动打印）
```

**关键设计原则：**

1. **`useTable()` 是唯一聚合点** — 组件只调这一个 hook
2. **各 hook 之间松耦合** — 通过 `options` 参数传递依赖，不直接 import 兄弟 hook
3. **按需初始化** — `useTableExpand` 仅在 `config.expand` 存在时创建
4. **返回值扁平化** — 用户不需要知道内部有哪些 hook

---

## 五、具体优化清单

### 5.1 index.vue 优化（619行 → ≤200行）

| 移出内容                                                  | 目标位置                                | 行数  |
| --------------------------------------------------------- | --------------------------------------- | ----- |
| `renderCell` / `renderCellEdit` / cell 渲染               | `useTableColumns.ts`                    | ~80行 |
| `mapIndexColumn` / `mapRegularColumn` / 列映射            | `useTableColumns.ts`                    | ~60行 |
| `getBaseColumns` / `addActionsColumn` / `computedColumns` | `useTableColumns.ts`                    | ~60行 |
| `normalizedData` / `normalizedLoading` hack               | 移除，上层不传 Ref                      | ~20行 |
| `reactiveColumns` / `handleColumnChange` / 列设置         | `useTableColumns.ts`                    | ~40行 |
| `config` / `editableColumns` / `formOptions` 计算         | `useTableConfig.ts` / `useTableEdit.ts` | ~30行 |
| `logFixedColumns`                                         | 移除或 debug 模式                       | ~15行 |
| `computedScrollX`                                         | `useTableColumns.ts`                    | ~20行 |

### 5.2 data.ts 优化（531行 → ≤300行）

| 移出内容                                                                                 | 目标位置                   | 行数   |
| ---------------------------------------------------------------------------------------- | -------------------------- | ------ |
| `createUnifiedConfig` + 全部 build\* 函数                                                | `useTableConfig.ts`        | ~120行 |
| `renderEditComponent` / `renderEditingCell` / `renderEditableCell` / `renderDisplayCell` | `useTableColumns.ts`       | ~100行 |
| `createEditModeChecker`                                                                  | `useTableEdit.ts`          | ~10行  |
| `buildSettingsConfig`                                                                    | `useTableColumns.ts`       | ~50行  |
| `TablePresetConfig` 等类型定义                                                           | `types/modules/table.d.ts` | ~60行  |

保留在 data.ts 的：

- `EDIT_COMPONENTS` 映射
- `DEFAULT_VALUES` / `DEFAULT_TABLE_CONFIG`
- `generateFormOptions`
- `getDisplayValue` / `getDescriptionSpan`
- `processColumnConfig`
- `getTableProps`

### 5.3 useDynamicRow.ts 优化（780行 → ≤350行）

| 删减内容                                | 方案                                           | 行数减少 |
| --------------------------------------- | ---------------------------------------------- | -------- |
| `renderToolbar()` — 整个工具栏 h() 渲染 | 改为返回数据，由 index.vue 模板渲染            | ~200行   |
| `renderConfirmModal()`                  | 改为返回状态，由 index.vue `<NModal>` 模板渲染 | ~30行    |
| 重复的 tooltip + button 包装            | 模板循环渲染                                   | ~100行   |

优化后 useDynamicRow 只暴露：

```typescript
return {
  // 状态
  selectedRowKey, selectedRowData, canMoveUp, canMoveDown,
  deleteConfirmVisible, printLoading,
  // 方法
  addRow, insertRow, deleteRow, confirmDelete,
  copyRow, moveRowUp, moveRowDown,
  selectRow, clearSelection,
  handlePrint, handleDownload,
  // 列增强
  enhanceColumns,
  // 🆕 工具栏按钮配置（数据驱动，不再返回 VNode）
  toolbarButtons: computed(() => [...]),
}
```

### 5.4 SCSS 优化（482行 → ≤350行）

| 问题                          | 方案                                      |
| ----------------------------- | ----------------------------------------- |
| 50+ 处 `!important`           | 提升选择器优先级代替 `!important`         |
| `:last-child` 选择器误伤      | 改为 `.c-table-actions-column` 类名       |
| 子组件样式分散                | 列管理 SCSS (336行) 合并到主 `index.scss` |
| 重复的 `:deep()` + 全局选择器 | 使用 CSS 变量 + BEM 命名规范              |
| 暗色主题空注释块              | 移除无用代码                              |

### 5.5 console.log 清理

| 文件              | 清理数量                    |
| ----------------- | --------------------------- |
| useModalEdit.ts   | 6处（🚀🚫💾✅❌ emoji日志） |
| index.vue         | 3处（📌固定列、🔧列设置）   |
| useTableExpand.ts | 1处                         |
| useDynamicRow.ts  | 2处                         |
| data.ts           | 0处                         |
| **总计**          | **12处**                    |

方案：统一使用 debug 工具函数

```typescript
// utils/debug.ts
export const tableDebug = {
  log: (...args: any[]) =>
    import.meta.env.DEV && console.log('[C_Table]', ...args),
  warn: (...args: any[]) =>
    import.meta.env.DEV && console.warn('[C_Table]', ...args),
}
```

---

## 六、迁移策略

### 6.1 分阶段执行（推荐）

```
Phase 1: 基础重构（当前可以开始）
├── 创建 useTableConfig.ts     — 从 data.ts 迁出配置合并逻辑
├── 创建 useTableColumns.ts    — 从 index.vue 迁出列处理 + 从 data.ts 迁出渲染函数
├── 重写 index.vue             — 精简为纯模板薄壳
├── 精简 data.ts               — 只保留配置/默认值/映射
├── 子组件内联到 index.vue     — 删除 components/ 目录
└── 清理 console.log

Phase 2: 编辑统一
├── 合并 useRowEdit + useCellEdit + useModalEdit → useTableEdit.ts
├── 精简 useTableManager → 改名为 useTable（对外入口）
└── 扁平化 API 访问路径

Phase 3: 动态行优化
├── useDynamicRow.ts 移除 renderToolbar/renderConfirmModal
├── 改为数据驱动的按钮配置
└── index.vue 用 template 渲染工具栏

Phase 4: 样式优化
├── 合并所有 SCSS 到 index.scss
├── 移除 !important
├── BEM 命名规范化
└── 测试回归
```

### 6.2 每个 Phase 的验证标准

| Phase | 验证标准                                                                                 |
| ----- | ---------------------------------------------------------------------------------------- |
| 1     | 所有现有 demo 页面（10-table、11-table-expand、12-table-dynamic、13-action-bar）功能不变 |
| 2     | 行编辑、单元格编辑、弹窗编辑 三种模式全部正常                                            |
| 3     | 动态行工具栏（增删复制移动打印）全部正常                                                 |
| 4     | 暗色主题、响应式、固定列 全部正常                                                        |

---

## 七、优化前后数据对比（预估）

| 指标               | 当前                                          | 优化后                                  | 变化  |
| ------------------ | --------------------------------------------- | --------------------------------------- | ----- |
| C_Table 目录文件数 | 7 个 (含子目录)                               | 3 个                                    | -57%  |
| index.vue 行数     | 619                                           | ≤200                                    | -68%  |
| data.ts 行数       | 531                                           | ≤300                                    | -43%  |
| 使用侧 props 数量  | 30+                                           | 4 (`columns` `data` `loading` `config`) | -87%  |
| API 访问深度       | 4层 (`tableManager.editStates.modalEdit.xxx`) | 1层 (`table.startEdit()`)               | -75%  |
| console.log        | 12处                                          | 0 (dev模式可选)                         | -100% |
| !important 数量    | 50+                                           | ≤5                                      | -90%  |
| composables 文件数 | 8                                             | 8 (更清晰)                              | 0     |
| 总代码量           | ~5500 行                                      | ~3500 行                                | -36%  |

---

## 八、社区最佳实践参考

| 框架/库                   | 核心理念                                | 我们可借鉴的点            |
| ------------------------- | --------------------------------------- | ------------------------- |
| **VBen Admin BasicTable** | `useTable()` 返回 `[register, methods]` | 单一 hook 入口 + 扁平 API |
| **Ant Design ProTable**   | `columns` + `request` 两个核心 prop     | 极简 props 设计           |
| **TanStack Table**        | Headless UI — 逻辑引擎 + 自定义渲染     | composable 与 UI 解耦     |
| **Naive UI DataTable**    | 原生支持虚拟滚动、树形、远程排序        | 最大化利用底层能力        |
| **Formily**               | Schema 协议驱动                         | 配置化 > 命令式           |

**最核心的借鉴：**

> 90% 的场景用最少代码完成（约定大于配置），10% 的特殊场景通过逃生舱口（slot / render / onXxx）覆盖。

---

## 九、总结

你的组件功能覆盖度非常高，这是真正的优势。问题不在于功能多，而在于 **功能的组织方式**。优化后：

1. **C_Table 目录极简**：3 个文件，一目了然
2. **逻辑全在 composables**：高内聚、可独立测试、可按需加载
3. **使用侧极简**：4 个 props 覆盖 90% 场景
4. **维护清晰**：每个 composable 职责单一，改某个功能就改对应文件
5. **扩展自然**：新功能 = 新 composable + 注册到 useTable

接下来我们从 **Phase 1** 开始，逐步实施优化。
