# Robot Admin 设计系统

> Robot Admin 当前设计语言与主题接入文档。

## 当前能力

- `light` / `dark` / `system` 三种主题偏好。
- `glass-morphism` / `corporate-minimal` / `dark-tech` 三种设计风格。
- `signature` / `standard` 两种菜单呈现，独立于内容区设计风格。
- Naive UI 与 `C_*` 全局组件体系保持一致的主题覆盖。
- 系统偏好、持久化、跨标签页同步、首屏防闪烁和运行时降级。

## 文档入口

- [主题架构与接入](./THEME-ARCHITECTURE.md)：当前实现的唯一技术事实源。
- [色彩基础](./foundations/colors.md)：主题色与语义色约定。
- [动效基础](./foundations/animations.md)：动画与 reduced-motion 约定。
- [设计风格说明](./DESIGN-STYLES-EXPLAINED.md)：三套视觉风格的适用范围。
- [玻璃拟态](./themes/glass-morphism.md)：默认风格的视觉说明。

`FINAL-EXTENSION-PLAN.md` 及 `implementation/` 下的旧候选方案已移除；这些方案在
主题包分层前形成，包含重复 Store、重复缓存和过期根入口示例，不再作为实现依据。

## 维护原则

1. 主题模式与设计风格由 `@robot-admin/theme` 管理。
2. 主色、圆角和布局设置由 `@robot-admin/layout` 管理，主题层只响应式派生覆盖。
3. 菜单风格属于应用布局呈现，不写入主题包。
4. 业务代码只消费 `s_themeStore`，不要直接创建第二个主题 Store 或第二份主题缓存。
5. 视觉调整不得绕过 Token 新增页面级明暗判断。

最后更新：2026-09-08。
