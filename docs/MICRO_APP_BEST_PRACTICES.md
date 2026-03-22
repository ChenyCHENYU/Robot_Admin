# 微前端方案对比分析

> 基于 Robot Admin 项目实际场景，对比主流微前端方案的选型依据和最佳实践。

## 一、方案矩阵对比

| 维度 | micro-app | qiankun | wujie | Module Federation | iframe |
|------|-----------|---------|-------|-------------------|--------|
| **技术原理** | WebComponent + 沙箱 | single-spa + import-html | WebComponent + iframe沙箱 | Webpack/Vite 模块共享 | 浏览器原生隔离 |
| **接入成本** | ⭐ 极低（类组件标签） | ⭐⭐ 中等（生命周期改造） | ⭐ 低 | ⭐⭐⭐ 高（构建配置） | ⭐ 极低 |
| **JS 沙箱** | ✅ Proxy + iframe双模式 | ✅ Proxy（单实例限制） | ✅ iframe 天然隔离 | ❌ 无沙箱 | ✅ 天然隔离 |
| **CSS 隔离** | ✅ 自动 scoped | ⚠️ 需手动处理 | ✅ iframe 天然隔离 | ❌ 无隔离 | ✅ 天然隔离 |
| **通信机制** | 数据绑定 + PostMessage | Actions + Props | Props + PostMessage | 共享模块直接调用 | PostMessage |
| **预加载** | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 天然支持 | ❌ 不支持 |
| **Vite 兼容** | ✅ 原生支持 | ⚠️ 需 vite-plugin-qiankun | ✅ 原生支持 | ✅ vite-plugin-federation | ✅ |
| **多实例** | ✅ 支持 | ❌ 不支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **Keep-Alive** | ✅ 原生支持 | ❌ 需自实现 | ✅ 原生支持 | ❌ 不适用 | ⚠️ display:none |
| **维护状态** | 🟢 活跃 (京东) | 🟡 低频 (蚂蚁) | 🟢 活跃 (腾讯) | 🟢 活跃 (Webpack) | — |
| **Star 数** | 5.8k+ | 16k+ | 4.2k+ | — | — |
| **包体积** | ~15KB | ~30KB | ~20KB | 0（构建时） | 0 |

## 二、为什么选择 micro-app

### 2.1 项目适配度

| 需求 | micro-app 方案 | 匹配度 |
|------|---------------|--------|
| Vue 3 + Vite 7 技术栈 | 原生支持，无需额外插件 | ✅ 完美 |
| 类 HTML 标签式开发 | `<micro-app>` 标签 | ✅ 完美 |
| 子应用技术栈无关 | 支持 Vue/React/Angular/jQuery | ✅ 完美 |
| 主题统一同步 | 通过 data 绑定 + PostMessage | ✅ 完美 |
| 子应用路由保活 | keep-alive 属性 | ✅ 完美 |
| 渐进式接入 | 不需要改造子应用入口 | ✅ 完美 |
| iframe 沙箱模式 | 支持 with + iframe 双沙箱 | ✅ 完美 |

### 2.2 核心优势

1. **零改造接入**：子应用无需暴露 bootstrap/mount/unmount 生命周期，micro-app 会自动识别并渲染
2. **类组件写法**：在模板中使用 `<micro-app name="app" url="...">` 就像使用普通组件
3. **iframe 沙箱**：v1.0 新增 iframe 沙箱模式，解决了 Proxy 沙箱的兼容性问题
4. **数据通信**：支持 `data` 属性直接传递 + `microApp.setData()` 命令式通信
5. **预加载**：`microApp.preFetch(apps)` 可在空闲时预加载子应用资源

### 2.3 已知限制

| 限制 | 影响 | 缓解方案 |
|------|------|---------|
| `<micro-app>` 标签名需全小写 | ESLint PascalCase 规则冲突 | `eslint-disable` 单行注释 |
| iframe 沙箱性能略低于 Proxy 沙箱 | 首次加载慢 50~100ms | 预加载 + 缓存 |
| 子应用路由需统一前缀 | 路由命名空间约束 | 规范化 baseroute 配置 |
| 跨域需 CORS 配置 | 开发环境跨端口调试 | Vite proxy 配置 |

