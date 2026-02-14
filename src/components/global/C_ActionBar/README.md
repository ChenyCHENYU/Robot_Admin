# C_ActionBar 组件

> 通用操作按钮组件 - 配置化管理任何场景的按钮组

## 📦 组件位置

- **组件**: `src/components/global/C_ActionBar/index.vue`
- **类型**: `src/types/modules/action-bar.d.ts`
- **样式**: `src/components/global/C_ActionBar/index.scss`
- **演示**: `src/views/demo/13-action-bar/index.vue`

## ✨ 特性

- ✅ **通用场景**: 适用于表格、表单、详情页、编辑器等任何需要按钮组的场景
- ✅ **配置化**: 通过数组配置管理所有按钮
- ✅ **响应式**: 自动响应 `loading`、`disabled`、`show` 状态变化
- ✅ **灵活布局**: 支持左右分组、居中、自定义对齐
- ✅ **下拉菜单**: 内置下拉菜单支持，归类复杂操作
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **暗黑模式**: 自动适配主题，无需额外配置
- ✅ **动画效果**: 流畅的交互动画和反馈
- ✅ **中间插槽**: 支持自定义中间区域内容

## 🎯 适用场景

| 场景                | 示例                       | 使用方式         |
| ------------------- | -------------------------- | ---------------- |
| 📋 **表格工具栏**   | 新增/删除/导出/刷新        | 表格上方操作区   |
| 📝 **表单工具栏**   | 提交/重置/保存草稿/取消    | 表单底部/顶部    |
| 📄 **详情页头部**   | 编辑/删除/打印/分享/返回   | 详情页顶部操作栏 |
| 🎨 **编辑器工具栏** | 撤销/重做/格式化/导出/预览 | 编辑器顶部工具栏 |
| 🔍 **搜索过滤栏**   | 筛选/排序/重置/高级搜索    | 搜索框旁边       |
| 📦 **步骤条导航**   | 上一步/下一步/跳过/提交    | 步骤条下方       |
| 💳 **卡片操作栏**   | 卡片的任何操作按钮         | 卡片头部/底部    |

## 📖 基础用法

### 最简示例

```vue
<template>
  <C_ActionBar :actions="actions" />
</template>

<script setup lang="ts">
  import type { ActionItem } from '@/types/modules/action-bar'

  const actions: ActionItem[] = [
    {
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      group: 'left',
      onClick: handleAdd,
    },
    {
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      group: 'right',
      onClick: handleRefresh,
    },
  ]
</script>
```

## 🔧 完整 API

### Props

| 属性           | 类型              | 默认值 | 说明                                 |
| -------------- | ----------------- | ------ | ------------------------------------ |
| `actions`      | `ActionItem[]`    | `[]`   | 操作按钮列表（通过 `group` 分组）    |
| `leftActions`  | `ActionItem[]`    | `[]`   | 左侧按钮列表（优先级高于 `actions`） |
| `rightActions` | `ActionItem[]`    | `[]`   | 右侧按钮列表（优先级高于 `actions`） |
| `config`       | `ActionBarConfig` | `{}`   | 工具栏配置                           |

### ActionItem 配置项

```typescript
interface ActionItem {
  key?: string // 唯一标识（可选，用于调试）
  label: string // 按钮文字 ⭐
  icon?: string // 图标名称（mdi:xxx）
  type?: ActionButtonType // 按钮类型（primary/info/success/warning/error）
  size?: ActionButtonSize // 按钮尺寸（tiny/small/medium/large）
  loading?: boolean | Ref<boolean> // 加载状态（响应式）
  disabled?: boolean | Ref<boolean> // 禁用状态（响应式）
  show?: boolean | Ref<boolean> // 显示状态（响应式）
  tooltip?: string // 悬停提示文字
  group?: 'left' | 'right' // 分组标识
  dropdown?: ActionDropdownItem[] // 下拉菜单子项
  onClick?: () => void | Promise<void> // 点击事件回调
  buttonProps?: Partial<ButtonProps> // NButton 原生属性（扩展）
}
```

