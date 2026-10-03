<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\docs\enterprise-auth.md
 * @Description: 企业登录、公司成员关系与后端接入契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 企业登录与多租户上下文（前端演示版）

此功能在 `feat/enterprise-experience-upgrade` 上实现。`Robot_Admin` 负责身份验证后的业务编排、会话与路由；`@robot-admin/naive-ui-components/C_Login` 仍只负责通用凭据表单和人机验证。租户／公司／角色不写入通用组件包。未接通的社区登录渠道保存在 `src/views/login/community.ts`，企业登录页不导入它。

## 演示方式

使用 Mock 模式启动 `bun run dev`，以预填的 `CHENY / 123456` 完成人机验证并登录。该账号关联两个租户下的三个公司，登录自动进入唯一主公司：

| 公司             | 归属   | 公司内角色 | 菜单效果                   |
| ---------------- | ------ | ---------- | -------------------------- |
| 江苏金恒（南京） | 主公司 | 企业管理员 | 全部演示菜单               |
| 江苏金恒（西安） | 兼任   | 运营经理   | 不包含系统管理             |
| 西安天智         | 兼任   | 只读审计   | 仅首页、仪表盘、账号和关于 |

右上角用户菜单显示当前公司与主／兼任身份，点击“切换公司”可更换上下文。首页的企业业务摘要和用户管理演示列表会按公司变化。用户管理可维护账号的公司归属、唯一主公司及每个公司的角色；更改保存在当前浏览器。旧版演示目录的公司 ID 会自动迁移到新版，同时保留自定义的主／兼任及角色。`STAFF` 是单公司示例，`NOACCESS` 演示无可用公司。Mock 接受任意非空密码，拼图也仅为交互演示，**不是生产认证、人机防刷或数据隔离能力**。

## 状态与职责

1. `/auth/login` 验证身份。若返回 `availableContexts`，前端仅在内存中持有短时 `loginTicket`，不写入尚未激活公司的访问令牌。
2. 必须有且仅有一个主公司；零个公司或多个主公司都拒绝进入。登录自动激活主公司，兼任公司只在登录后切换。角色由服务端返回，登录页不提供自行提权的角色下拉框。
3. `/auth/context/activate` 返回包含 `activeContext`、`availableContexts`、用户和上下文绑定令牌的完整会话。此时才写入状态并拉取菜单。
4. `/auth/context/switch` 成功后，前端清理旧令牌、权限、动态路由和页签，再重载到首页，使组件状态与在途请求无法沿用上一公司数据。请求失败则保留原会话。
5. 刷新令牌、菜单与业务接口都必须沿用当前服务端确认的上下文。前端菜单裁剪只是体验层，不是安全边界。

## 后端接入契约

类型见 `src/api/auth.contract.ts`，适配器见 `src/api/auth.ts`。新后端应实现：

- `POST /auth/login`：返回身份信息、短时一次性 `loginTicket` 和已授权公司清单；现有单上下文远端响应若不含 `availableContexts`，仍按原登录流程处理。
- 每个 `AuthContext` 必须提供 `isPrimary`，账号的公司清单中恰好一个为 `true`。正式用户管理接口须支持成员关系与公司内角色，由后端校验主公司唯一性、成员状态和管理员权限。演示字段不会被送入旧版 `/sys/users` 接口。
- `POST /auth/context/activate`：接收 `loginTicket`、`contextId`，服务端核验成员关系后签发上下文绑定的访问／刷新令牌。
- `POST /auth/context/switch`：接收目标 `contextId`，根据当前会话再次核验成员关系，并轮换令牌。
- `GET /auth/menu-list` 与业务接口：从已验证的会话解析租户和公司；请求中的公司 ID 只能作筛选提示，不可作授权依据。角色、菜单和数据范围均须服务端判定。

当前远端兼容路径不假造租户或角色；只有后端返回完整上下文契约后，真实多租户能力才算闭环。上线前还须覆盖跨租户资源访问、成员撤销、令牌刷新、切换并发和审计日志等服务端测试。Mock 菜单策略只在 `auth.mock.ts` 中生效，不能替代这些检查。

生产人机验证须配置 `VITE_CAPTCHA_PROVIDER=altcha`、挑战地址和验签地址，并由 `/auth/login` 服务端核验一次性挑战、过期时间与登录限流。默认本地拼图不能作为生产安全证明。

## 验证

运行 `bun run type-build`、`bun test --max-concurrency=1`、`bun run lint:check`、`bun run lint:eslint` 和生产／应用双模式构建。浏览器回归 `e2e/enterprise-context.pw.ts` 覆盖公司切换后令牌和菜单变化；其他生产烟雾测试使用显式管理员上下文 fixture，不借用旧的无上下文令牌。
