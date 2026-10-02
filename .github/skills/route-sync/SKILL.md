---
name: route-sync
description: 'Use when: registering new pages into the dynamic router system. Adds route entries to dynamicRouter.json and optionally updates keepAliveConfig.ts. Triggers on: route registration, 注册路由, 添加菜单, menu registration, 路由配置, dynamicRouter, 新增页面路由.'
---

# Skill: 路由注册（route-sync）

将新建页面注册到 Robot Admin 的 **动态路由系统**，包括：

1. 在 `dynamicRouter.json` 中添加路由条目
2. 可选更新 `keepAliveConfig.ts` 缓存配置
3. 验证路由路径和组件引用的正确性

---

## 触发

- 新增页面后需要注册路由
- 接收 page-spec JSON 中的 `routeMeta` 字段
- 手动请求添加菜单/路由

---

## 前置知识

### 路由数据源

Robot Admin 使用**本地 JSON 文件**模拟后端动态路由接口：

```
src/assets/data/dynamicRouter.json
```

结构：

```json
{
  "code": "0",
  "data": [
    {
      "path": "/模块路径",
      "name": "模块名",
      "component": "layout",
      "redirect": "/模块路径/默认子页",
      "meta": { "icon": "mdi:xxx", "title": "模块标题" },
      "children": [
        {
          "path": "子路径",
          "name": "路由名称",
          "component": "/views下的组件路径/index",
          "meta": {
            "icon": "mdi:xxx",
            "title": "页面标题",
            "hidden": false,
            "affix": false,
            "keepAlive": true,
            "full": false
          }
        }
      ]
    }
  ],
  "msg": "success"
}
```

### 组件路径映射

`component` 字段值会被 `dynamicRouter.ts` 中的 `VIEW_MODULES` 映射为实际组件：

```
"/home/index"          → src/views/home/index.vue
"/demo/10-table/index" → src/views/demo/10-table/index.vue
"/sys-manage/user-manage/index" → src/views/sys-manage/user-manage/index.vue
```

规则：

- 省略 `src/views` 前缀和 `.vue` 后缀
- 以 `/` 开头
- 以 `/index` 结尾（对应目录下的 index.vue）

### 特殊 component 值

| 值             | 含义                                     |
| -------------- | ---------------------------------------- |
| `"layout"`     | 使用 C_Layout 布局组件（一级菜单必须用） |
| `"/xxx/index"` | 懒加载的页面组件                         |

### meta 字段说明

| 字段        | 类型      | 默认值  | 说明                            |
| ----------- | --------- | ------- | ------------------------------- |
| `title`     | `string`  | —       | 菜单/标签页标题（必填）         |
| `icon`      | `string`  | —       | MDI 图标名（如 `mdi:account`）  |
| `hidden`    | `boolean` | `false` | 是否从菜单隐藏（详情/编辑页用） |
| `affix`     | `boolean` | `false` | 标签页是否固定不可关闭          |
| `keepAlive` | `boolean` | `false` | 是否启用页面缓存                |
| `full`      | `boolean` | `false` | 是否全屏展示（无侧边栏/头部）   |
| `link`      | `string`  | —       | 外链地址（iframe 嵌入）         |

---

## 步骤

### 1. 确定挂载位置

根据 page-spec 的 `path` 确定路由挂载位置：

- **新增子页面到已有模块**：找到对应的顶级路由节点，在 `children` 数组中追加
- **新增独立模块**：在 `data` 数组中新增顶级路由节点（component: "layout"）

### 2. 生成路由条目

#### 新增子页面

```json
{
  "path": "页面路径（kebab-case，不带前导 /）",
  "name": "模块-页面名（kebab-case）",
  "component": "/模块/页面目录/index",
  "meta": {
    "icon": "mdi:图标名",
    "title": "页面中文标题",
    "hidden": false,
    "affix": false,
    "keepAlive": true,
    "full": false
  }
}
```

#### 新增模块

