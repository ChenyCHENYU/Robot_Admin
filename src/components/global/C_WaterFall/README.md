---
outline: 'deep'
---

# C_WaterFall 瀑布流

> 🏞️ 零依赖的瀑布流布局组件，适用于图片库、素材管理、商品展示等场景。贪心算法实现高效布局，支持响应式列数、图片懒加载、无限滚动、骨架屏占位动画、自定义卡片渲染及窗口 resize 自动重排。

## ✨ 特性

- **📐 贪心布局算法** — 每张新卡片放入当前最短列，自动均衡高度差
- **📱 响应式列数** — 基于 ResizeObserver + 断点配置自动计算，也可手动指定固定列数
- **🖼️ 图片懒加载** — 基于浏览器原生 `loading="lazy"` 属性，只加载可视区域图片
- **♾️ 无限滚动** — IntersectionObserver 监听哨兵元素，滚动触底自动加载
- **💀 骨架屏占位** — 首次加载展示随机高度骨架动画，提升感知体验
- **🎨 自定义卡片** — 通过 `#item` 插槽完全控制渲染内容
- **↕️ resize 重排** — 窗口或容器尺寸变化自动触发重新布局
- **🌗 主题适配** — 跟随 Naive UI 亮色 / 暗色主题
- **💪 TypeScript** — 完整的类型定义，所有 Props / Events / Expose 均有类型约束
- **📦 零依赖** — 纯 Vue 3 + CSS 实现，无需安装任何第三方包

## 📦 安装

无需安装任何额外依赖。组件已全局注册，直接在模板中使用 `<C_WaterFall />` 即可。

## 🎯 快速开始

### 基础用法

```vue {3-9,15-26}
<template>
  <C_WaterFall
    :items="items"
    :gap="16"
    infinite
    :loading="loading"
    :no-more="noMore"
    @load-more="handleLoadMore"
    @item-click="handleClick"
  />
</template>

<script setup lang="ts">
  const items = ref<WaterFallItem[]>([
    {
      id: 1,
      src: 'https://picsum.photos/seed/1/640/480',
      width: 640,
      height: 480,
      title: 'Photo 1',
    },
    {
      id: 2,
      src: 'https://picsum.photos/seed/2/640/800',
      width: 640,
      height: 800,
      title: 'Photo 2',
    },
    // ...
  ])

  const loading = ref(false)
  const noMore = ref(false)

  async function handleLoadMore() {
    loading.value = true
    const newItems = await fetchMoreImages()
    items.value.push(...newItems)
    loading.value = false
  }

  function handleClick(item: WaterFallItem, index: number) {
    console.log('点击:', item.title)
  }
</script>
```

::: details 🎨 自定义卡片渲染 — 通过 Slot 完全控制内容

```vue
<template>
  <C_WaterFall
    :items="items"
    :columns="3"
    :gap="16"
  >
    <template #item="{ item, height }">
      <div class="my-card">
        <img
          :src="item.src"
          :style="{ height: `${height}px` }"
        />
        <div class="my-card__info">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <NButton
            text
            type="primary"
            size="tiny"
            >收藏</NButton
          >
        </div>
      </div>
    </template>
  </C_WaterFall>
</template>
```

:::

::: details 📱 固定列数 — 适合移动端商品列表

```vue
<template>
  <!-- 固定 2 列，忽略响应式断点 -->
  <C_WaterFall
    :items="items"
    :columns="2"
    :gap="12"
    :lazy="true"
  />
</template>
```

:::

::: details 🔧 编程控制 — 通过 Expose API 操控组件

```vue
<template>
  <C_WaterFall
    ref="waterfallRef"
    :items="items"
  />
  <NSpace
    :size="8"
    style="margin-top: 12px"
  >
    <NButton
      size="small"
      @click="waterfallRef?.relayout()"
      >强制重排</NButton
    >
    <NButton
      size="small"
      @click="waterfallRef?.scrollToTop()"
      >回到顶部</NButton
    >
    <NButton
      size="small"
      @click="showInfo"
      >查看信息</NButton
    >
  </NSpace>
</template>

<script setup lang="ts">
  const waterfallRef = ref<WaterFallExpose>()

  function showInfo() {
    const cols = waterfallRef.value?.getColumns()
    const h = waterfallRef.value?.getContainerHeight()
    message.info(`${cols} 列，高度 ${Math.round(h ?? 0)}px`)
  }
</script>
```

