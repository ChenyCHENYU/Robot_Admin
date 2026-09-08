# Robot Admin 主题架构与接入

本文档描述 Robot Admin 当前生产实现。主题包版本为 `@robot-admin/theme@0.5.0`。

## 分层职责

| 层级            | 唯一职责                                           | 当前入口                    |
| --------------- | -------------------------------------------------- | --------------------------- |
| Theme Core      | 模式、设计风格、兼容规则和只读元数据               | `@robot-admin/theme/core`   |
| Vue Runtime     | Pinia 状态、持久化、系统偏好、DOM 属性和跨标签同步 | `@robot-admin/theme/vue`    |
| Naive Adapter   | `NConfigProvider` 的主题对象与增量覆盖合并         | `@robot-admin/theme/naive`  |
| Layout Settings | 主色、圆角、布局和设置抽屉                         | `@robot-admin/layout/naive` |
| App Adapter     | Robot Token、菜单风格和两个包之间的单向桥接        | `src/stores/theme`          |

主题模式和设计风格只以主题包 Store 为事实源。布局 Store 中的 `themeMode` 是设置抽屉
所需的投影；主色和圆角则只以布局 Store 为事实源。应用适配层通过 computed 生成
Naive UI 增量覆盖，不再维护或持久化第二份完整 `themeOverrides`。

## 启动与卸载

```text
public/theme-init.js
  -> 样式加载前恢复 data-theme / data-design-style，避免首屏闪烁
setupStore(app)
  -> 安装 Pinia
setupLayoutSystem(app)
  -> 创建带主题回调的布局 Store
setupThemeSystem(app)
  -> 初始化主题、菜单 DOM 状态和监听器
App.vue
  -> 把 currentTheme / themeOverrides 交给 NConfigProvider
app unmount / HMR dispose
  -> destroy() 释放媒体查询、storage 和菜单监听器
```

全量主题样式只需一条入口：

```typescript
import '@robot-admin/theme/naive/styles'
```

业务组件只使用应用 Store：

```typescript
import { s_themeStore } from '@/stores/theme'

const themeStore = s_themeStore()
await themeStore.setMode('system')
await themeStore.setDesignStyle('corporate-minimal')
themeStore.setMenuTheme('standard')
```

不要在业务模块再次调用 `init()`，生命周期由 `setupThemeSystem()` 集中管理。

## 持久化所有权

| Key                               | 所有者                 | 内容                        |
| --------------------------------- | ---------------------- | --------------------------- |
| `theme-mode`                      | `@robot-admin/theme`   | `light` / `dark` / `system` |
| `robot-admin-design-style`        | `@robot-admin/theme`   | 三种设计风格之一            |
| `robot-admin-menu-theme`          | Robot App Adapter      | `signature` / `standard`    |
| `robot-admin-appearance-settings` | Robot Settings Adapter | 主色与圆角白名单            |

历史 key `robot-admin-theme-overrides` 已停用。首次升级时会提取其中合法的主色和圆角，
转换为布局设置后写入新白名单，再清理旧完整对象。不得恢复完整覆盖对象持久化，否则
暗色基础配置会再次被亮色缓存污染。

## 兼容规则与降级

- `dark-tech` 只支持暗色；从缓存、设置抽屉、快捷切换或跨标签同步进入时都会归一化。
- localStorage、`matchMedia` 或 View Transition 不可用时，切换仍完成，不阻断应用启动。
- 用户启用 reduced-motion 时不执行主题转场动画。
- `init()` 幂等，`destroy()` 可重复执行；监听器不会因热更新重复注册。
- Naive UI 亮色 `bodyColor` 为 `#ffffff`，暗色不复用亮色完整覆盖。

## 扩展边界

未来 Element Plus 项目复用 `/core` 与 `/vue`，并在有真实业务后新增独立
`/element-plus` 适配入口。不要在 Robot_Admin 内添加 Element Plus 条件分支，也不要
让 UI 框架反向进入 Core 或 Vue Runtime。菜单风格继续由各宿主布局自行管理。

## 验证基线

- `tests/theme-bootstrap.test.ts`：首屏恢复、存储/系统偏好异常和受限风格归一化。
- `tests/theme-integration.test.ts`：包与应用 Store 的状态同步、覆盖合并、旧缓存和副作用清理。
- `bun run type-build`：应用及公开类型接入。
- `bun run build`：Vite 生产构建与 CSS 聚合入口。
- `bun run check:bundle`：产物体积门禁。
