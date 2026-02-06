# useTableCrud

> 配置驱动的表格 CRUD 组合式 API，极简使用，功能完整

## 🎯 设计目标

- ✅ **配置驱动**: 一个配置对象搞定所有表格需求
- ✅ **零样板代码**: 无需工厂函数、适配器、类型体操
- ✅ **扁平化返回**: 直接解构使用，无需多层嵌套
- ✅ **完整功能**: CRUD、分页、编辑、详情、自定义操作一应俱全
- ✅ **类型安全**: 完整的 TypeScript 支持

## 📦 安装使用

```typescript
import { useTableCrud } from '@/composables/useTableCrud'
```

## 🚀 快速开始

### 基础用法

```typescript
const table = useTableCrud<Employee>({
  // API 配置
  api: {
    list: '/employees/list',
    get: '/employees/:id',
    create: '/employees',
    update: '/employees/:id',
    remove: '/employees/:id',
  },

  // 列配置
  columns: [
    {
      key: 'name',
      title: '姓名',
      editable: true,
      editType: 'input',
    },
    {
      key: 'email',
      title: '邮箱',
      editable: true,
      editType: 'email',
    },
  ],

  // 自定义操作
  customActions: [
    {
      key: 'copy',
      label: '复制',
      icon: 'mdi:content-copy',
      handler: (row, ctx) => {
        const newRow = { ...row, id: Date.now() }
        ctx.data.unshift(newRow)
        ctx.message.success('复制成功')
      },
    },
  ],
})

// 自动加载数据（默认 autoLoad: true）
// 如需禁用自动加载：autoLoad: false
```

### 模板使用

```vue
<template>
  <c-table
    v-model:data="table.data.value"
    :columns="table.columns.value"
    :loading="table.loading.value"
    :actions="table.actions.value"
    :edit-mode="table.editMode.value"
    :pagination="table.pagination.value"
    @save="table.save"
    @cancel="table.handleCancel"
    @pagination-change="table.handlePaginationChange"
  />
</template>
```

## 📚 API 文档

### 配置选项

| 参数                       | 类型                             | 必填 | 默认值 | 说明                           |
| -------------------------- | -------------------------------- | ---- | ------ | ------------------------------ |
| `api`                      | `ApiEndpoints`                   | ✅   | -      | API 端点配置                   |
| `columns`                  | `TableColumn[]`                  | ✅   | -      | 表格列配置                     |
| `customActions`            | `CustomAction[]`                 | ❌   | `[]`   | 自定义操作按钮                 |
| `detail`                   | `DetailConfig`                   | ❌   | -      | 详情弹窗配置                   |
| `idKey`                    | `string`                         | ❌   | `'id'` | ID 字段名                      |
| `defaultPageSize`          | `number`                         | ❌   | `10`   | 默认分页大小                   |
| `defaultPaginationEnabled` | `boolean`                        | ❌   | `true` | 是否启用分页（默认传分页参数） |
| `autoLoad`                 | `boolean`                        | ❌   | `true` | 是否自动加载数据               |
| `createNewRow`             | `() => T`                        | ❌   | -      | 创建新行的工厂函数             |
| `extractListData`          | `(res: any) => { items, total }` | ❌   | -      | 自定义列表数据提取             |

#### 💡 分页最佳实践

**默认行为**（推荐）：

```typescript
// ✅ 默认传分页参数 page=1&pageSize=10
const table = useTableCrud({
  api: { list: '/employees/list' },
  columns: [...],
  // 无需配置，默认就传分页
})
```

**禁用分页**（特殊场景）：

```typescript
// ❌ 仅在接口不支持分页时使用
const table = useTableCrud({
  api: { list: '/employees/list' },
  columns: [...],
  defaultPaginationEnabled: false, // 不传分页参数
})
```

### 返回值

#### 数据状态

- `data` - 表格数据
- `loading` - 加载状态
- `total` - 数据总数

#### 表格配置

- `columns` - 表格列配置
- `actions` - 操作按钮配置
- `tableRef` - 表格引用

#### 分页

- `page` - 分页状态 `{ current, size }`
- `paginationEnabled` - 分页启用状态
- `pagination` - 分页配置

#### 核心方法

- `refresh()` - 刷新数据
- `add(defaultData?)` - 添加新行
- `save(row)` - 保存数据（新增或更新）
- `remove(row)` - 删除单条数据
- `batchRemove(rows)` - 批量删除数据
- `getDetail(row)` - 获取详情

#### 批量操作示例

```typescript
// API 配置（可选批量接口）
api: {
  remove: '/employees/:id',
  batchRemove: '/employees/batch', // 可选
}

// 使用批量删除
await table.batchRemove(selectedRows)

// 逻辑：
// - 有 batchRemove 接口 → 调用批量接口
// - 没有 → 用 Promise.all 并发调用单删接口
```

#### 事件处理

- `handleCancel()` - 处理取消编辑
- `handlePaginationChange(page, size)` - 处理分页变化
- `handleRowDelete(row, index)` - 处理行删除

#### 详情弹窗

- `detail` - 详情弹窗状态
- `detailConfig` - 详情配置

## 🎨 完整示例

查看 [`src/views/demo/10-table`](../../../views/demo/10-table) 获取完整示例

## 🔄 对比 usePageCrud

| 特性       | usePageCrud   | useTableCrud |
| ---------- | ------------- | ------------ |
| 适用场景   | 通用 CRUD     | 专注表格     |
| 配置方式   | 分散配置      | 统一配置     |
| 使用复杂度 | 需要适配器    | 开箱即用     |
| 代码量     | 多个工厂函数  | 一行搞定     |
| 类型体操   | 需要定义 Deps | 自动推导     |

## 📝 更新日志

### v1.0.0 (2026-02-06)

- ✨ 初始版本
- ✨ 完整替代 usePageCrud
- ✨ 支持所有表格场景
