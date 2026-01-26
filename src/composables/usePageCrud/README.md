# usePageCrud - 通用页面 CRUD 组合式 API

> 配置驱动，开箱即用，代码量减少 80%+

## 核心理念

**统一的接口管理方案**

传统问题：

- ❌ CRUD 用一套，业务操作（审批、启用等）又要单独定义
- ❌ 代码分散，维护困难
- ❌ 类型不统一，错误处理不一致

我们的方案：

- ✅ **标准 CRUD**：`list`、`create`、`update`、`remove`
- ✅ **业务操作**：通过 `actions` 配置，与 CRUD 同级
- ✅ **临时操作**：通过 `action()` 方法，灵活调用
- ✅ 统一的错误处理、消息通知、类型支持

```typescript
const crud = usePageCrud({
  // 标准 CRUD（增删改查）
  list: '/api/user/list', // 查 - 列表
  get: '/api/user/detail', // 查 - 详情
  create: '/api/user/create', // 增
  update: '/api/user/update', // 改
  remove: '/api/user/delete', // 删

  // ✨ 业务操作（与 CRUD 平级）
  actions: {
    approve: '/api/user/approve',
    reject: '/api/user/reject',
    enable: '/api/user/enable',
  },
})

// 使用方式一致
await crud.fetch() // 查询列表
await crud.get(1) // 查询详情
await crud.create(data) // 新增
await crud.update(data) // 更新
await crud.remove(id) // 删除
await crud.actions.approve(data) // 业务操作
await crud.action('POST', '/api/user/export', data) // 临时操作
```

## 特性

- ✅ **配置驱动**：声明式 API 配置，无需编写重复代码
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **自动刷新**：增删改后智能刷新列表
- ✅ **自动通知**：自动检测 UI 框架消息系统（Naive UI、Element Plus、Ant Design）
- ✅ **业务扩展**：通过 actions 无缝扩展业务操作
- ✅ **表格适配**：一行代码适配表格组件（`toTableApis`）
- ✅ **灵活适配**：支持各种后端响应格式

## 快速开始

```typescript
import { usePageCrud } from '@/composables/usePageCrud'

// 1️⃣ 基础用法（完整的增删改查 + 自定义业务操作）
const crud = usePageCrud({
  list: '/api/user/list', // 查 - 列表查询
  get: '/api/user/detail', // 查 - 详情查询
  create: '/api/user/create', // 增 - 新增
  update: '/api/user/update', // 改 - 更新
  remove: '/api/user/delete', // 删 - 删除
  // ✨ 自定义业务操作
  actions: {
    approve: '/api/user/approve', // 审批
    reject: '/api/user/reject', // 拒绝
    enable: '/api/user/enable', // 启用
    disable: '/api/user/disable', // 禁用
    resetPassword: '/api/user/reset-password',
  },
})

// 使用 CRUD
await crud.fetch() // 查询列表
await crud.get(1) // 查询详情
await crud.create({ name: '张三' }) // 新增
await crud.update({ id: 1, name: '李四' }) // 更新
await crud.remove(1) // 删除

// 使用自定义操作
await crud.actions.approve({ id: 1 })
await crud.actions.resetPassword({ id: 1, password: 'new123' })

// 2️⃣ 通用 action 方法（不需要预定义）
await crud.action('POST', '/api/user/send-email', { id: 1, content: 'xxx' })

// 3️⃣ 与表格组件配合使用（超简洁！）
import { usePageCrud, toTableApis } from '@/composables/usePageCrud'
import { createTableActions } from '@/composables/Table/createTableActions'

const crud = usePageCrud<User>({
  list: '/api/user/list',
  get: '/api/user/:id',
  update: '/api/user/:id',
  remove: '/api/user/:id',
})

const tableActions = createTableActions({
  apis: toTableApis(crud), // ✨ 一行搞定！自动适配 update/delete/detail
  custom: [...] // 自定义操作按钮
})

// 4️⃣ 带类型定义
interface User {
  id: number
  name: string
  email: string
}

const crud = usePageCrud<User>({
  list: '/api/user/list', // 查 - 列表
  get: '/api/user/detail', // 查 - 详情
  create: '/api/user/create', // 增
  update: '/api/user/update', // 改
  remove: '/api/user/delete', // 删
  actions: {
    approve: '/api/user/approve',
    reject: '/api/user/reject',
  },
})

// 使用
await crud.fetch() // 查询列表
await crud.get(1) // 查询详情
await crud.create({ name: '张三' }) // 新增
await crud.update({ id: 1, name: '李四' }) // 编辑
await crud.remove(1) // 删除单个
await crud.remove({ ids: [1, 2, 3] }) // 批量删除
```

