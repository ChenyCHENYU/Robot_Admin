<!--
  @Author: ChenYu ycyplus@gmail.com
  @Date: 2026-08-09
  @FilePath: \Robot_Admin\docs\production-readiness.md
  @Description: Robot Admin 生产化优化记录与演进路线
  Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

# Robot Admin 生产化优化与演进路线

## 当前生产基线

- 架构保持单体 SPA 和既有路由、状态管理边界不变，业务组件继续通过 `@robot-admin/naive-ui-components@0.11.6` 按需消费。
- Markdown、Office、Spline、图表和演示页面保持路由级异步加载；代码高亮仅在实际使用页面初始化，避免全部语言包进入启动链路。
- 本地组件源码模式对 Vue、Naive UI 和 VisActor 等有状态或重量级依赖进行单例解析，构建模块数由 11,222 降至 9,557，最大 VisActor chunk 由 4.16 MiB 降至 2.08 MiB。
- 用户、角色列表采用“仅最新请求生效”的可取消请求控制，组件卸载、快速搜索、筛选和翻页不会被旧响应反向覆盖。
- 账号、用户、角色、菜单、字典及权限治理页面统一支持 Remote/Mock 数据边界；生产和预发不允许回退到演示数据。
- 全局 Vue、Promise、资源和脚本错误可上报到同源端点；上报前会去除凭据、个人信息、附加业务数据及 URL 查询参数。
- 导航、门户、About 卡片和页面内标签/折叠交互补齐原生语义、键盘焦点和 ARIA 状态。
- 非演示代码不保留显式 `any` 或通配 `declare module`，跨包布局类型直接消费正式导出。

## 环境与数据模式

| 环境变量                     | 开发/测试默认 | 生产/预发要求 | 作用                                    |
| ---------------------------- | ------------- | ------------- | --------------------------------------- |
| `VITE_AUTH_MODE`             | `mock`        | `remote`      | 登录、刷新令牌和当前用户                |
| `VITE_DATA_MODE`             | `mock`        | `remote`      | 账号与系统管理业务数据                  |
| `VITE_API_BASE`              | `/api`        | `/api` 或网关 | Axios 请求基地址，推荐由部署层同源代理  |
| `VITE_ERROR_REPORT_ENDPOINT` | 留空          | 按需配置      | 同源客户端错误接收地址                  |
| `VITE_MAP_KEY`               | 留空          | 按需配置      | 高德 Web 端 JS API Key                  |
| `VITE_AMAP_SERVICE_HOST`     | 留空          | 同源代理      | 高德安全代理，须以 `/_AMapService` 结尾 |
| `VITE_ROUTE_IDLE_PREFETCH`   | `false`       | 按需开启      | 登录后网络感知的空闲路由预热            |
| `VITE_ANALYTICS_ENABLED`     | `false`       | 按需开启      | Vercel Analytics 与 Speed Insights      |

Vite 启动阶段会校验枚举、布尔值、端口、远端 API 和错误上报地址。生产或预发配置 Mock、示例 API、跨域错误上报端点时直接终止构建，避免静默使用不安全默认值。本机密钥只放在 Git 已忽略的 `.env.local` 或 CI Secret。

## 后端接口契约

页面只依赖 `src/api/` 的契约，不直接判断运行模式。远端模式当前需要实现以下业务端点；通用响应兼容 `code: 0 | 200 | '0' | '200'`、`message` 和 `msg`。

