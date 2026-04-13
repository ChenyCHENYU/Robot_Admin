---
name: page-codegen
description: 'Use when: generating Vue 3 page code from page-spec JSON (produced by prototype-scan). Outputs index.vue + data.ts + index.scss following Robot Admin conventions. Triggers on: page generation, code generation, 生成页面, 代码生成, vue页面, codegen, 页面骨架, scaffold.'
---

# Skill: 页面代码生成（page-codegen）

根据 **page-spec JSON**（来自 prototype-scan / api-contract）自动生成完整的 Vue 3 页面代码，
严格遵循 Robot Admin 项目编码规范。

---

## 触发

- 接收 page-spec JSON → 生成 `index.vue` + `data.ts` + `index.scss`（三件套）
- 可选追加：`layouts/` 目录（多布局变体）、composables（复杂业务逻辑）

---

## 输出文件结构

根据页面模式（mode），输出不同复杂度的文件结构：

### 简单页面（LIST / FORM_MODAL）

```
src/views/<domain>/<module-name>/
├── index.vue      # 页面主文件
├── data.ts        # 类型 + 配置 + 常量
└── index.scss     # 页面样式
```

### 中等复杂页面（TREE_LIST / MASTER_DETAIL）

```
src/views/<domain>/<module-name>/
├── index.vue
├── data.ts
├── index.scss
└── components/          # 局部子组件
    ├── DetailDrawer.vue
    └── FormModal.vue
```

### 高度复杂页面（FORM_PAGE / DETAIL_TABS / COMPOSITE）

```
src/views/<domain>/<module-name>/
├── index.vue
├── data.ts
├── index.scss
├── components/
│   ├── BasicInfo.vue
│   └── SubTable.vue
└── composables/         # 业务逻辑
    └── useXxxLogic.ts
```

---

## data.ts 生成规则

### 区块顺序（固定）

```typescript
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: {{date}}
 * @Description: {{页面中文名}} — 数据配置
 * Copyright (c) {{year}} by CHENY, All Rights Reserved 😎.
 */

import type { SelectOption, DataRecord } from '@robot-admin/naive-ui-components'
import type { TableColumn, UseTableCrudConfig } from '@robot-admin/request-core'
import { PRESET_RULES } from '@robot-admin/form-validate'

// ================= 业务类型定义 =================
// 从 page-spec.columns + page-spec.form 合并字段生成 interface

export interface {{ResourceName}} extends DataRecord {
  id: number | string
  // ... 所有字段
}

export interface {{ResourceName}}FormData {
  // ... 表单字段（id 可选）
}

export interface SearchForm {
  // ... 查询字段
}

// ================= 选项配置 =================
// 下拉框 / 筛选器的选项数据

export const STATUS_OPTIONS: SelectOption[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

// ================= Tag 映射配置 =================
// 用于状态类列渲染彩色标签

export const STATUS_TAG_CONFIG: Record<string | number, {
  text: string
  type: 'default' | 'success' | 'error' | 'warning' | 'info'
}> = {
  1: { text: '启用', type: 'success' },
  0: { text: '禁用', type: 'error' },
}

// ================= 图标配置 =================

export const ICON_CONFIG = {
  search: 'mdi:magnify',
  plus: 'mdi:plus',
  refresh: 'mdi:refresh',
  edit: 'mdi:pencil',
  delete: 'mdi:delete',
  eye: 'mdi:eye',
  // ... 根据 page-spec.toolbar + operations 的 icon 字段
} as const

// ================= 格式化函数 =================
// 简短的格式化函数（列渲染用）

// ================= 表格列配置 =================

export const getTableColumns = (): TableColumn[] => [
  // 从 page-spec.columns 映射
  {
    key: 'fieldName',
    title: '列标题',
    width: 120,
    // 可编辑列追加 editable / editType / editProps
    // 状态列追加 render 函数（渲染 NTag）
  },
]

// ================= 表单验证规则 =================

export const FORM_RULES: FormRules = {
  // 从 page-spec.form 的 rules 字段映射
  fieldName: [
    PRESET_RULES.required('字段名'),
    // ...
  ],
}

// ================= 表单默认值 =================

export const FORM_DEFAULTS: {{ResourceName}}FormData = {
  // 所有字段的初始值
}

// ================= useTableCrud 配置 =================
// 仅 LIST 模式页面使用

export const getTableCrudConfig = (): UseTableCrudConfig => ({
  api: {
    list: '/<domain>/<resource>',
    create: '/<domain>/<resource>',
    update: '/<domain>/<resource>/:id',
    delete: '/<domain>/<resource>/:id',
    detail: '/<domain>/<resource>/:id',
  },
  columns: getTableColumns(),
  pagination: { pageSize: 20 },
})
```