## 完整示例

```vue
<script setup lang="ts">
  import { usePageCrud } from '@/composables/usePageCrud'

  interface User {
    id: number
    name: string
    email: string
  }

  const crud = usePageCrud<User>({
    list: '/api/user/list',
    get: '/api/user/detail',
    create: '/api/user/create',
    update: '/api/user/update',
    remove: '/api/user/delete',
  })

  onMounted(() => crud.fetch())
</script>

<template>
  <n-card>
    <!-- 搜索栏 -->
    <n-space>
      <n-input
        v-model:value="crud.query.keyword"
        placeholder="搜索"
      />
      <n-button @click="crud.fetch()">搜索</n-button>
      <n-button @click="crud.reset()">重置</n-button>
    </n-space>

    <!-- 表格 -->
    <n-data-table
      :loading="crud.loading"
      :data="crud.items"
      :columns="[
        { key: 'name', title: '姓名' },
        { key: 'email', title: '邮箱' },
        {
          key: 'actions',
          title: '操作',
          render: row => [
            h(NButton, { onClick: () => crud.update(row) }, '编辑'),
            h(NButton, { onClick: () => crud.remove(row.id) }, '删除'),
          ],
        },
      ]"
    />

    <!-- 分页 -->
    <n-pagination
      v-model:page="crud.page.current"
      v-model:page-size="crud.page.size"
      :item-count="crud.total"
      @update:page="crud.fetch()"
      @update:page-size="crud.fetch()"
    />
  </n-card>
</template>
```

## 常用配置

### 自定义业务操作

```typescript
const crud = usePageCrud({
  list: '/api/user/list',
  create: '/api/user/create',
  update: '/api/user/update',
  remove: '/api/user/delete',
  // ✨ 扩展自定义业务操作
  actions: {
    approve: '/api/user/approve', // 审批
    reject: '/api/user/reject', // 拒绝
    enable: '/api/user/enable', // 启用/禁用
    resetPassword: '/api/user/reset-password', // 重置密码
    sendEmail: '/api/user/send-email', // 发送邮件
  },
})

// 使用自定义操作（自动显示消息、错误处理）
await crud.actions.approve({ id: 1, reason: '符合条件' })
await crud.actions.resetPassword({ id: 1, password: 'new123' })

// 通用 action 方法（临时性操作，不需要预定义）
await crud.action('POST', '/api/user/export', { format: 'excel' })
await crud.action('GET', '/api/user/stats')
```

### 配置操作行为

```typescript
const crud = usePageCrud(
  {
    list: '/api/user/list',
    actions: {
      approve: '/api/user/approve',
    },
  },
  {
    // 自定义操作的配置
    actionOptions: {
      approve: {
        method: 'post',
        autoRefresh: true, // 操作后自动刷新列表
        successMessage: '审批成功',
        errorMessage: '审批失败',
      },
    },
  }
)
```

### 预设模式

```typescript
// RESTful 风格
{
  preset: 'restful'
} // ID 在路径中，自动处理

// 静默模式
{
  preset: 'silent'
} // 无消息提示

// 手动刷新
{
  preset: 'manual'
} // 操作后不自动刷新
{
  preset: 'manual'
} // 操作后不自动刷新
```

### 自定义响应格式

```typescript
const crud = usePageCrud(api, {
  // 后端返回格式：{ code, data: { records, total } }
  mapListResult: res => ({
    items: res.data?.records || [],
    total: res.data?.total || 0,
  }),
})
```

### 参数处理

```typescript
const crud = usePageCrud(api, {
  // 请求前转换参数
  beforeFetch: params => {
    if (params.dateRange) {
      const [start, end] = params.dateRange
      return { ...params, startDate: start, endDate: end }
    }
    return params
  },
})
```

### 条件刷新

```typescript
const crud = usePageCrud(api, {
  autoRefresh: {
    onCreate: true, // 新增后刷新
    onUpdate: false, // 编辑后不刷新
    onRemove: true, // 删除后刷新
  },
})
```

### 批量操作

```typescript
const crud = usePageCrud(api, {
  batchOperations: {
    update: true,
    updateEndpoint: '/api/user/batchUpdate',
    export: true,
    exportEndpoint: '/api/user/export',
  },
})

// 使用
await crud.batchUpdate?.([{ id: 1, status: 'active' }])
await crud.batchExport?.({ status: 'active' })
```

## 返回值

