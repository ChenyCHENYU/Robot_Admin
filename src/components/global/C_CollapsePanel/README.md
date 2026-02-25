---
outline: 'deep'
---

# C_CollapsePanel 折叠面板

> 📂 零依赖的增强型折叠面板组件，支持三种样式变体、手风琴模式、懒渲染、状态持久化和编程控制

## 🚀 特性

- **🎨 三种变体**: `default`（分割线）/ `card`（卡片）/ `ghost`（无边框极简）覆盖不同 UI 场景
- **🪗 手风琴模式**: 同时只展开一个面板，适合 FAQ、步骤引导等场景
- **⚡ 懒渲染**: 面板首次展开才渲染内容 DOM，优化长列表性能
- **🗑️ 折叠销毁**: 面板折叠后可自动销毁 DOM，适合重型内容
- **💾 状态持久化**: 传入 `persistKey` 即可将展开状态保存到 localStorage
- **🎯 Extra 插槽**: 面板头部右侧支持自定义操作按钮（编辑/删除/标签等）
- **🔧 编程控制**: `expandAll` / `collapseAll` / `toggle` / `scrollToPanel` 等 expose 方法
- **↔️ 箭头位置**: 展开图标可放左侧或右侧
- **♿ 无障碍**: `role="button"` + `aria-expanded` + `aria-controls` + 键盘 Enter/Space
- **💪 TypeScript**: 完整类型定义，`CollapsePanelItem`、`CollapsePanelExpose` 等均有类型保障
- **📦 零依赖**: 纯逻辑实现，无任何外部依赖

## 📦 安装

无需安装额外依赖，组件已全局注册。

## 🎯 快速开始

### 最简用法

```vue {3-15}
<template>
  <C_CollapsePanel
    :items="[
      { key: 'info', title: '基本信息', icon: 'mdi:information-outline' },
      { key: 'detail', title: '详细设置', icon: 'mdi:cog-outline' },
    ]"
    :default-active-keys="['info']"
  >
    <template #panel-info>
      <p>这是基本信息内容</p>
    </template>
    <template #panel-detail>
      <p>这是详细设置内容</p>
    </template>
  </C_CollapsePanel>
</template>

<script setup>
  // 无需导入，已全局注册
</script>
```

> [!TIP]
> 面板内容通过 `#panel-{key}` 动态插槽提供，`key` 对应 `items` 数组中的 `key` 字段。

### 与 NCollapse 的区别

| 能力                    | NCollapse | C_CollapsePanel |
| ----------------------- | :-------: | :-------------: |
| 基础折叠/展开           |    ✅     |       ✅        |
| 手风琴模式              |    ✅     |       ✅        |
| 卡片/幽灵变体           |    ❌     |       ✅        |
| 头部 Extra 操作插槽     |    ❌     |       ✅        |
| 懒渲染                  |    ❌     |       ✅        |
| 折叠后销毁 DOM          |    ❌     |       ✅        |
| 展开状态持久化          |    ❌     |       ✅        |
| expandAll / collapseAll |    ❌     |       ✅        |
| scrollToPanel           |    ❌     |       ✅        |
| 箭头位置可配            |    ❌     |       ✅        |

::: details 🎨 三种变体一览

```vue
<template>
  <div>
    <!-- 默认：分割线风格 -->
    <C_CollapsePanel
      :items="items"
      variant="default"
    />

    <!-- 卡片：每个面板独立卡片 -->
    <C_CollapsePanel
      :items="items"
      variant="card"
    />

    <!-- 幽灵：无边框极简 -->
    <C_CollapsePanel
      :items="items"
      variant="ghost"
      :bordered="false"
    />
  </div>
</template>
```

:::

::: details 🪗 手风琴 + FAQ 场景

```vue {4}
<template>
  <C_CollapsePanel
    :items="faqItems"
    :accordion="true"
  >
    <template #panel-q1>
      <p>Vue 3 的 Composition API 提供了更灵活的逻辑复用...</p>
    </template>
    <template #panel-q2>
      <p>Pinia 比 Vuex 更轻量，API 更简洁...</p>
    </template>
  </C_CollapsePanel>
</template>

<script setup>
  const faqItems = [
    {
      key: 'q1',
      title: 'Composition API 有什么优势？',
      icon: 'mdi:help-circle',
    },
    { key: 'q2', title: 'Pinia 和 Vuex 区别？', icon: 'mdi:help-circle' },
  ]
</script>
```

:::

::: details 🎛️ Extra 操作 + 编程控制

```vue {5,9-16,24-32}
<template>
  <div>
    <div class="controls">
      <button @click="ref?.expandAll()">全部展开</button>
      <button @click="ref?.collapseAll()">全部折叠</button>
      <button @click="ref?.toggle('config')">切换「配置」</button>
    </div>

    <C_CollapsePanel
      ref="ref"
      :items="items"
      expand-icon-position="right"
      variant="card"
    >
      <!-- 头部右侧操作按钮 -->
      <template #extra-config>
        <n-button
          size="small"
          @click="handleEdit"
          >编辑</n-button
        >
      </template>
      <template #panel-config>
        <p>配置内容...</p>
      </template>
    </C_CollapsePanel>
  </div>
</template>

<script setup>
  const ref = ref()
  const items = [
    { key: 'config', title: '系统配置', icon: 'mdi:cog' },
    { key: 'logs', title: '操作日志', icon: 'mdi:history' },
  ]
</script>
```

:::

::: details ⚡ 懒渲染 + 持久化

