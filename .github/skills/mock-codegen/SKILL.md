---
name: mock-codegen
description: 'Use when: generating mock data for development without a backend. Optional skill - activated when user confirms or explicitly requests it. Triggers on: 生成mock, mock数据, 模拟数据, mock生成, 前端mock, 联调前mock.'
---

# Skill: Mock 数据生成（mock-codegen）

> **⚡ 可选技能** — 默认不在标准工作流中强制执行。
>
> 触发方式：
>
> - 执行完整流程时（prototype-scan → api-contract → page-codegen），AI 会在最后询问：**"是否需要生成 Mock 数据以便在联调前使用？"**
> - 用户明确说"帮我生成 mock 数据"时直接执行

---

## 触发

- 用户显式请求 Mock 数据生成
- 执行完整代码生成流程结束时，由 AI 确认后执行
- 接收 page-spec JSON 作为输入（来自 prototype-scan）

---

## Robot Admin Mock 约定

本项目采用**轻量级内联 Mock 模式**：

- Mock 数据直接写在 `data.ts` 中，以函数或常量导出
- `useTableCrud` 支持传入本地数据数组代替真实 API 调用
- 不依赖 MSW / axios-mock-adapter 等重量级 mock 框架
- 通过环境变量 `VITE_APP_ENV=development` 判断是否启用

---

## 步骤

### 1. 确认是否需要 Mock

在完整流程末尾，AI 询问：

```
✅ 页面代码已生成完成。

是否需要生成 Mock 数据（开发联调前使用）？
- 输入 Y / 是 → 生成 Mock 并注入 data.ts
- 输入 N / 否 → 跳过，等后端接口就绪后对接
```

### 2. 根据 page-spec 推导字段类型

从 `page-spec.columns` + `page-spec.form` 推导每个字段的 mock 策略：

| 字段类型/名称特征               | Mock 策略                              |
| ------------------------------- | -------------------------------------- |
| `id` / `*Id`                    | `Date.now() + index` 或递增数字        |
| `name` / `*Name`                | 中文姓名候选数组随机取                 |
| `status`                        | 从 page-spec tagMap 的 key 中随机取    |
| `date` / `*Time` / `createTime` | `new Date().toISOString()` ± 随机天数  |
| `phone` / `mobile`              | `1${['3','5','7','8'][r]}${随机9位数}` |
| `email`                         | `user${i}@example.com`                 |
| `amount` / `price` / `*Fee`     | `Math.floor(Math.random() * 10000)`    |
| `count` / `num` / `qty`         | `Math.floor(Math.random() * 100)`      |
| `type` / `category`             | 从 options 配置中随机取 value          |
| `remark` / `desc` / `note`      | 候选文本数组随机取                     |
| `boolean` / `enabled`           | `Math.random() > 0.5`                  |

### 3. 生成 getMockList 函数

在 `data.ts` 中追加以下代码（放在文件末尾，用区块注释隔开）：

```typescript
// ================= Mock 数据（联调前使用，对接真实接口后可删除）=================

/**
 * * @description: 生成{{资源名}}模拟数据列表
 * ? @param {number} count 生成条数，默认 30
 * ! @return {ResourceItem[]} 模拟数据数组
 */
export const getMockList = (count = 30): {{ResourceItem}}[] => {
  // 候选数据池
  const names = ['张三', '李四', '王五', '赵六', '陈七', '周八', '吴九', '郑十']
  const depts = ['技术部', '市场部', '运营部', '财务部', '人事部']

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    // ... 根据 page-spec 字段自动生成（每个字段对应上表策略）
    createTime: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toLocaleString(),
    updateTime: new Date().toLocaleString(),
  }))
}

/**
 * * @description: 生成分页 Mock 响应（模拟后端响应结构）
 * ? @param {number} page 当前页
 * ? @param {number} pageSize 每页条数
 * ! @return {object} 分页响应对象
 */
export const getMockPageResult = (page = 1, pageSize = 20) => {
  const allData = getMockList(100)
  const start = (page - 1) * pageSize
  return {
    list: allData.slice(start, start + pageSize),
    total: allData.length,
    page,
    pageSize,
  }
}
```

### 4. 注入 useTableCrud（可选）

如果页面使用了 `useTableCrud`，可以将 Mock 数据注入，替代真实 API 调用：

```typescript
// 在 index.vue 中修改 tableCrud 配置（对接真实接口时删除 localData）
const tableCrud = useTableCrud({
  api: {
    list: '/<domain>/<resource>',
    // ... 其余 API 配置
  },
  // ⚠️ 开发 Mock 模式：注释掉 api 中的 list，使用本地数据
  // localData: getMockList(50),   // 切换为真实 API 时删除此行
  columns: getTableColumns(),
  pagination: { pageSize: 20 },
})
```

> **提示**：`localData` 字段需 `@robot-admin/request-core` 支持。若不支持，可直接在 `onMounted` 中将 `getMockList()` 赋值给 data ref。

### 5. 简单赋值模式（最保险）

若 `useTableCrud` 不支持 `localData`，直接在 `onMounted` 赋值：

```typescript
// index.vue 中
const tableData = ref<ResourceItem[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    // 开发 Mock 模式 —— 对接真实接口时替换为 API 调用
    // const res = await getResourceListApi({ page: 1, pageSize: 20 })
    // tableData.value = res.data.list
    tableData.value = getMockList(30) // 开发 Mock 用
  } finally {
    loading.value = false
  }
})
```

---

## 输出文件

| 文件                                  | 操作                                     |
| ------------------------------------- | ---------------------------------------- |
| `src/views/<domain>/<name>/data.ts`   | 追加 `getMockList` + `getMockPageResult` |
| `src/views/<domain>/<name>/index.vue` | 可选：修改 onMounted 注入 mock 数据      |

---

## 注意事项

1. **Mock 代码加注释**：所有 Mock 代码块前后加 `// ===== Mock 数据 =====` 注释，便于对接真实接口时批量删除
2. **不影响生产**：Mock 代码仅在开发时使用，不影响生产构建
3. **字段名必须一致**：Mock 数据的字段名必须与 `getTableColumns()` 中的 `key` 完全一致
4. **状态字段取合法值**：`status` 等字段的值必须来自 `STATUS_TAG_CONFIG` 的 key，否则渲染会出现空白
5. **数量建议 20-50 条**：足够测试分页逻辑，不超过内存限制