```typescript
const crud = usePageCrud(api)

// 状态
crud.items // ShallowRef<Row[]> - 列表数据
crud.total // Ref<number> - 总数
crud.loading // Ref<boolean> - 加载状态
crud.query // Partial<Query> - 查询参数
crud.page // { current: number; size: number } - 分页信息

// CRUD 方法
crud.fetch() // 查询列表
crud.refresh() // 刷新当前页
crud.reset() // 重置查询条件并刷新
crud.get(id) // 获取详情
crud.create(data) // 新增
crud.update(data) // 编辑
crud.remove(id) // 删除单个
crud.remove({ ids }) // 批量删除

// ✨ 自定义业务操作
crud.actions.approve(data) // 预定义的业务操作
crud.actions.reject(data)
crud.actions.enable(data)
// ...

// ✨ 通用操作方法
crud.action('POST', '/api/xxx', data) // 临时性操作
```

## 对比传统方式

| 指标     | 传统方式 | usePageCrud |
| -------- | -------- | ----------- |
| 代码量   | ~150 行  | ~30 行      |
| 状态管理 | 手动     | ✅ 自动     |
| 加载状态 | 手动     | ✅ 自动     |
| 错误处理 | 手动     | ✅ 内置     |
| 消息通知 | 手动     | ✅ 自动     |
| 类型安全 | 部分     | ✅ 完整     |

**传统方式（~150 行）：**

```typescript
const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ keyword: '' })
const page = reactive({ current: 1, size: 10 })

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getUserList({ ...query, ...page })
    list.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = async data => {
  loading.value = true
  try {
    await createUser(data)
    message.success('新增成功')
    await fetchList()
  } catch (e) {
    message.error('新增失败')
  } finally {
    loading.value = false
  }
}
// ... 更多代码
```

**usePageCrud（~30 行）：**

```typescript
const crud = usePageCrud<User>({
  list: '/api/user/list',
  create: '/api/user/create',
  update: '/api/user/update',
  remove: '/api/user/delete',
  actions: {
    approve: '/api/user/approve',
    reject: '/api/user/reject',
  },
})

onMounted(() => crud.fetch())
```

## 实际使用场景

### 场景1：用户审批管理

```typescript
const crud = usePageCrud<User>(
  {
    list: '/api/user/list',
    create: '/api/user/create',
    update: '/api/user/update',
    remove: '/api/user/delete',
    actions: {
      approve: '/api/user/approve', // 审批通过
      reject: '/api/user/reject', // 审批拒绝
      enable: '/api/user/enable', // 启用账号
      disable: '/api/user/disable', // 禁用账号
      resetPassword: '/api/user/reset-password',
    },
  },
  {
    actionOptions: {
      approve: {
        autoRefresh: true,
        successMessage: '审批成功',
      },
      reject: {
        autoRefresh: true,
        successMessage: '已拒绝',
      },
    },
  }
)

// 使用
const handleApprove = (id: number) => {
  dialog.confirm({
    title: '确认审批',
    content: '确认通过该用户的申请吗？',
    onOk: () => crud.actions.approve({ id, approver: currentUser.id }),
  })
}

const handleReject = (id: number) => {
  dialog.confirm({
    title: '拒绝申请',
    content: '请输入拒绝理由',
    onOk: reason => crud.actions.reject({ id, reason }),
  })
}
```

### 场景2：商品上下架

```typescript
const crud = usePageCrud<Product>({
  list: '/api/product/list',
  update: '/api/product/update',
  actions: {
    publish: '/api/product/publish', // 上架
    unpublish: '/api/product/unpublish', // 下架
    setTop: '/api/product/set-top', // 置顶
    cancelTop: '/api/product/cancel-top', // 取消置顶
  },
})

// 批量上架
const handleBatchPublish = (ids: number[]) => {
  crud.actions.publish({ ids })
}
```

### 场景3：订单处理流程

```typescript
const crud = usePageCrud<Order>(
  {
    list: '/api/order/list',
    actions: {
      pay: '/api/order/pay', // 支付
      cancel: '/api/order/cancel', // 取消
      ship: '/api/order/ship', // 发货
      complete: '/api/order/complete', // 完成
      refund: '/api/order/refund', // 退款
    },
  },
  {
    actionOptions: {
      ship: {
        autoRefresh: true,
        successMessage: '发货成功',
      },
      refund: {
        autoRefresh: true,
        successMessage: '已退款',
        errorMessage: '退款失败，请重试',
      },
    },
  }
)

// 发货
const handleShip = (id: number, trackingNo: string) => {
  crud.actions.ship({ id, trackingNo })
}
```

### 场景4：通用操作（不需要预定义）