```vue {4-5,8}
<template>
  <C_CollapsePanel
    :items="[
      { key: 'normal', title: '普通面板' },
      { key: 'lazy', title: '懒加载面板', lazy: true },
      { key: 'destroy', title: '折叠销毁', destroyOnCollapse: true },
    ]"
    persist-key="my-page-collapse"
  >
    <template #panel-normal>立即渲染</template>
    <template #panel-lazy>首次展开才渲染</template>
    <template #panel-destroy>折叠后 DOM 自动销毁</template>
  </C_CollapsePanel>
</template>
```

> `lazy: true` — 内容首次展开后渲染，之后折叠不销毁（缓存）
> `destroyOnCollapse: true` — 每次折叠都销毁 DOM，重新展开重新渲染

:::

## 📋 API

### Props

| 属性                 | 类型                             | 默认值      | 说明                        |
| -------------------- | -------------------------------- | ----------- | --------------------------- |
| `items`              | `CollapsePanelItem[]`            | —           | **必填**，面板项配置数组    |
| `activeKeys`         | `string[]`                       | —           | 当前展开面板 key（v-model） |
| `defaultActiveKeys`  | `string[]`                       | `[]`        | 默认展开的面板 key          |
| `accordion`          | `boolean`                        | `false`     | 手风琴模式                  |
| `variant`            | `'default' \| 'card' \| 'ghost'` | `'default'` | 样式变体                    |
| `expandIconPosition` | `'left' \| 'right'`              | `'left'`    | 展开图标位置                |
| `bordered`           | `boolean`                        | `true`      | 是否显示边框                |
| `persistKey`         | `string`                         | —           | localStorage 持久化 key     |

### CollapsePanelItem

| 属性                | 类型      | 默认值  | 说明                         |
| ------------------- | --------- | ------- | ---------------------------- |
| `key`               | `string`  | —       | **必填**，面板唯一标识       |
| `title`             | `string`  | —       | **必填**，面板标题           |
| `subtitle`          | `string`  | —       | 副标题（标题右侧灰色文字）   |
| `icon`              | `string`  | —       | Iconify 图标名               |
| `disabled`          | `boolean` | `false` | 是否禁用                     |
| `lazy`              | `boolean` | `false` | 懒渲染（首次展开才创建 DOM） |
| `destroyOnCollapse` | `boolean` | `false` | 折叠后销毁 DOM               |

### Events

| 事件                | 参数                     | 说明                         |
| ------------------- | ------------------------ | ---------------------------- |
| `update:activeKeys` | `(keys: string[])`       | 展开面板变化（支持 v-model） |
| `expand`            | `(key: string)`          | 单个面板展开                 |
| `collapse`          | `(key: string)`          | 单个面板折叠                 |
| `change`            | `(activeKeys: string[])` | 任意变化                     |

### Slots

| 插槽            | 参数                 | 说明           |
| --------------- | -------------------- | -------------- |
| `#panel-{key}`  | `{ item, expanded }` | 面板内容       |
| `#header-{key}` | `{ item, expanded }` | 自定义面板头部 |
| `#extra-{key}`  | `{ item, expanded }` | 头部右侧操作区 |

### Expose 方法

| 方法            | 类型                    | 说明                    |
| --------------- | ----------------------- | ----------------------- |
| `expandAll`     | `() => void`            | 展开所有面板            |
| `collapseAll`   | `() => void`            | 折叠所有面板            |
| `toggle`        | `(key: string) => void` | 切换指定面板            |
| `getActiveKeys` | `() => string[]`        | 获取当前展开的 key 数组 |
| `scrollToPanel` | `(key: string) => void` | 滚动到指定面板          |

### 类型定义

```typescript
/** 面板样式变体 */
type CollapsePanelVariant = 'default' | 'card' | 'ghost'

/** 展开图标位置 */
type ExpandIconPosition = 'left' | 'right'

/** 面板项配置 */
interface CollapsePanelItem {
  key: string
  title: string
  subtitle?: string
  icon?: string
  disabled?: boolean
  lazy?: boolean
  destroyOnCollapse?: boolean
}
```

## ⌨️ 键盘快捷键

| 按键              | 说明                |
| ----------------- | ------------------- |
| `Tab`             | 在面板头部之间导航  |
| `Enter` / `Space` | 展开/折叠聚焦的面板 |

## 🔧 常见问题

::: details ❌ 面板内容闪烁 / 动画不流畅

折叠动画通过 JS 动态设置 `height` 实现。如果面板内容有异步加载（图片/懒组件），内容高度在展开瞬间可能不准确。

解决方案：给面板内容设置 `min-height` 或使用骨架屏占位。

:::

::: details ❌ 持久化状态与实际 items 不一致

如果 `persistKey` 保存了旧的 key 但 `items` 已更新（删除了某些面板），组件会自动忽略不存在的 key，无需手动清理。

:::

::: details ❌ 手风琴模式下 expandAll 无效

这是预期行为。手风琴模式下 `expandAll()` 被忽略，因为语义上互斥。

:::

## 🔄 未来规划

- [ ] 面板拖拽排序
- [ ] 嵌套折叠（缩进层级）
- [ ] 动画方向选项（slide / fade / none）
- [ ] 面板分组功能
- [ ] 虚拟滚动（超大量面板场景）

## 📚 相关资源

- [类型定义](../../types/modules/collapse-panel.d.ts)
- [useCollapsePanel 组合函数](../../composables/CollapsePanel/useCollapsePanel.ts)
- [演示页面源码](../../views/demo/44-collapse-panel/index.vue)

<!--@include: ./snippets/contribute.md -->
