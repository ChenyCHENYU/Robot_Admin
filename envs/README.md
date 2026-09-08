# 环境配置安全约定

- `envs/.env.*` 只保存可公开的构建配置，禁止提交密码、Token、API Secret。
- 浏览器需要读取的变量才使用 `VITE_` 前缀；带此前缀的值会进入客户端产物。
- 有道翻译凭据使用 `YOUDAO_APP_ID`、`YOUDAO_APP_KEY`，仅放在本机或 CI 的密钥变量中。
- `VITE_DEPLOYMENT_PROFILE=application` 表示真实业务部署，生产和预发必须使用 Remote 认证与数据源。
- `VITE_DEPLOYMENT_PROFILE=demo` 只用于公开演示站，允许生产构建使用闭环 Mock；不能用于真实业务部署。
- `VITE_DATA_MODE` 独立控制业务数据源，避免演示数据静默进入真实业务流程。
- `VITE_ERROR_REPORT_ENDPOINT` 仅允许配置同源绝对路径（如 `/api/client-errors`），留空即关闭错误上报。
- 本机临时覆盖使用 Git 已忽略的 `.env.local`，不要修改并提交共享环境文件中的密钥。

| 变量                         | 开发/测试默认 | 业务生产/预发要求 | 公开演示 | 说明                             |
| ---------------------------- | ------------- | ----------------- | -------- | -------------------------------- |
| `VITE_DEPLOYMENT_PROFILE`    | `application` | `application`     | `demo`   | 部署用途边界                     |
| `VITE_AUTH_MODE`             | `mock`        | `remote`          | `mock`   | 登录、刷新令牌和当前用户数据来源 |
| `VITE_DATA_MODE`             | `mock`        | `remote`          | `mock`   | 账号及系统管理业务数据来源       |
| `VITE_API_BASE`              | `/api`        | `/api` 或网关     | 示例地址 | 建议使用同源反向代理             |
| `VITE_ERROR_REPORT_ENDPOINT` | 留空          | 按需配置          | 留空     | 只接受 `/` 开头的同源绝对路径    |

构建配置会在 Vite 启动阶段校验。非法模式、`application` 生产 Mock 或跨域错误上报地址会直接中止构建，而不是静默回退。`demo` 是显式例外，不会放宽 `application` 的安全约束。

示例：

```dotenv
YOUDAO_APP_ID=your-app-id
YOUDAO_APP_KEY=your-app-key
```