### 关键映射规则

**page-spec.columns → TableColumn：**

| page-spec 字段             | TableColumn 字段                |
| -------------------------- | ------------------------------- |
| `key`                      | `key`                           |
| `title`                    | `title`                         |
| `width`                    | `width`                         |
| `sortable`                 | `sortable: true`                |
| `render: 'tag'` + `tagMap` | `render: (row) => h(NTag, ...)` |
| `render: 'text'`           | 默认文本渲染                    |

**page-spec.form → FormRules：**

| page-spec 字段          | FormRules 映射                         |
| ----------------------- | -------------------------------------- |
| `required: true`        | `PRESET_RULES.required('字段名')`      |
| `rules: 'email'`        | `PRESET_RULES.email('邮箱')`           |
| `rules: 'mobile'`       | `PRESET_RULES.mobile('手机号')`        |
| `rules: 'length(2,20)'` | `PRESET_RULES.length('字段名', 2, 20)` |
| `rules: 'range(0,100)'` | `PRESET_RULES.range('字段名', 0, 100)` |

---

## index.vue 生成规则

### 文件头

```vue
<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: {{date}}
 * @Description: {{页面中文名}}
 * Copyright (c) {{year}} by CHENY, All Rights Reserved 😎.
-->
```

### Script 区块顺序（固定）

```vue
<script setup lang="ts">
  // ① defineOptions
  defineOptions({ name: '{{ComponentName}}' })

  // ② 导入配置数据
  import { ... } from './data'
  import { ... } from '@/api/{{domain}}-{{resource}}'

  // ③ 响应式状态
  const message = useMessage()
  const dialog = useDialog()
  const loading = ref(false)
  const searchForm = ref<SearchForm>({ ... })

  // ④ useTableCrud（LIST 模式）
  const tableCrud = useTableCrud(getTableCrudConfig())

  // ⑤ 计算属性

  // ⑥ 方法：查询 / CRUD / 事件处理

  // ⑦ 生命周期
  onMounted(() => { ... })
</script>
```

### 自动导入清单（无需 import）

以下 API 自动导入，生成代码中**不要写 import 语句**：

```
Vue:     ref, computed, watch, onMounted, nextTick, reactive, readonly, h
Router:  useRoute, useRouter
Pinia:   defineStore, storeToRefs
VueUse:  useLocalStorage, useClipboard, useDebounceFn
NaiveUI: NCard, NButton, NSpace, NInput, NSelect, NTag, NModal, NDrawer,
         NGrid, NGi, NTabs, NTabPane, NAlert, NSwitch, NRadioGroup, ...
         useMessage, useDialog, useNotification
Store:   s_userStore, s_themeStore, ...
```

### Template 区块：按页面模式展开

---

#### 模式 A：LIST（查询 + 表格）

```vue
<template>
  <div class="{{kebab-name}}">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace>
          <!-- 查询字段：从 page-spec.query 生成 -->
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索..."
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                :name="ICON_CONFIG.search"
                :size="16"
              />
            </template>
          </NInput>
          <!-- 更多查询字段... -->
        </NSpace>
        <!-- 工具栏按钮：从 page-spec.toolbar 生成 -->
        <C_ActionBar
          :actions="toolbarActions"
          :config="{ compact: true }"
        />
      </NSpace>
    </NCard>

    <!-- 表格 -->
    <NCard>
      <C_Table
        ref="tableRef"
        :columns="tableColumns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
        :config="{
          actions: tableActions,
          pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            remote: true,
          },
          display: { scrollX: {{scrollX}} },
        }"
        @pagination-change="handlePaginationChange"
      />
    </NCard>

    <!-- 新增/编辑弹窗（FORM_MODAL） -->
    <NModal
      v-model:show="showFormModal"
      preset="card"
      :title="formMode === 'add' ? '新增' : '编辑'"
      style="width: 600px"
    >
      <C_Form
        ref="formRef"
        :options="formOptions"
        :model="formData"
        :rules="formRules"
      />
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showFormModal = false">取消</NButton>
          <NButton
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            确认
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
```

---

#### 模式 B：TREE_LIST（树形 + 表格）