## 三、官方最佳实践 vs 我们的实现

### 3.1 主应用启动

| 官方推荐 | 我们的实现 | 状态 |
|---------|-----------|------|
| `microApp.start()` 在应用创建前调用 | `setupMicroApp()` 在 `createApp` 前调用 | ✅ |
| 配置 `disable-memory-router` | 已配置 | ✅ |
| 配置 `disable-patch-request` | 已配置 | ✅ |
| 预加载高频子应用 | ⬜ 待实现 | 📋 Phase 2 |

### 3.2 数据通信

| 官方推荐 | 我们的实现 | 状态 |
|---------|-----------|------|
| `data` 属性绑定（推荐） | `appData` computed 响应式绑定 | ✅ |
| PostMessage 自定义事件 | 已实现 6 种消息类型 | ✅ |
| `microApp.setData()` 命令式通信 | 主题同步 watch 实现 | ✅ |
| 全局数据 `microApp.setGlobalData()` | ⬜ 待实现 | 📋 Phase 2 |

### 3.3 路由管理

| 官方推荐 | 我们的实现 | 状态 |
|---------|-----------|------|
| 子应用 baseroute 配置 | 通过 `appData.router.basePath` 传递 | ✅ |
| 主应用 keep-alive | 微应用容器 `keep-alive` 属性 | ✅ |
| 路由守卫白名单 | `/portal` 已加入白名单 | ✅ |
| 动态路由排除微应用路由 | `clearExistingRoutes` 已排除 | ✅ |

### 3.4 样式隔离

| 官方推荐 | 我们的实现 | 状态 |
|---------|-----------|------|
| 自动 scoped CSS | iframe 模式天然隔离 | ✅ |
| CSS 变量主题互通 | `--portal-*` + Naive UI 变量 | ✅ |
| 子应用 Dark Mode 同步 | watch themeStore.isDark | ✅ |

## 四、社区经验总结

### 4.1 生产环境踩坑

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 子应用静态资源 404 | 资源路径未补全为绝对路径 | Vite `base` 配置为子应用完整 URL |
| 子应用路由跳转主应用 | 沙箱隔离了 `history` 对象 | 通过 PostMessage 通知主应用跳转 |
| 子应用全局变量泄漏 | with 沙箱对 `var` 声明无效 | 使用 iframe 沙箱模式 |
| 多个子应用样式冲突 | 全局样式未隔离 | 使用 `scoped` 或 CSS Modules |
| HMR 热更新不生效 | WebSocket 连接被沙箱拦截 | 配置 `disable-patch-request` |

### 4.2 性能优化清单

| 优化项 | 预期收益 | 优先级 |
|--------|---------|--------|
| 子应用预加载（preFetch） | 首次切换加速 60% | P0 |
| 子应用资源缓存（keep-alive） | 切换零延迟 | ✅ 已实现 |
| 共享依赖去重（Vue/Naive UI） | 减少 30% 总包体积 | P1 |
| 子应用懒加载路由 | 减少子应用 FCP | P1 |
| 静态资源 CDN 部署 | 加载速度提升 2~3x | P2 |

## 五、后续扩展计划

### Phase 2：通信增强（短期）

- [ ] `microApp.setGlobalData()` 全局数据广播
- [ ] 子应用错误边界捕获 + 降级 UI
- [ ] 子应用预加载策略配置
- [ ] 共享依赖 externals 配置（Vue / Naive UI / Pinia）

### Phase 3：治理能力（中期）

- [ ] 子应用注册中心（动态注册/卸载）
- [ ] 子应用健康检查（心跳 + 超时重试）
- [ ] 子应用版本管理（灰度发布）
- [ ] 统一日志收集（主应用聚合子应用日志）

### Phase 4：规模化（长期）

- [ ] 子应用 CI/CD 独立流水线
- [ ] 子应用 Monorepo 统一管理
- [ ] 微前端性能监控 Dashboard
- [ ] 子应用 A/B Testing 框架

---

> 最后更新：2026-03-22 | 基于 micro-app v1.0.0-rc.29 + Vue 3.5 + Vite 7