```json
{
  "path": "/模块路径",
  "name": "模块名",
  "component": "layout",
  "redirect": "/模块路径/默认子页",
  "meta": {
    "icon": "mdi:模块图标",
    "title": "模块标题",
    "hidden": false,
    "full": false,
    "affix": false,
    "keepAlive": false
  },
  "children": [
    {
      "path": "子页面路径",
      "name": "模块-子页面名",
      "component": "/模块/子页面/index",
      "meta": {
        "icon": "mdi:子页面图标",
        "title": "子页面标题",
        "hidden": false,
        "affix": false,
        "keepAlive": true,
        "full": false
      }
    }
  ]
}
```

#### 隐藏页面（详情/编辑）

```json
{
  "path": "detail/:id",
  "name": "模块-资源-detail",
  "component": "/模块/资源-detail/index",
  "meta": {
    "icon": "mdi:file-document",
    "title": "详情",
    "hidden": true,
    "keepAlive": false
  }
}
```

### 3. 路由名称约定

```
模块前缀-页面名（kebab-case）
```

示例：

```
demo-10-table      → /demo/10-table
sys-user-manage    → /sys-manage/user-manage
order-detail       → /order/detail/:id
```

### 4. 更新 keepAlive 配置（可选）

如果 `meta.keepAlive: true`，需在 `src/config/keepAliveConfig.ts` 中注册：

```typescript
export const KEEP_ALIVE_PAGES = [
  'ComponentName', // 必须与 defineOptions({ name: '...' }) 中的 name 一致
]
```

### 5. 验证

生成路由后执行以下检查：

- [ ] `component` 路径对应的 `.vue` 文件存在于 `src/views/` 下
- [ ] `name` 在整个 `dynamicRouter.json` 中唯一
- [ ] `path` 不与已有路由冲突
- [ ] 父级路由 `redirect` 指向有效的子路由
- [ ] `keepAlive` 为 true 时，组件 name 已在 keepAliveConfig 注册

---

## 常见路由场景

### Demo 页面

```json
// 追加到 /demo 的 children 中
{
  "path": "57-new-feature",
  "name": "demo-57-new-feature",
  "component": "/demo/57-new-feature/index",
  "meta": {
    "icon": "mdi:star",
    "title": "新功能演示",
    "hidden": false,
    "keepAlive": true
  }
}
```

### 业务管理模块

```json
// 新增顶级菜单
{
  "path": "/order-manage",
  "name": "order-manage",
  "component": "layout",
  "redirect": "/order-manage/order-list",
  "meta": {
    "icon": "mdi:receipt",
    "title": "订单管理"
  },
  "children": [
    {
      "path": "order-list",
      "name": "order-list",
      "component": "/order-manage/order-list/index",
      "meta": {
        "icon": "mdi:format-list-bulleted",
        "title": "订单列表",
        "keepAlive": true
      }
    },
    {
      "path": "order-detail/:id",
      "name": "order-detail",
      "component": "/order-manage/order-detail/index",
      "meta": {
        "icon": "mdi:file-document",
        "title": "订单详情",
        "hidden": true
      }
    }
  ]
}
```

---

## 输出

| 文件                                 | 操作                 |
| ------------------------------------ | -------------------- |
| `src/assets/data/dynamicRouter.json` | 追加路由条目         |
| `src/config/keepAliveConfig.ts`      | 可选：追加缓存组件名 |

---

## 注意事项

1. **不要破坏 JSON 格式**：dynamicRouter.json 必须是合法 JSON，注意尾逗号
2. **子路由 path 不带前导 /**：子路由 path 是相对路径（如 `"user-manage"`，不是 `"/user-manage"`）
3. **component 路径以 / 开头**：如 `"/sys-manage/user-manage/index"`
4. **name 全局唯一**：路由 name 不能与已有的重复
5. **图标统一用 mdi: 前缀**：Robot Admin 使用 `@iconify/vue` 的 MDI 图标集