```typescript
const crud = usePageCrud<User>({
  list: '/api/user/list',
  update: '/api/user/update',
})

// 临时性操作，使用通用 action 方法
const handleSendEmail = async (userId: number) => {
  await crud.action('POST', '/api/user/send-email', {
    userId,
    subject: '欢迎加入',
    content: '...',
  })
}

// 获取统计数据
const stats = await crud.action('GET', '/api/user/stats')

// 导出数据
await crud.action('POST', '/api/user/export', {
  format: 'excel',
  filters: crud.query,
})
```

## 最佳实践

### ✅ 配置集中管理

```typescript
// api/user.ts
export const USER_API = {
  list: '/api/user/list',
  get: '/api/user/detail',
  create: '/api/user/create',
  update: '/api/user/update',
  remove: '/api/user/delete',
  // ✨ 业务操作也集中配置
  actions: {
    approve: '/api/user/approve',
    reject: '/api/user/reject',
    enable: '/api/user/enable',
    disable: '/api/user/disable',
    resetPassword: '/api/user/reset-password',
  },
} as const

// pages/user.vue
import { USER_API } from '@/api/user'
const crud = usePageCrud<User>(USER_API)

// 使用
await crud.actions.approve({ id: 1 })
```

### ✅ 选择合适的方式

**1. 常用业务操作 → 使用 `actions` 配置**

```typescript
// ✅ 这些操作是业务常态，应该配置在 actions 中
const crud = usePageCrud({
  list: '/api/user/list',
  actions: {
    approve: '/api/user/approve', // ✅ 常用
    reject: '/api/user/reject', // ✅ 常用
    enable: '/api/user/enable', // ✅ 常用
    resetPassword: '/api/user/reset', // ✅ 常用
  },
})
```

**2. 临时性操作 → 使用 `action` 方法**

```typescript
// ✅ 偶尔用一次的操作，不需要预定义
await crud.action('POST', '/api/user/send-welcome-email', { id: 1 })
await crud.action('GET', '/api/user/export-report')
```

**3. 复杂业务逻辑 → 封装独立函数**

```typescript
// ✅ 复杂的多步骤操作，封装成独立函数
async function handleCompleteOrder(orderId: number) {
  // 1. 检查库存
  const stock = await crud.action('GET', `/api/order/${orderId}/check-stock`)
  if (!stock.available) {
    message.error('库存不足')
    return
  }

  // 2. 支付
  await crud.actions.pay({ id: orderId })

  // 3. 发货
  await crud.actions.ship({ id: orderId })

  // 4. 刷新列表
  await crud.refresh()
}
```

### ✅ 类型定义优先

```typescript
interface User {
  id: number
  name: string
  email: string
}

interface UserQuery {
  keyword?: string
  status?: 'active' | 'inactive'
}

const crud = usePageCrud<User, UserQuery>(api)
```

### ✅ 封装可复用逻辑

```typescript
// composables/useUserManagement.ts
export function useUserManagement() {
  const crud = usePageCrud<User>(USER_API)

  const handleStatusToggle = async (id: number, status: string) => {
    await crud.update({ id, status })
  }

  return { ...crud, handleStatusToggle }
}
```

### ❌ 避免的做法

```typescript
// ❌ API 路径硬编码在组件中
const crud = usePageCrud({
  list: '/api/user/list',
  // ...
})

// ❌ 缺少类型定义
const crud = usePageCrud(api)

// ❌ 频繁调用 fetch（应使用防抖）
<input @input="crud.fetch()" />

// ❌ 手动管理 loading（已内置）
const loading = ref(false)
```

## 常见问题

**Q: 如何处理非标准响应格式？**

```typescript
const crud = usePageCrud(api, {
  mapListResult: res => ({
    items: res.data?.records || [],
    total: res.data?.total || 0,
  }),
})
```

**Q: 如何在删除前确认？**

```typescript
const handleDelete = (id: number) => {
  dialog.warning({
    content: '确认删除吗？',
    onPositiveClick: () => crud.remove(id),
  })
}
```

**Q: 如何支持搜索防抖？**

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedFetch = useDebounceFn(() => crud.fetch(), 500)
```

**Q: 如何自定义消息通知？**

```typescript
const crud = usePageCrud(api, {
  notifier: {
    success: msg => ElMessage.success(msg),
    error: msg => ElMessage.error(msg),
  },
})
```

**Q: 如何配置全局默认值？**

```typescript
import { configureCrud } from '@/composables/usePageCrud'

configureCrud({
  defaultPage: { current: 1, size: 20 },
  autoRefresh: true,
})
```
