# C_ActionBar 迁移检查清单

> 快速参考手册 - 在重构前使用此清单确认可行性

---

## 📋 重构前检查

### ✅ 适合使用 C_ActionBar 的特征

- [ ] 有 **2个或更多** 操作按钮
- [ ] 按钮需要 **左右分组** 或 **居中对齐**
- [ ] 需要统一管理按钮 **loading/disabled** 状态
- [ ] 存在 **下拉菜单** 按钮需求
- [ ] 需要 **响应式布局** 适配移动端
- [ ] 按钮配置相似度高（图标+文字+事件）

### ⚠️ 需要谨慎评估的情况

- [ ] 使用了 `NButtonGroup`（按钮连接在一起）
- [ ] 按钮有特殊的 **自定义样式**
- [ ] 按钮内嵌在复杂的 **Grid/Flex 布局**中
- [ ] 搜索栏中只有 **1-2个** 简单按钮

### ❌ 不建议使用的情况

- [ ] **单个独立按钮**（无需组件化）
- [ ] 按钮需要 **特殊的交互动画**
- [ ] 与第三方库的 **深度集成**（可能冲突）

---

## 🔄 迁移步骤

### 第一步：准备工作

- [ ] 阅读 [C_ActionBar README](../src/components/global/C_ActionBar/README.md)
- [ ] 查看 [演示页面](../src/views/demo/13-action-bar/index.vue)
- [ ] 确认 TypeScript 类型已导入

```typescript
import type { ActionItem } from '@/types/modules/action-bar'
```

---

### 第二步：定义 actions 配置

- [ ] 创建 `computed` 响应式配置
- [ ] 使用清晰的命名（`toolbarActions` / `modalActions`）
- [ ] 按钮添加 `key` 属性（便于调试）

```typescript
const toolbarActions = computed<ActionItem[]>(() => [
  {
    key: 'add',
    label: '新增',
    icon: 'mdi:plus-circle',
    type: 'primary',
    onClick: handleAdd,
  },
  // ...
])
```

---

### 第三步：替换模板代码

- [ ] 删除原有 `NSpace + NButton` 代码
- [ ] 添加 `<C_ActionBar>` 组件
- [ ] 配置对齐方式（如需要）

```vue
<!-- 替换前 -->
<NSpace>
  <NButton type="primary">新增</NButton>
  <NButton>刷新</NButton>
</NSpace>

<!-- 替换后 -->
<C_ActionBar :actions="toolbarActions" />
```

---

### 第四步：测试验证

- [ ] 按钮点击事件正常触发
- [ ] loading/disabled 状态正确响应
- [ ] 下拉菜单（如有）正常工作
- [ ] 移动端布局正常显示
- [ ] 暗黑模式样式正常

---

## 🎯 常见场景速查

### 1. 表格工具栏

```typescript
const toolbarActions = computed<ActionItem[]>(() => [
  {
    key: 'add',
    label: '新增',
    icon: 'mdi:plus',
    type: 'primary',
    group: 'left',
  },
  { key: 'refresh', label: '刷新', icon: 'mdi:refresh', group: 'right' },
])
```

```vue
<C_ActionBar :actions="toolbarActions" />
```

---

### 2. 对话框底部

```typescript
const modalActions = computed<ActionItem[]>(() => [
  { key: 'cancel', label: '取消', onClick: handleCancel },
  {
    key: 'submit',
    label: '提交',
    type: 'primary',
    loading: submitting,
    onClick: handleSubmit,
  },
])
```

```vue
<NModal>
  <template #footer>
    <C_ActionBar :actions="modalActions" :config="{ align: 'right' }" />
  </template>
</NModal>
```

---

### 3. 表单提交区

```typescript
const formActions = computed<ActionItem[]>(() => [
  { key: 'reset', label: '重置', icon: 'mdi:refresh', onClick: handleReset },
  {
    key: 'submit',
    label: '提交',
    icon: 'mdi:check',
    type: 'primary',
    onClick: handleSubmit,
  },
])
```

```vue
<C_ActionBar :actions="formActions" :config="{ align: 'center' }" />
```

---

### 4. 左右分组 + 中间插槽

```typescript
const leftActions = [...]
const rightActions = [...]
```

```vue
<C_ActionBar :left-actions="leftActions" :right-actions="rightActions">
  <template #center>
    <NTag>已选 {{ count }} 条</NTag>
  </template>
</C_ActionBar>
```

---

## 🐛 常见问题

### Q1: 按钮不显示？

**检查**:

- [ ] `actions` 数组是否为空
- [ ] `show` 属性是否为 `false`
- [ ] 是否正确使用 `leftActions` / `rightActions`

---

### Q2: 状态不响应？

**检查**:

- [ ] 是否使用了 `computed` 而非普通数组
- [ ] `loading`/`disabled` 是否为响应式 ref

```typescript
// ✅ 正确
const actions = computed(() => [{ label: '提交', disabled: !isValid.value }])

// ❌ 错误
const actions = [{ label: '提交', disabled: !isValid.value }]
```

---

### Q3: 对齐方式不生效？

**检查**:

- [ ] 是否设置了 `config.align`
- [ ] 是否同时使用了 `leftActions` 和 `rightActions`（会覆盖 align）

```vue
<!-- 单侧按钮才会应用 align -->
<C_ActionBar :actions="actions" :config="{ align: 'center' }" />

<!-- 左右分组忽略 align，始终 space-between -->
<C_ActionBar :left-actions="left" :right-actions="right" />
```

---

## ✅ 迁移完成确认

- [ ] 所有按钮功能正常
- [ ] 代码行数减少
- [ ] 无 TypeScript 错误
- [ ] 无编译警告
- [ ] 通过 code review
- [ ] 更新相关文档

---

## 📚 参考资源

- [完整 README](../src/components/global/C_ActionBar/README.md)
- [演示页面](../src/views/demo/13-action-bar/index.vue)
- [类型定义](../src/types/modules/action-bar.d.ts)
- [重构分析文档](./C_ActionBar-重构分析.md)

---

**💡 提示**: 不确定是否适合替换？先在演示页面尝试你的场景！
