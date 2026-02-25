---
outline: 'deep'
---

# C_SplitPane 分割面板

> 🪟 零依赖的可调整分割面板组件，支持水平/垂直分割、拖拽调整、折叠展开、嵌套布局和键盘微调

## 🚀 特性

- **↔️ 双向分割**: 水平（左右）和垂直（上下）两种分割模式
- **🖱️ 拖拽调整**: 拖动分割线实时调整面板大小，毫秒级响应
- **📏 尺寸限制**: 支持设置最小/最大比例，防止面板被拖到过小或过大
- **📁 折叠展开**: 双击分割线或点击按钮折叠面板，一键恢复
- **🪆 嵌套分割**: SplitPane 可互相嵌套，实现 IDE 级复杂布局
- **⌨️ 键盘微调**: 聚焦分割线后按方向键精确调整，Home/End 跳到极值
- **♿ 无障碍**: 原生 `role="separator"` + `aria-*` 属性，完善的键盘导航
- **🎨 主题适配**: 跟随项目 CSS 变量，自动适配亮/暗主题
- **💪 TypeScript**: 完整类型定义，`SplitPaneExpose`、`SplitPaneEmits` 等均有类型保障
- **📦 零依赖**: 纯逻辑实现，无任何外部依赖

## 📦 安装

无需安装额外依赖，组件已全局注册。

## 🎯 快速开始

### 最简用法

```vue {3-12}
<template>
  <!-- 最简单的左右分割 -->
  <div style="height: 300px">
    <C_SplitPane>
      <template #first>
        <div>左面板</div>
      </template>
      <template #second>
        <div>右面板</div>
      </template>
    </C_SplitPane>
  </div>
</template>

<script setup>
  // 无需导入，已全局注册
</script>
```

> [!TIP]
> 组件高度默认 `100%`，需要确保父容器有明确高度。

::: details 🖥️ 编辑器三栏布局 - 嵌套示例

```vue {4-9,13-22}
<template>
  <div style="height: 600px">
    <!-- 外层：水平分割（文件树 | 编辑区+终端） -->
    <C_SplitPane
      :default-size="25"
      :min-size="15"
      :max-size="40"
    >
      <template #first>
        <div class="file-tree">📁 文件树</div>
      </template>
      <template #second>
        <!-- 内层：垂直分割（编辑区 | 终端） -->
        <C_SplitPane
          direction="vertical"
          :default-size="70"
        >
          <template #first>
            <div class="editor">📝 代码编辑区</div>
          </template>
          <template #second>
            <div class="terminal">💻 终端</div>
          </template>
        </C_SplitPane>
      </template>
    </C_SplitPane>
  </div>
</template>
```

:::

::: details 🎛️ 编程控制折叠/展开

```vue {3,20-32}
<template>
  <div style="height: 400px">
    <C_SplitPane
      ref="splitRef"
      :collapsible="true"
      @collapse="t => console.log('折叠:', t)"
      @expand="t => console.log('展开:', t)"
    >
      <template #first>
        <div>侧边栏</div>
      </template>
      <template #second>
        <div>主内容</div>
      </template>
    </C_SplitPane>

    <div class="controls">
      <button @click="splitRef?.collapse('first')">折叠左面板</button>
      <button @click="splitRef?.collapse('second')">折叠右面板</button>
      <button @click="splitRef?.expand()">展开</button>
      <button @click="splitRef?.toggle()">切换</button>
      <button @click="splitRef?.resetSize()">重置</button>
      <button @click="splitRef?.setSize(30)">设为 30%</button>
    </div>
  </div>
</template>

<script setup>
  const splitRef = ref()

  // 获取面板信息
  const info = splitRef.value?.getPanelInfo()
  // → { first: { size: 50, collapsed: false }, second: { size: 50, collapsed: false } }
</script>
```

:::

## 📋 API

### Props

| 属性                 | 类型                         | 默认值         | 说明                           |
| -------------------- | ---------------------------- | -------------- | ------------------------------ |
| `direction`          | `'horizontal' \| 'vertical'` | `'horizontal'` | 分割方向                       |
| `defaultSize`        | `number`                     | `50`           | 首面板默认大小（百分比 0-100） |
| `minSize`            | `number`                     | `0`            | 首面板最小大小（百分比）       |
| `maxSize`            | `number`                     | `100`          | 首面板最大大小（百分比）       |
| `disabled`           | `boolean`                    | `false`        | 是否禁用拖拽调整               |
| `collapsible`        | `boolean`                    | `true`         | 是否可折叠                     |
| `showCollapseButton` | `boolean`                    | `true`         | 是否显示折叠按钮               |
| `gutterSize`         | `number`                     | `6`            | 分割线宽度（px）               |
| `step`               | `number`                     | `2`            | 键盘微调步长（百分比）         |

