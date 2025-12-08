# @robot/ui

Robot Admin UI 组件库 - 提供所有 Robot Admin 应用共享的 Composables 和业务组件。

## 📦 包含内容

### 📊 Table Composables
- `usePagination` - 分页逻辑
- `useTableData` - 表格数据管理
- `useTableActions` - 表格操作按钮
- `useTableManager` - 表格管理器
- `useTableExpand` - 表格展开行
- `useCellEdit` - 单元格编辑
- `useRowEdit` - 行编辑
- `useModalEdit` - 弹窗编辑
- `useDynamicRow` - 动态行
- `createTableActions` - 创建表格操作

### 📝 Form Composables
- 表单验证逻辑
- 表单状态管理
- 表单提交处理

### 📈 AntV Composables
- 图表通用逻辑
- X6 流程图逻辑
- ECharts 封装

## 📖 使用示例

```typescript
// 导入 Table Composables
import { usePagination, useTableData, useTableActions } from '@robot/ui'

// 使用分页
const { page, pageSize, total, handlePageChange } = usePagination()

// 使用表格数据
const { data, loading, refresh } = useTableData(fetchDataFn)

// 使用表格操作
const { createActions } = useTableActions()
const actions = createActions([
  { label: '编辑', onClick: handleEdit },
  { label: '删除', onClick: handleDelete }
])
```

## 🎯 设计原则

1. **高度复用** - 所有 Robot Admin 应用共享相同的表格/表单逻辑
2. **类型完善** - 完整的 TypeScript 类型支持
3. **零耦合** - Composables 不依赖具体业务
4. **易扩展** - 支持应用级自定义扩展

## 🔧 依赖说明

- **Naive UI** - UI 组件库基础
- **Vue 3** - Composition API
- **@robot/core** - 核心工具函数(如需要)