| 业务域    | 方法与路径                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 认证      | 以 `src/api/auth.contract.ts` 为准                                                                                                                                          |
| 当前账号  | `GET/PUT /account/profile`、`PUT /account/password`、`GET /account/login-records`、`GET /account/activity-logs`                                                             |
| 安全设置  | `GET /account/security-settings`、`PUT /account/security/:key`                                                                                                              |
| 用户/角色 | `GET/POST/PUT/DELETE /sys/users`、`GET/POST/PUT/DELETE /sys/roles`                                                                                                          |
| 菜单/字典 | `GET/POST/PUT/DELETE /sys/menus`、`PUT /sys/menus/:id/move`、`GET/POST/PUT/DELETE /sys/menu-buttons`、`GET /sys/menus/:id/buttons`、`GET/POST/PUT/DELETE /sys/dictionaries` |
| 权限      | `GET/POST /sys/permissions`、`GET/PUT /sys/data-permissions`                                                                                                                |
| 权限治理  | `GET/POST /sys/temp-authorizations`、`PUT /sys/temp-authorizations/:id/revoke`、`GET /sys/permission-constraints`                                                           |
| 权限审计  | `GET /sys/permission-audit-logs`                                                                                                                                            |

刷新令牌的长期生产方案仍应由后端放入 `HttpOnly`、`Secure`、`SameSite` Cookie；前端只持有短时 access token。

## 安全策略

Vercel 配置启用 CSP、HSTS、`nosniff`、严格来源策略、权限策略和静态资源缓存。首页主题及加载动画逻辑已经迁移到同源外部脚本，`script-src` 不再允许 `unsafe-inline` 或 `unsafe-eval`，仅为可选高德地图放行 `https://webapi.amap.com`；定位权限只授予同源页面。`style-src 'unsafe-inline'` 暂时保留，因为 Naive UI 会在运行时注入组件样式。

高德 2021-12-02 后签发的 Key 必须使用安全配置。生产环境通过 `VITE_AMAP_SERVICE_HOST=/_AMapService` 接入后端/Nginx 同源代理，安全密钥只保留在服务端；页面中的明文 `securityJsCode` 输入仅用于本地调试，不持久化。

Spline 的传递依赖 Lottie 源码包含 `eval` 警告，但生产压缩产物中未包含直接 `eval`/`new Function`，因此无需放宽运行时 CSP。外部图片、天气、GitHub、Spline 和 iframe 演示仍需要 HTTPS 连接；如部署为纯内网系统，建议由网关代理这些能力并进一步收紧 `connect-src`、`img-src` 和 `frame-src` 域名白名单。

## 构建验收与预算

2026-09-02 同一生产构建口径的优化结果：

| 指标                | 优化前     | 优化后     | 变化     | 当前预算   |
| ------------------- | ---------- | ---------- | -------- | ---------- |
| 入口 JS             | 423.76 KiB | 371.95 KiB | -12.2%   | ≤ 450 KiB  |
| module preload      | 582.06 KiB | 583.39 KiB | +0.2%    | ≤ 650 KiB  |
| 首屏 CSS            | 276.17 KiB | 266.38 KiB | -3.5%    | ≤ 300 KiB  |
| 首屏资源合计        | 1.25 MiB   | 1.19 MiB   | -4.7%    | ≤ 1.42 MiB |
| module preload 数量 | 83         | 84         | +1       | ≤ 90       |
| 最大异步 chunk      | —          | 2.08 MiB   | 路由隔离 | ≤ 4.88 MiB |

`bun run verify` 顺序执行 Oxlint、ESLint、TypeScript、单元测试、生产构建和 `check:bundle`。预算直接解析 `dist/index.html` 与实际文件大小，任一指标回归即返回失败。Spline、Office 和 VTable 等大模块仍存在于完整产物，但不属于首屏关键链路。

## 尚需后端或基础设施配合

1. 使用 Playwright 在真实部署环境覆盖登录、动态路由、主题、权限按钮、错误页与退出登录，并加入发布门禁。
2. 用 OpenAPI 生成请求类型并在 CI 检查契约漂移，替代目前的手写远端接口类型。
3. 将错误端点接入正式可观测平台，配置采样、聚合、告警、Source Map 私有上传和版本关联。
4. 建立 Web Vitals 真实用户基线，再按设备、网络和路由设定性能 SLO；当前体积预算只解决静态回归。
5. 若不需要 3D、Office、甘特图等演示能力，可在业务发行版删除对应路由和依赖，进一步缩小完整产物与供应链面。