### Events

| 事件         | 参数                                      | 说明               |
| ------------ | ----------------------------------------- | ------------------ |
| `resize`     | `(firstSize: number, secondSize: number)` | 面板大小变化时触发 |
| `collapse`   | `(target: CollapseTarget)`                | 面板折叠时触发     |
| `expand`     | `(target: CollapseTarget)`                | 面板展开时触发     |
| `drag-start` | `(size: number)`                          | 拖拽开始时触发     |
| `drag-end`   | `(size: number)`                          | 拖拽结束时触发     |

### Slots

| 插槽     | 说明                                           |
| -------- | ---------------------------------------------- |
| `first`  | 首面板（水平模式为左面板，垂直模式为上面板）   |
| `second` | 第二面板（水平模式为右面板，垂直模式为下面板） |

### Expose 方法

通过 `ref` 获取组件实例后调用：

| 方法           | 类型                                            | 说明                         |
| -------------- | ----------------------------------------------- | ---------------------------- |
| `collapse`     | `(target?: CollapseTarget) => void`             | 折叠指定面板，默认 `'first'` |
| `expand`       | `() => void`                                    | 展开已折叠的面板             |
| `toggle`       | `(target?: CollapseTarget) => void`             | 切换折叠/展开状态            |
| `resetSize`    | `() => void`                                    | 重置为默认大小               |
| `setSize`      | `(size: number) => void`                        | 设置首面板大小（百分比）     |
| `getPanelInfo` | `() => { first: PanelInfo; second: PanelInfo }` | 获取当前面板信息             |

### 类型定义

```typescript
/** 分割方向 */
type SplitDirection = 'horizontal' | 'vertical'

/** 折叠目标 */
type CollapseTarget = 'first' | 'second'

/** 面板信息 */
interface PanelInfo {
  /** 当前面板大小百分比 0-100 */
  size: number
  /** 面板是否已折叠 */
  collapsed: boolean
}
```

## ⌨️ 键盘快捷键

| 按键      | 说明                   |
| --------- | ---------------------- |
| `←` / `→` | 水平模式下微调面板大小 |
| `↑` / `↓` | 垂直模式下微调面板大小 |
| `Home`    | 跳到最小值             |
| `End`     | 跳到最大值             |

> [!TIP]
> 先用鼠标/Tab 键聚焦分割线，再按方向键即可微调。

## 🔧 常见问题

::: details ❌ 面板内容不显示 / 高度为 0

`C_SplitPane` 的高度默认是 `100%`，需要确保其所有祖先容器都有明确的高度设置：

```vue
<!-- ❌ 错误：父容器无高度 -->
<div>
  <C_SplitPane>...</C_SplitPane>
</div>

<!-- ✅ 正确：父容器设置固定或百分比高度 -->
<div style="height: 500px">
  <C_SplitPane>...</C_SplitPane>
</div>
```

:::

::: details ❌ 拖拽时 iframe 吞掉鼠标事件

当面板中嵌入了 `<iframe>` 时，拖拽到 iframe 区域会导致鼠标事件丢失。组件在拖拽期间会通过 `pointer-events: none` + `user-select: none` 自动处理此问题。

如果仍有异常，可在面板内给 iframe 添加覆盖层：

```vue
<template #first>
  <div class="iframe-panel">
    <iframe src="https://example.com" />
    <div
      v-if="isDragging"
      class="iframe-overlay"
    />
  </div>
</template>
```

:::

::: details ❌ 折叠后面板内容闪烁

折叠面板带有 CSS 过渡动画（`transition: width 0.3s`），如果面板内容布局敏感，可在面板内容层使用 `overflow: hidden` 避免内容溢出在动画过程中闪烁。

:::

## 🔄 未来规划

- [ ] 多分割（三面板、四面板模式）
- [ ] 面板内容懒渲染（折叠时销毁 DOM）
- [ ] 拖拽吸附功能（靠近 50% 时自动吸附）
- [ ] 保存/恢复布局状态（localStorage 持久化）
- [ ] 面板最小像素约束（结合百分比）

## 📚 相关资源

- [类型定义](../../types/modules/split-pane.d.ts)
- [useSplitResize 组合函数](../../composables/SplitPane/useSplitResize.ts)
- [演示页面源码](../../views/demo/43-split-pane/index.vue)

<!--@include: ./snippets/contribute.md -->