:::

## 📖 API 文档

### Props

| 参数                  | 类型                    | 默认值    | 说明                         |
| --------------------- | ----------------------- | --------- | ---------------------------- |
| **items**             | `WaterFallItem[]`       | —         | 数据列表（必传）             |
| **columns**           | `number`                | —         | 固定列数，不传则走响应式断点 |
| **gap**               | `number`                | `16`      | 卡片间距（px）               |
| **lazy**              | `boolean`               | `true`    | 是否启用图片懒加载           |
| **infinite**          | `boolean`               | `false`   | 是否启用无限滚动             |
| **skeleton**          | `boolean`               | `true`    | 是否显示骨架屏               |
| **skeletonCount**     | `number`                | `8`       | 骨架屏数量                   |
| **animationDuration** | `number`                | `300`     | 过渡动画时长（ms）           |
| **breakpoints**       | `WaterFallBreakpoint[]` | 内置 6 档 | 响应式断点配置               |
| **loading**           | `boolean`               | `false`   | 加载状态                     |
| **noMore**            | `boolean`               | `false`   | 是否已无更多数据             |

### Events

| 事件名           | 参数                                   | 说明               |
| ---------------- | -------------------------------------- | ------------------ |
| **load-more**    | —                                      | 无限滚动触底时触发 |
| **item-click**   | `(item: WaterFallItem, index: number)` | 卡片点击           |
| **image-loaded** | `(item: WaterFallItem)`                | 图片加载完成       |
| **image-error**  | `(item: WaterFallItem)`                | 图片加载失败       |

### 暴露方法

| 方法名                 | 签名           | 说明                 |
| ---------------------- | -------------- | -------------------- |
| **relayout**           | `() => void`   | 强制重新布局         |
| **scrollToTop**        | `() => void`   | 平滑滚动回顶部       |
| **getColumns**         | `() => number` | 获取当前列数         |
| **getContainerHeight** | `() => number` | 获取容器总高度（px） |

### Slots

| 插槽名       | 参数                             | 说明               |
| ------------ | -------------------------------- | ------------------ |
| **item**     | `{ item, index, width, height }` | 自定义卡片渲染     |
| **skeleton** | —                                | 自定义骨架屏       |
| **footer**   | `{ status }`                     | 自定义底部加载状态 |

## 📐 类型定义

#### 数据项

```typescript
interface WaterFallItem {
  id: string | number // 唯一标识
  src: string // 图片地址
  width: number // 原始宽度（px）
  height: number // 原始高度（px）
  title?: string // 标题
  description?: string // 描述
  [key: string]: any // 附加字段（透传给插槽）
}
```

#### 布局定位项

```typescript
interface WaterFallLayoutItem {
  item: WaterFallItem // 原始数据
  columnIndex: number // 所在列
  x: number // left 偏移
  y: number // top 偏移
  width: number // 渲染宽度
  height: number // 渲染高度
}
```

#### 响应式断点

```typescript
interface WaterFallBreakpoint {
  minWidth: number // 容器最小宽度（px）
  columns: number // 该断点下的列数
}
```

#### 无限滚动状态

```typescript
type InfiniteScrollStatus = 'idle' | 'loading' | 'no-more' | 'error'
```

#### 组件 Props 接口

```typescript
interface WaterFallProps {
  items: WaterFallItem[]
  columns?: number
  gap?: number
  lazy?: boolean
  infinite?: boolean
  skeleton?: boolean
  skeletonCount?: number
  animationDuration?: number
  breakpoints?: WaterFallBreakpoint[]
  loading?: boolean
  noMore?: boolean
}
```

#### 组件 Expose 接口

```typescript
interface WaterFallExpose {
  relayout: () => void
  scrollToTop: () => void
  getColumns: () => number
  getContainerHeight: () => number
}
```

## 💡 布局算法说明

### 贪心算法

核心思路：**每次将新卡片放入当前最短列**。