### ActionBarConfig 配置项

```typescript
interface ActionBarConfig {
  align?: 'left' | 'center' | 'right' | 'space-between' | 'space-around'
  size?: 'tiny' | 'small' | 'medium' | 'large' // 全局按钮尺寸
  gap?: number // 按钮间距（px）
  wrap?: boolean // 允许换行
  showDivider?: boolean // 显示分隔线
  dividerType?: 'vertical' | 'horizontal' // 分隔线类型
  compact?: boolean // 紧凑模式（减少内外边距）
}
```

### Events

| 事件名           | 参数                                             | 说明           |
| ---------------- | ------------------------------------------------ | -------------- |
| `action-click`   | `(action: ActionItem)`                           | 按钮点击事件   |
| `dropdown-click` | `(item: ActionDropdownItem, action: ActionItem)` | 下拉菜单项点击 |

### Slots

| 插槽名   | 说明               | 使用场景                         |
| -------- | ------------------ | -------------------------------- |
| `center` | 中间区域自定义内容 | 显示选中数量、状态信息、搜索框等 |

## 📝 使用示例

> 以下示例均可在 [演示页面](../../views/demo/13-action-bar/index.vue) 查看完整代码

### 1. 表格工具栏

**场景**：表格上方的全局操作（新增、批量删除、刷新等）+ 显示选中数量

```vue
<template>
  <C_ActionBar
    :left-actions="tableLeftActions"
    :right-actions="tableRightActions"
  >
    <template #center>
      <NSpace
        align="center"
        v-if="selectedCount > 0"
      >
        <NText depth="3">已选择:</NText>
        <NTag
          type="primary"
          :bordered="false"
        >
          {{ selectedCount }} 条
        </NTag>
        <NButton
          text
          size="small"
          @click="selectedCount = 0"
        >
          清空
        </NButton>
      </NSpace>
    </template>
  </C_ActionBar>

  <C_Table
    v-model:data="tableData"
    :columns="columns"
    @update:checked-row-keys="handleSelectionChange"
  />
</template>

<script setup lang="ts">
  const tableLeftActions = computed(() => [
    {
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      onClick: handleAdd,
    },
    {
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      disabled: selectedCount.value === 0,
      onClick: handleBatchDelete,
    },
  ])

  const tableRightActions = computed(() => [
    {
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      onClick: handleRefresh,
    },
  ])
</script>
```

### 2. 表单操作栏

**场景**：表单提交区域，操作按钮居中显示，支持异步提交

```vue
<template>
  <NForm
    label-placement="left"
    label-width="100"
  >
    <NFormItem label="用户名">
      <NInput v-model:value="formData.username" />
    </NFormItem>
    <NFormItem label="邮箱">
      <NInput v-model:value="formData.email" />
    </NFormItem>
  </NForm>

  <C_ActionBar
    :actions="formActions"
    :config="{ align: 'center', gap: 16 }"
  />
</template>

<script setup lang="ts">
  const formActions = computed(() => [
    {
      key: 'save-draft',
      label: '保存草稿',
      icon: 'mdi:content-save-outline',
      onClick: handleSaveDraft,
    },
    {
      key: 'reset',
      label: '重置',
      icon: 'mdi:refresh',
      onClick: () => {
        formData.username = ''
        formData.email = ''
      },
    },
    {
      key: 'submit',
      label: '提交',
      icon: 'mdi:check',
      type: 'primary',
      onClick: async () => {
        loading.value = true
        await submitForm()
        loading.value = false
      },
    },
  ])
</script>
```

### 3. 详情页头部

**场景**：详情页顶部操作栏，左侧返回/编辑，右侧打印/分享/删除

