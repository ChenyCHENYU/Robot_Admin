# C_Transfer 穿梭框

双栏穿梭选择组件，支持搜索、全选、禁用、分组等场景。

## 基本用法

```vue
<C_Transfer v-model="selectedKeys" :data="dataSource" filterable />
```

## Props

| 属性              | 类型                                          | 默认值        | 说明              |
| ----------------- | --------------------------------------------- | ------------- | ----------------- |
| data              | `TransferItem[]`                              | —             | 数据源            |
| modelValue        | `(string \| number)[]`                        | —             | 右侧已选 key 列表 |
| titles            | `[string, string]`                            | 可选/已选     | 左右栏标题        |
| filterable        | `boolean`                                     | `false`       | 是否可搜索        |
| filterPlaceholder | `string`                                      | `'搜索...'`   | 搜索占位          |
| filterMethod      | `(query: string, item: TransferItem) => bool` | 按 label 匹配 | 自定义筛选        |
| showSelectAll     | `boolean`                                     | `true`        | 是否显示全选      |
| sortable          | `boolean`                                     | `false`       | 右侧可拖拽排序    |
| size              | `'small' \| 'medium' \| 'large'`              | `'medium'`    | 尺寸              |

## Events

| 事件              | 参数                              | 说明          |
| ----------------- | --------------------------------- | ------------- |
| update:modelValue | `(string \| number)[]`            | 已选 key 变化 |
| change            | `targetKeys, direction, moveKeys` | 穿梭操作回调  |
