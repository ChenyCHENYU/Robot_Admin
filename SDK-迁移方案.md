## 方案对比

### 方案 1: 保留中间层 (当前状态)

**src/api/10-table.ts (保留):**

```typescript
import { getEmployeesList } from './generated'

export const getEmployeesListApi = (params?: { page?: number }) =>
  getEmployeesList({ query: params })
```

**页面使用 (不需要改):**

```vue
<script setup>
  import { getEmployeesListApi } from '@/api/10-table'

  const { data } = await getEmployeesListApi({ page: 1 })
</script>
```

**特点:**

- ✅ 页面代码完全不用改
- ✅ 渐进式,可以慢慢验证
- ⚠️ 多了一层封装

---

### 方案 2: 直接用 SDK (删除中间层)

**删除 src/api/10-table.ts**

**页面需要改成:**

```vue
<script setup>
  import { getEmployeesList } from '@/api/generated'

  // ❌ 旧的调用方式
  const { data } = await getEmployeesListApi({ page: 1 })

  // ✅ 新的调用方式
  const { data } = await getEmployeesList({
    query: { page: 1, pageSize: 10 },
  })
</script>
```

**特点:**

- ✅ 更简洁,少一层
- ✅ 更好的类型提示
- ❌ 需要改所有引用的页面 (约 10+ 处)

---

## 我的建议

**当前阶段: 保留 10-table.ts**

为什么?

1. 您刚开始用 SDK,先验证效果
2. 不影响现有功能
3. 以后想删除也很容易

**未来可选: 逐步迁移到直接用 SDK**

等验证 SDK 稳定后,新页面直接用 SDK:

```typescript
// 新页面
import { getEmployeesList } from '@/api/generated'

// 旧页面保持不变
import { getEmployeesListApi } from '@/api/10-table'
```

慢慢地,旧页面也改成 SDK,最后再删 10-table.ts
