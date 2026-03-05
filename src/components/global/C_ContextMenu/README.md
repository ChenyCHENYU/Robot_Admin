# C_ContextMenu 右键菜单

声明式配置的右键上下文菜单组件，支持快捷键标注、嵌套子菜单、危险操作高亮。

## 基础用法

```vue
<template>
  <div @contextmenu.prevent="handleContextMenu"> 右键点击此区域 </div>
  <C_ContextMenu
    ref="menuRef"
    :items="menuItems"
    @select="onSelect"
  />
</template>

<script setup>
  const menuRef = ref()

  const menuItems = [
    {
      key: 'copy',
      label: '复制',
      icon: 'mdi:content-copy',
      shortcut: 'Ctrl+C',
    },
    {
      key: 'paste',
      label: '粘贴',
      icon: 'mdi:content-paste',
      shortcut: 'Ctrl+V',
    },
    { key: 'd1', divider: true, label: '' },
    { key: 'delete', label: '删除', icon: 'mdi:delete-outline', danger: true },
  ]

  const handleContextMenu = e => {
    menuRef.value.open(e.clientX, e.clientY)
  }

  const onSelect = item => {
    console.log('选中:', item.key)
  }
</script>
```

## 嵌套子菜单

```typescript
const items = [
  {
    key: 'file',
    label: '文件',
    icon: 'mdi:file-outline',
    children: [
      { key: 'new', label: '新建', shortcut: 'Ctrl+N' },
      { key: 'open', label: '打开', shortcut: 'Ctrl+O' },
    ],
  },
]
```

## Props

| 属性               | 类型                | 默认值    | 说明               |
| ------------------ | ------------------- | --------- | ------------------ |
| `items`            | `ContextMenuItem[]` | `[]`      | 菜单项列表         |
| `minWidth`         | `number`            | `180`     | 菜单最小宽度（px） |
| `maxWidth`         | `number`            | `280`     | 菜单最大宽度（px） |
| `subMenuPlacement` | `'right' \| 'left'` | `'right'` | 子菜单展开方向     |
| `autoClose`        | `boolean`           | `true`    | 点击项后自动关闭   |
| `disabled`         | `boolean`           | `false`   | 禁用整个菜单       |
| `zIndex`           | `number`            | `9999`    | 层级               |

## ContextMenuItem

| 字段       | 类型                | 说明                 |
| ---------- | ------------------- | -------------------- |
| `key`      | `string`            | 唯一标识             |
| `label`    | `string`            | 菜单文字             |
| `icon`     | `string`            | 图标                 |
| `shortcut` | `string`            | 快捷键标注（仅展示） |
| `disabled` | `boolean`           | 禁用                 |
| `hidden`   | `boolean`           | 隐藏                 |
| `divider`  | `boolean`           | 渲染为分割线         |
| `children` | `ContextMenuItem[]` | 子菜单               |
| `danger`   | `boolean`           | 危险操作高亮         |

## Events

| 事件     | 参数                      | 说明       |
| -------- | ------------------------- | ---------- |
| `select` | `(item: ContextMenuItem)` | 选中菜单项 |
| `open`   | `({ x, y })`              | 菜单打开   |
| `close`  | –                         | 菜单关闭   |

## Expose

| 方法         | 说明                     |
| ------------ | ------------------------ |
| `open(x, y)` | 在指定坐标打开菜单       |
| `close()`    | 关闭菜单                 |
| `visible`    | 当前是否可见（computed） |

## CSS Variables

| 变量                   | 默认值                   | 说明       |
| ---------------------- | ------------------------ | ---------- |
| `--ctx-bg`             | `rgba(35,35,40,0.98)`    | 背景色     |
| `--ctx-bg-blur`        | `12px`                   | 背景模糊   |
| `--ctx-border`         | `rgba(255,255,255,0.08)` | 边框色     |
| `--ctx-radius`         | `10px`                   | 圆角       |
| `--ctx-text-primary`   | `rgba(255,255,255,0.88)` | 文字颜色   |
| `--ctx-text-danger`    | `rgba(208,48,80,0.9)`    | 危险操作色 |
| `--ctx-item-hover-bg`  | `rgba(255,255,255,0.08)` | 悬停背景   |
| `--ctx-shortcut-color` | `rgba(255,255,255,0.3)`  | 快捷键颜色 |
| `--ctx-divider-color`  | `rgba(255,255,255,0.06)` | 分割线颜色 |