```vue
<template>
  <C_ActionBar
    :left-actions="detailLeftActions"
    :right-actions="detailRightActions"
    :config="{ showDivider: true }"
  />

  <NCard
    size="small"
    class="mt-4"
  >
    <NDescriptions
      label-placement="left"
      :column="2"
    >
      <NDescriptionsItem label="姓名">张三</NDescriptionsItem>
      <NDescriptionsItem label="部门">技术部</NDescriptionsItem>
      <NDescriptionsItem label="职位">前端工程师</NDescriptionsItem>
      <NDescriptionsItem label="状态">在职</NDescriptionsItem>
    </NDescriptions>
  </NCard>
</template>

<script setup lang="ts">
  const detailLeftActions = computed(() => [
    {
      key: 'back',
      label: '返回',
      icon: 'mdi:arrow-left',
      onClick: () => router.back(),
    },
    {
      key: 'edit',
      label: '编辑',
      icon: 'mdi:pencil',
      type: 'primary',
      onClick: handleEdit,
    },
  ])

  const detailRightActions = computed(() => [
    {
      key: 'print',
      label: '打印',
      icon: 'mdi:printer',
      onClick: handlePrint,
    },
    {
      key: 'share',
      label: '分享',
      icon: 'mdi:share-variant',
      onClick: handleShare,
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      onClick: handleDelete,
    },
  ])
</script>
```

### 4. 步骤条导航

**场景**：分步表单/向导流程，动态显示上一步/下一步/跳过/完成按钮

```vue
<template>
  <NSteps :current="currentStep">
    <NStep title="基础信息" />
    <NStep title="详细设置" />
    <NStep title="完成" />
  </NSteps>

  <C_ActionBar
    :actions="stepActions"
    :config="{ align: 'space-between' }"
  />
</template>

<script setup lang="ts">
  const currentStep = ref(0)

  const stepActions = computed(() => [
    {
      key: 'prev',
      label: '上一步',
      icon: 'mdi:arrow-left',
      disabled: currentStep.value === 0,
      onClick: () => currentStep.value--,
    },
    {
      key: 'skip',
      label: '跳过',
      icon: 'mdi:skip-next',
      show: currentStep.value < 2,
      onClick: () => (currentStep.value = 2),
    },
    {
      key: 'next',
      label: currentStep.value === 2 ? '完成' : '下一步',
      icon: currentStep.value === 2 ? 'mdi:check' : 'mdi:arrow-right',
      type: 'primary',
      onClick: () => {
        if (currentStep.value === 2) {
          handleComplete()
        } else {
          currentStep.value++
        }
      },
    },
  ])
</script>
```

### 5. 响应式状态

**场景**：按钮状态自动响应数据变化（loading/disabled/show）

```vue
<template>
  <NSpace>
    <NCheckbox v-model:checked="states.hasSelection">
      模拟已选择数据
    </NCheckbox>
    <NCheckbox v-model:checked="states.isEditing"> 模拟编辑模式 </NCheckbox>
  </NSpace>

  <C_ActionBar :actions="reactiveActions" />
</template>

<script setup lang="ts">
  const states = reactive({
    hasSelection: false,
    isEditing: false,
    isRefreshing: false,
  })

  const reactiveActions = computed(() => [
    {
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      disabled: states.isEditing,
      tooltip: states.isEditing ? '编辑模式下不可新增' : '新增数据',
      onClick: handleAdd,
    },
    {
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      disabled: !states.hasSelection,
      show: states.hasSelection,
      tooltip: '删除选中数据',
      onClick: handleDelete,
    },
    {
      label: states.isEditing ? '保存' : '编辑',
      icon: states.isEditing ? 'mdi:check' : 'mdi:pencil',
      type: states.isEditing ? 'success' : 'warning',
      onClick: () => {
        states.isEditing = !states.isEditing
      },
    },
    {
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      loading: states.isRefreshing,
      onClick: async () => {
        states.isRefreshing = true
        await fetchData()
        states.isRefreshing = false
      },
    },
  ])
</script>
```