```vue
<template>
  <div class="{{kebab-name}}">
    <NCard class="header-card">
      <!-- 搜索区 -->
    </NCard>

    <div class="main-content">
      <NGrid
        :cols="24"
        :x-gap="16"
        responsive="screen"
      >
        <!-- 左侧树 -->
        <NGi :span="6">
          <NCard
            title="分类树"
            class="content-card"
          >
            <C_Tree
              ref="treeRef"
              mode="custom"
              :data="treeData"
              :searchable="true"
              @node-select="handleTreeSelect"
            />
          </NCard>
        </NGi>
        <!-- 右侧表格 -->
        <NGi :span="18">
          <NCard class="content-card">
            <C_Table ... />
          </NCard>
        </NGi>
      </NGrid>
    </div>
  </div>
</template>
```

---

#### 模式 C：FORM_PAGE（独立表单页）

```vue
<template>
  <div class="{{kebab-name}}">
    <NCard :title="pageTitle">
      <C_Form
        ref="formRef"
        :options="formOptions"
        :model="formData"
        :rules="formRules"
        :config="{
          layout: 'tabs',
          // 或 layout: 'steps'
        }"
      />
      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleBack">返回</NButton>
          <NButton
            type="primary"
            :loading="submitLoading"
            @click="handleSave"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </div>
</template>
```

---

#### 模式 D：MASTER_DETAIL（主表 + 明细）

```vue
<template>
  <div class="{{kebab-name}}">
    <!-- 上方：主表 -->
    <NCard title="主表">
      <C_Table
        :columns="masterColumns"
        :data="masterData"
        ...
      />
    </NCard>
    <!-- 下方：明细表 -->
    <NCard :title="detailTitle">
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
      >
        <NTabPane
          v-for="sub in subTables"
          :key="sub.key"
          :name="sub.key"
          :tab="sub.title"
        >
          <C_Table
            :columns="sub.columns"
            :data="sub.data"
            ...
          />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>
```

---

## index.scss 生成规则

```scss
// 页面容器
.{{kebab-name}} {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .header-card {
    :deep(.n-card__content) {
      padding: 16px;
    }
  }

  .content-card {
    height: calc(100vh - 220px);
    overflow: auto;
  }

  // 根据页面模式追加：
  // TREE_LIST → .main-content { ... }
  // MASTER_DETAIL → .detail-section { ... }
}
```

---

## 操作列按钮生成

从 page-spec.operations 生成 tableActions 数组：

```typescript
const tableActions = computed(() => [
  {
    label: '编辑',
    type: 'primary' as const,
    icon: ICON_CONFIG.edit,
    onClick: (row: ResourceItem) => handleEdit(row),
    // 条件显示
    show: (row: ResourceItem) => row.status === 1,
  },
  {
    label: '删除',
    type: 'error' as const,
    icon: ICON_CONFIG.delete,
    onClick: (row: ResourceItem) => handleDelete(row),
    confirm: { title: '确认删除', content: '删除后不可恢复' },
  },
])
```

> ⚠️ **操作列按钮必须与 page-spec 严格一一对应，不可自编按钮**

---

## 状态列渲染

状态类列必须用 NTag 彩色标签渲染：

```typescript
// data.ts
export const STATUS_TAG_CONFIG = {
  active: { text: '在职', type: 'success' },
  inactive: { text: '离职', type: 'error' },
  probation: { text: '试用期', type: 'warning' },
} as const

// 列定义中
{
  key: 'status',
  title: '状态',
  width: 100,
  render: (row: Employee) => {
    const config = STATUS_TAG_CONFIG[row.status]
    return config ? h(NTag, { type: config.type, size: 'small' }, () => config.text) : '-'
  },
}
```

---

## 生成校验 Checklist

- [ ] `defineOptions({ name: '...' })` 存在
- [ ] 文件头注释完整（Author/Date/Description）
- [ ] JSDoc 注释覆盖所有导出函数
- [ ] 使用 `@robot-admin/request-core` 的 useTableCrud / getData / postData
- [ ] 使用 `@robot-admin/form-validate` 的 PRESET_RULES
- [ ] 使用 `@robot-admin/naive-ui-components` 的 C_Table / C_Form / C_ActionBar
- [ ] 自动导入的 API 未被手动 import（ref/computed/NCard/useMessage 等）
- [ ] 样式使用 `<style lang="scss" scoped>` + `@use './index.scss'`
- [ ] 操作列按钮与 page-spec 一一对应
- [ ] 状态类列使用 NTag 渲染
- [ ] 不多加功能、不多加注释、不自编按钮
