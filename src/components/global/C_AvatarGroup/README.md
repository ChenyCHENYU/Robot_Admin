# C_AvatarGroup 头像组

协作者头像堆叠展示组件，支持溢出 `+N`、在线状态、首字母 fallback、悬浮提示等。

## 基本用法

```vue
<C_AvatarGroup :items="members" :max="5" :size="40" clickable />
```

## Props

| 属性              | 类型                   | 默认值   | 说明                     |
| ----------------- | ---------------------- | -------- | ------------------------ |
| items             | `AvatarItem[]`         | —        | 头像数据                 |
| max               | `number`               | `5`      | 最多显示数量             |
| size              | `number`               | `40`     | 头像尺寸 (px)            |
| overlap           | `number`               | `-10`    | 堆叠偏移（负值表示重叠） |
| shape             | `'circle' \| 'square'` | `circle` | 头像形状                 |
| showStatus        | `boolean`              | `true`   | 是否显示状态指示点       |
| showTooltip       | `boolean`              | `true`   | 是否显示悬浮提示         |
| clickable         | `boolean`              | `false`  | 头像是否可点击           |
| overflowClickable | `boolean`              | `true`   | +N 按钮是否可点击        |
| direction         | `'ltr' \| 'rtl'`       | `'ltr'`  | 排列方向                 |

## Events

| 事件          | 参数           | 说明             |
| ------------- | -------------- | ---------------- |
| itemClick     | `AvatarItem`   | 点击某个头像     |
| overflowClick | `AvatarItem[]` | 点击 +N 溢出按钮 |
