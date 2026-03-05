# C_Timeline 时间线

垂直 / 水平两种布局的时间线组件，支持自定义节点图标与颜色、可折叠详情、Pending 状态。

## 基础用法

```vue
<C_Timeline :items="timelineData" />
```

## 水平模式

```vue
<C_Timeline :items="data" mode="horizontal" />
```

## 自定义节点 + 可折叠

```vue
<C_Timeline
  :items="[
    {
      id: 1,
      title: '部署成功',
      content: '构建产物已推送至 CDN...',
      time: '2026-03-05 10:30',
      icon: 'mdi:rocket-launch',
      color: '#18a058',
      collapsible: true,
      defaultExpanded: false,
    },
  ]"
/>
```

## Props

| 属性             | 类型                               | 默认值        | 说明                 |
| ---------------- | ---------------------------------- | ------------- | -------------------- |
| `items`          | `TimelineItem[]`                   | `[]`          | 时间线数据           |
| `mode`           | `'vertical' \| 'horizontal'`       | `'vertical'`  | 布局方向             |
| `labelPlacement` | `'left' \| 'right' \| 'alternate'` | `'right'`     | 垂直模式时间标签位置 |
| `pending`        | `boolean`                          | `false`       | 是否显示尾部加载指示 |
| `pendingText`    | `string`                           | `'加载中...'` | 加载文案             |
| `reverse`        | `boolean`                          | `false`       | 反转排列             |
| `size`           | `'small' \| 'medium' \| 'large'`   | `'medium'`    | 节点大小             |
| `lineType`       | `'solid' \| 'dashed' \| 'dotted'`  | `'solid'`     | 连接线样式           |
| `showTime`       | `boolean`                          | `true`        | 是否显示时间标签     |

## TimelineItem

| 字段              | 类型                                                       | 说明              |
| ----------------- | ---------------------------------------------------------- | ----------------- |
| `id`              | `string \| number`                                         | 唯一标识          |
| `title`           | `string`                                                   | 标题              |
| `content`         | `string`                                                   | 描述（支持 HTML） |
| `time`            | `string`                                                   | 时间标签          |
| `color`           | `string`                                                   | 节点颜色          |
| `icon`            | `string`                                                   | 节点图标          |
| `status`          | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | 节点状态          |
| `collapsible`     | `boolean`                                                  | 是否可折叠        |
| `defaultExpanded` | `boolean`                                                  | 初始展开          |
| `tags`            | `{ text, type? }[]`                                        | 标签组            |

## Events

| 事件         | 参数               | 说明         |
| ------------ | ------------------ | ------------ |
| `item-click` | `(item, index)`    | 节点被点击   |
| `expand`     | `(item, expanded)` | 折叠状态变化 |

## Expose

| 方法            | 说明               |
| --------------- | ------------------ |
| `expandAll()`   | 展开全部可折叠节点 |
| `collapseAll()` | 折叠全部可折叠节点 |

## Slots

| 插槽    | 参数              | 说明           |
| ------- | ----------------- | -------------- |
| `dot`   | `{ item, index }` | 自定义节点内容 |
| `title` | `{ item, index }` | 自定义标题区域 |

## CSS Variables

| 变量                         | 默认值                   | 说明             |
| ---------------------------- | ------------------------ | ---------------- |
| `--tl-bg`                    | `transparent`            | 背景色           |
| `--tl-text-primary`          | `rgba(255,255,255,0.92)` | 主文字色         |
| `--tl-text-secondary`        | `rgba(255,255,255,0.55)` | 辅助文字色       |
| `--tl-line-color`            | `rgba(255,255,255,0.12)` | 连接线颜色       |
| `--tl-line-width`            | `2px`                    | 连接线宽度       |
| `--tl-dot-size-md`           | `14px`                   | 默认节点尺寸     |
| `--tl-dot-success`           | `rgba(24,160,88,0.85)`   | 成功状态色       |
| `--tl-dot-warning`           | `rgba(240,160,32,0.85)`  | 警告状态色       |
| `--tl-dot-error`             | `rgba(208,48,80,0.85)`   | 错误状态色       |
| `--tl-dot-info`              | `rgba(32,128,240,0.85)`  | 信息状态色       |
| `--tl-content-bg`            | `rgba(40,40,45,0.6)`     | 内容区背景       |
| `--tl-content-radius`        | `10px`                   | 内容区圆角       |
| `--tl-gap`                   | `24px`                   | 节点间距         |
| `--tl-horizontal-item-width` | `220px`                  | 水平模式节点宽度 |