### 6. 下拉菜单

**场景**：将多个相关操作归类到下拉菜单，减少按钮数量

```vue
<template>
  <C_ActionBar
    :actions="dropdownActions"
    @dropdown-click="handleDropdownClick"
  />
</template>

<script setup lang="ts">
  const dropdownActions = computed(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      group: 'left',
      onClick: handleAdd,
    },
    {
      key: 'more',
      label: '更多操作',
      icon: 'mdi:dots-horizontal',
      group: 'right',
      dropdown: [
        {
          key: 'export-excel',
          label: '导出Excel',
          icon: 'mdi:file-excel',
          onClick: () => exportData('excel'),
        },
        {
          key: 'export-pdf',
          label: '导出PDF',
          icon: 'mdi:file-pdf',
          onClick: () => exportData('pdf'),
        },
        {
          key: 'print',
          label: '打印',
          icon: 'mdi:printer',
          onClick: handlePrint,
        },
      ],
    },
    {
      key: 'settings',
      label: '设置',
      icon: 'mdi:cog',
      group: 'right',
      dropdown: [
        {
          key: 'column',
          label: '列设置',
          icon: 'mdi:table-column',
          onClick: openColumnSettings,
        },
        {
          key: 'filter',
          label: '筛选设置',
          icon: 'mdi:filter',
          onClick: openFilterSettings,
        },
      ],
    },
  ])

  const handleDropdownClick = (
    item: ActionDropdownItem,
    action: ActionItem
  ) => {
    console.log('下拉菜单点击:', action.label, '→', item.label)
  }
</script>
```

## 🎨 样式定制

组件已适配暗黑模式，无需额外配置。如需自定义样式：

```scss
.c-action-bar {
  // 自定义背景
  background: linear-gradient(to right, #f5f5f5, #ffffff);

  // 自定义边框
  border: 2px solid #e0e0e0;
  border-radius: 12px;

  // 自定义间距
  padding: 20px;
  gap: 20px;

  .actions-group {
    gap: 16px;
  }
}
```

## 🎯 最佳实践

### 1. 使用 `leftActions` 和 `rightActions`

```vue
<!-- ✅ 推荐：语义清晰 -->
<C_ActionBar :left-actions="primaryActions" :right-actions="utilityActions" />

<!-- ❌ 不推荐：需要手动设置 group -->
<C_ActionBar :actions="allActions" />
```

### 2. 响应式状态使用 computed

```typescript
// ✅ 推荐：自动响应变化
const actions = computed(() => [
  { label: '删除', disabled: selectedCount.value === 0 },
])

// ❌ 不推荐：不会自动更新
const actions = [{ label: '删除', disabled: selectedCount.value === 0 }]
```

### 3. 异步操作显示 loading

```typescript
const actions = [
  {
    label: '保存',
    type: 'primary',
    loading: saving, // 绑定响应式状态
    onClick: async () => {
      saving.value = true
      await saveData()
      saving.value = false
    },
  },
]
```

### 4. 下拉菜单归类操作

```typescript
// ✅ 推荐：复杂操作用下拉菜单
const actions = [
  {
    label: '导出',
    dropdown: [
      { key: 'excel', label: '导出 Excel' },
      { key: 'pdf', label: '导出 PDF' },
      { key: 'csv', label: '导出 CSV' },
    ],
  },
]

// ❌ 不推荐：按钮过多
const actions = [
  { label: '导出 Excel' },
  { label: '导出 PDF' },
  { label: '导出 CSV' },
]
```

### 5. Tooltip 提供帮助信息

```typescript
const actions = [
  {
    label: '批量删除',
    disabled: computed(() => selectedCount.value === 0),
    tooltip: computed(() =>
      selectedCount.value === 0
        ? '请先选择要删除的数据'
        : `删除 ${selectedCount.value} 条数据`
    ),
  },
]
```

## 💡 进阶技巧

### 动态权限控制