```
步骤：
1. 初始化 N 列（列高度均为 0）
2. 遍历每张卡片：
   a. 找到最短列（同高取最左）
   b. 等比缩放图片高度 = (原始高 / 原始宽) × 列宽
   c. 设置该卡片 { x, y, width, height }
   d. 更新列高度 += 卡片高度 + 间距
3. 容器总高度 = max(所有列高度) - 间距
```

### 默认响应式断点

| 容器宽度 | 列数 |
| -------- | ---- |
| ≥ 1600px | 6 列 |
| ≥ 1200px | 5 列 |
| ≥ 992px  | 4 列 |
| ≥ 768px  | 3 列 |
| ≥ 480px  | 2 列 |
| < 480px  | 1 列 |

## 🎨 使用示例

::: details 📋 商品瀑布流 — 电商场景

```vue
<template>
  <C_WaterFall
    :items="products"
    :gap="12"
    infinite
    :loading="loading"
    :no-more="noMore"
    @load-more="loadProducts"
    @item-click="goProductDetail"
  >
    <template #item="{ item, height }">
      <div class="product-card">
        <img
          :src="item.src"
          :style="{ height: `${height}px` }"
        />
        <div class="product-info">
          <div class="product-title">{{ item.title }}</div>
          <div class="product-price">¥{{ item.price }}</div>
          <NButton
            size="tiny"
            type="primary"
            >加入购物车</NButton
          >
        </div>
      </div>
    </template>
  </C_WaterFall>
</template>
```

:::

::: details 🖼️ 图片画廊 — 点击放大预览

```vue
<template>
  <C_WaterFall
    :items="gallery"
    :columns="4"
    :gap="8"
    @item-click="handlePreview"
  />
</template>

<script setup lang="ts">
  function handlePreview(item: WaterFallItem) {
    // 配合 NImageGroup 或自定义弹窗实现大图预览
    window.open(item.src, '_blank')
  }
</script>
```

:::

::: details 🔄 动态数据更新 — items 变更自动重排

```vue
<script setup lang="ts">
  const items = ref<WaterFallItem[]>([])

  // items 变更后，布局引擎自动 watch 并重新计算
  async function refresh() {
    items.value = await fetchNewImages()
    // 无需手动调用 relayout()，watch 自动触发
  }

  // 仅在特殊场景需要手动重排（如容器尺寸被 JS 修改）
  function forceRefresh() {
    waterfallRef.value?.relayout()
  }
</script>
```

:::

## ⚠️ 注意事项

### 1. 数据项必须包含原始尺寸

::: code-group

```typescript [✅ 正确]
// width 和 height 用于布局前的等比缩放计算
const items: WaterFallItem[] = [
  { id: 1, src: '...', width: 640, height: 480 }, // ✅
]
```

```typescript [❌ 错误]
// 缺少 width/height 会导致布局降级为正方形
const items = [
  { id: 1, src: '...' }, // ❌ 缺少尺寸
]
```

:::

### 2. 固定列数 vs 响应式

::: code-group

```vue [✅ 自适应（推荐）]
<!-- 不传 columns，走断点配置 -->
<C_WaterFall :items="items" />
```

```vue [✅ 固定列数]
<!-- 传入 columns 后忽略断点 -->
<C_WaterFall :items="items" :columns="3" />
```

:::

### 3. 无限滚动需配合 loading / noMore

::: code-group

```vue [✅ 推荐]
<C_WaterFall
  :items="items"
  infinite
  :loading="loading"
  :no-more="noMore"
  @load-more="handleLoad"
/>
```

```vue [❌ 不推荐]
<!-- 不传 loading / noMore 会导致重复触发或无法停止 -->
<C_WaterFall :items="items" infinite @load-more="handleLoad" />
```

:::

## 🐛 故障排除

::: details ❓ Q1: 卡片全部挤在一列？
**原因：** 容器宽度为 0（父级为 `display: none` 或尚未挂载）。

确保组件挂载时父容器有明确宽度。如果是 Tab / Collapse 切换后显示，可调用 `relayout()`。
:::

::: details ❓ Q2: 图片闪烁 / 布局跳动？
**原因：** 图片实际尺寸与 `width` / `height` 不符，加载后触发高度修正。

**解决：** 确保传入的 `width` / `height` 与图片实际像素一致，组件会用这些值计算等比缩放高度。
:::

