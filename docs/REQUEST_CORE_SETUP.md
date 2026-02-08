# Request Core 插件集成指南

## ✅ 已完成配置

### 1. 插件已安装

```bash
# 本地链接已创建
bun link @robot-admin/request-core
```

### 2. 插件已集成到项目

- ✅ 创建插件文件：[src/plugins/request-core.ts](../src/plugins/request-core.ts)
- ✅ 导出插件：[src/plugins/index.ts](../src/plugins/index.ts)
- ✅ 在 main.ts 中启用：[src/main.ts](../src/main.ts)

## 🚀 使用方式

### 方式 1：使用原有的 axios 实例（兼容）

你的项目中原有的 `axios/request.ts` 仍然可以正常使用：

```ts
import { getData, postData } from '@/axios/request'

// 原有方式不变
const data = await getData('/api/users')
```

### 方式 2：使用新的 @robot-admin/request-core 包

```ts
import { getData, postData } from '@robot-admin/request-core'

// 新包的用法（完全兼容）
const data = await getData('/api/users')

// 支持插件配置
const data = await getData('/api/users', {
  cache: { enabled: true, ttl: 300000 },
  retry: { enabled: true, count: 3 },
})
```

### 方式 3：使用 useTableCrud（推荐）

在任意页面组件中使用：

```vue
<script setup lang="ts">
  import { useTableCrud } from '@robot-admin/request-core'

  interface Employee {
    id: number
    name: string
    age: number
    department: string
  }

  const table = useTableCrud<Employee>({
    api: {
      list: '/api/employees/list',
      get: '/api/employees/:id',
      update: '/api/employees/:id',
      remove: '/api/employees/:id',
      create: '/api/employees',
    },
    columns: [
      { key: 'id', title: 'ID', width: 80 },
      { key: 'name', title: '姓名', width: 120 },
      { key: 'age', title: '年龄', width: 80 },
      { key: 'department', title: '部门', width: 150 },
    ],
    customActions: [
      {
        key: 'export',
        label: '导出',
        icon: 'mdi:download',
        handler: (row, ctx) => {
          console.log('导出', row)
          ctx.message.success('导出成功')
        },
      },
    ],
  })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <n-space>
      <n-input
        v-model:value="table.searchKeyword.value"
        placeholder="搜索..."
      />
      <n-button @click="table.search()">搜索</n-button>
      <n-button @click="table.resetSearch()">重置</n-button>
    </n-space>

    <!-- 表格 -->
    <n-data-table
      ref="table.tableRef.value"
      :data="table.data.value"
      :columns="table.columns.value"
      :loading="table.loading.value"
      :pagination="table.pagination"
    />
  </div>
</template>
```

## 📦 Request Core 核心功能

### 1. Axios 封装（7 个内置插件）

- ✅ **cache**: 请求缓存（内存缓存，支持 TTL）
- ✅ **retry**: 请求重试（指数退避）
- ✅ **dedupe**: 请求去重（基于 AbortController）
- ✅ **cancel**: 自动取消（路由切换时）
- ✅ **request**: 通用请求逻辑（reLogin 管理）
- ✅ **response**: 通用响应逻辑（业务码判断）
- ✅ **reLogin**: 重新登录管理（Promise 队列）

### 2. 拦截器配置（已配置）

在 [src/plugins/request-core.ts](../src/plugins/request-core.ts) 中已经配置好：

- ✅ 请求拦截器：自动注入 token
- ✅ 响应拦截器：统一处理业务码
- ✅ 响应错误拦截器：处理 401 重新登录

### 3. useTableCrud Composable

- ✅ 配置驱动的表格 CRUD 解决方案
- ✅ 支持分页、搜索、排序、自定义操作
- ✅ 内置详情查看、编辑、删除等功能

## 🎯 测试建议

### 步骤 1：启动开发服务器

```bash
cd d:/project/Robot_Admin
bun run dev
```

### 步骤 2：选择一个现有页面测试

选择一个使用表格的页面，例如：

- `src/views/sys-manage/user/index.vue`
- `src/views/sys-manage/role/index.vue`

### 步骤 3：替换为 useTableCrud

将原来的 CRUD 逻辑替换为 `useTableCrud`。

### 步骤 4：验证功能

- ✅ 列表加载
- ✅ 分页
- ✅ 搜索
- ✅ 编辑
- ✅ 删除
- ✅ 详情查看

## 💡 注意事项

### 1. 兼容性

- ✅ 完全向后兼容，不影响现有代码
- ✅ 原有的 `@/axios/request` 仍然可用
- ✅ 新旧两种方式可以混用

### 2. 开发模式

如果修改了 `@robot-admin/request-core` 包的代码：

```bash
# 方式 1：重新构建并链接
cd d:/project/robot-admin-request-core
bash scripts/dev-link.sh

# 方式 2：开启 watch 模式
cd d:/project/robot-admin-request-core
bun run dev
```

### 3. 取消链接

如果需要取消本地链接：

```bash
cd d:/project/robot-admin-request-core
bash scripts/dev-unlink.sh
```

## 📚 API 文档

详细 API 文档请查看：

- [Request Core README](../../robot-admin-request-core/README.md)
- [useTableCrud 文档](../../robot-admin-request-core/src/composables/useTableCrud/README.md)

## ✅ 完成清单

- [x] Request Core 包已构建
- [x] 本地链接已创建
- [x] 插件已集成到主项目
- [x] main.ts 已配置
- [x] 类型检查通过
- [x] 可以开始测试

🎉 **一切准备就绪！现在可以启动项目测试了！**