```typescript
const actions = computed(() => {
  const base = [
    { label: '新增', icon: 'mdi:plus', type: 'primary', onClick: handleAdd },
  ]

  // 根据权限动态添加
  if (hasPermission('edit')) {
    base.push({ label: '编辑', icon: 'mdi:pencil', onClick: handleEdit })
  }

  if (hasPermission('delete')) {
    base.push({
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      onClick: handleDelete,
    })
  }

  return base
})
```

### 条件显示和禁用

```typescript
{
  label: '审核',
  icon: 'mdi:check-circle',
  type: 'success',
  show: computed(() => status.value === 'pending'),      // 仅待审核时显示
  disabled: computed(() => !hasReviewPermission.value),  // 无权限时禁用
  tooltip: computed(() =>
    !hasReviewPermission.value ? '您没有审核权限' : '审核通过'
  ),
  onClick: handleApprove
}
```

### 事件监听和日志

```vue
<C_ActionBar
  :actions="actions"
  @action-click="handleActionClick"
  @dropdown-click="handleDropdownClick"
/>

<script setup lang="ts">
  const handleActionClick = (action: ActionItem) => {
    console.log('按钮点击:', action.label)
    // 埋点统计
    analytics.track('button_click', {
      button: action.label,
      page: 'table-page',
    })
  }

  const handleDropdownClick = (
    item: ActionDropdownItem,
    action: ActionItem
  ) => {
    console.log('下拉菜单点击:', action.label, '→', item.label)
  }
</script>
```

## 🔄 与其他组件协作

### 与 C_Table 配合

```vue
<template>
  <!-- 工具栏：全局操作 -->
  <C_ActionBar :left-actions="toolbarActions" />

  <!-- 表格：行操作 -->
  <C_Table :actions="rowActions" />
</template>

<script setup lang="ts">
  // 工具栏按钮（表格外部）
  const toolbarActions = [
    { label: '新增', type: 'primary', onClick: handleAdd },
    { label: '批量导入', onClick: handleImport },
  ]

  // 行操作按钮（表格内部）
  const rowActions = {
    edit: handleEdit,
    delete: handleDelete,
    detail: handleDetail,
  }
</script>
```

### 与 C_Form 配合

```vue
<template>
  <C_Form
    ref="formRef"
    :model="formData"
  >
    <!-- 表单内容 -->
  </C_Form>

  <!-- 表单操作栏 -->
  <C_ActionBar
    :actions="formActions"
    :config="{ align: 'center', gap: 16 }"
  />
</template>

<script setup lang="ts">
  const formRef = ref()

  const formActions = [
    {
      label: '提交',
      type: 'primary',
      onClick: async () => {
        await formRef.value?.validate()
        await submitForm()
      },
    },
    {
      label: '重置',
      onClick: () => formRef.value?.reset(),
    },
  ]
</script>
```

## 🆚 对比现有架构

| 功能维度     | `useTableActions`                  | `C_ActionBar`                              |
| ------------ | ---------------------------------- | ------------------------------------------ |
| **作用域**   | 表格**行内**操作（编辑/删除/详情） | **通用按钮组**（任何场景）                 |
| **位置**     | 表格操作列                         | 任何需要按钮组的地方                       |
| **配置方式** | `actions` prop（行操作）           | `actions` / `leftActions` / `rightActions` |
| **适用场景** | 单行数据操作                       | 全局/批量/导航/工具操作                    |
| **数据绑定** | 绑定行数据                         | 独立于数据                                 |

**两者互补，不冲突** ✅

## 📚 相关文档

- [ActionItem 类型定义](../../types/modules/action-bar.d.ts)
- [演示页面源码](../../views/demo/13-action-bar/index.vue)
- [Naive UI Button 文档](https://www.naiveui.com/zh-CN/os-theme/components/button)

---

**作者**: ChenY  
**日期**: 2026-02-14  
**版本**: 1.0.0