::: details ❓ Q3: 无限滚动不触发 load-more？
**原因：** 哨兵元素未进入视口（内容不够多未撑满页面），或 `loading` / `noMore` 状态未正确管理。

**解决：** 初始数据量应足够撑满一屏以上。确保 `loading` 在请求完成后设为 `false`。
:::

::: details ❓ Q4: 暗色模式下骨架屏不可见？
确保组件处于 `<n-config-provider :theme="darkTheme">` 的主题上下文中。骨架屏使用 CSS 变量驱动，需要主题变量生效。
:::

## 🎯 最佳实践

### 1. 始终提供真实的图片尺寸

```typescript
// ✅ 后端接口返回图片宽高，避免前端加载后再修正布局
const items: WaterFallItem[] = response.data.map(img => ({
  id: img.id,
  src: img.url,
  width: img.naturalWidth, // 后端返回
  height: img.naturalHeight, // 后端返回
  title: img.name,
}))
```

### 2. 合理设置分页大小

```typescript
// ✅ 每页 12~20 条，既保证用户体验又不浪费带宽
const PAGE_SIZE = 16
```

### 3. id 必须全局唯一

```typescript
// ✅ 使用后端真实 ID，避免分页追加时 key 冲突
const items: WaterFallItem[] = data.map(d => ({
  id: d.id,       // ✅ 后端唯一 ID
  // id: index,   // ❌ 追加数据时索引会重复
  ...
}))
```

### 4. 大量数据考虑虚拟滚动

```typescript
// 当数据量超过 500+ 时，建议分批管理可视区域外的 DOM
// 组件提供 relayout() 可在切换数据窗口后强制重排
```

### 5. 配合 CDN 图片服务

```typescript
// ✅ 使用缩略图地址降低带宽，点击后加载原图
const items: WaterFallItem[] = data.map(d => ({
  id: d.id,
  src: `${d.url}?w=400&q=80`, // 缩略图
  width: d.width,
  height: d.height,
}))
```

## 📁 文件结构

```
C_WaterFall/
├── index.vue                    # 主组件（布局渲染 + 骨架屏 + 底部状态）
├── constants.ts                 # 默认断点、间距、动画时长等常量
└── README.md

src/types/modules/waterfall.d.ts           # 完整 TypeScript 类型导出
src/composables/WaterFall/
├── useWaterFallLayout.ts        # 贪心布局算法引擎
├── useInfiniteScroll.ts         # 无限滚动（IntersectionObserver）
└── useResponsiveColumns.ts      # 响应式列数（ResizeObserver + 断点）
```

## 📝 更新日志

### v1.0.1 (2026-02-27)

- 🐛 修复列数调整无效（fixedColumns 变更未触发重新计算）
- 🐛 修复骨架屏不显示（containerHeight 为 0 时被 overflow: hidden 裁切）
- ♻️ 图片懒加载改用浏览器原生 `loading="lazy"` 属性，移除 v-lazy 依赖
- ⚡ 移除永久 `will-change` 避免 GPU 显存浪费
- ⚡ 布局 watch 改用 length 触发，避免 deep 深度遍历
- ✨ 演示页骨架屏流程优化（初始异步加载 + 重置可见）

### v1.0.0 (2026-02-26)

- ✨ 贪心算法瀑布流布局（自动均衡列高差）
- ✨ ResizeObserver 响应式列数（6 档默认断点 + 自定义）
- ✨ 固定列数模式
- ✨ 浏览器原生 `loading="lazy"` 图片懒加载
- ✨ IntersectionObserver 无限滚动
- ✨ 骨架屏占位动画（随机高度 shimmer）
- ✨ `#item` / `#skeleton` / `#footer` 三个插槽
- ✨ 编程 API（relayout / scrollToTop / getColumns / getContainerHeight）
- ✨ 亮色 / 暗色主题自动适配
- ✨ 窗口 / 容器 resize 自动重排

<!--@include: ./snippets/contribute.md -->

**💡 提示**: 瀑布流组件专为图片密集型展示场景设计，零外部依赖。贪心算法保证布局效率，ResizeObserver + IntersectionObserver 双 Observer 方案覆盖响应式和无限滚动需求。数据项需提供原始宽高以获得最佳布局效果。如遇问题请先查阅本文档。🏞️
