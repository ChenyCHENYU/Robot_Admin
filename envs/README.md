# 环境配置安全约定

- `envs/.env.*` 只保存可公开的构建配置，禁止提交密码、Token、API Secret。
- 浏览器需要读取的变量才使用 `VITE_` 前缀；带此前缀的值会进入客户端产物。
- 有道翻译凭据使用 `YOUDAO_APP_ID`、`YOUDAO_APP_KEY`，仅放在本机或 CI 的密钥变量中。
- `VITE_DEPLOYMENT_PROFILE=application` 表示真实业务部署，生产和预发必须使用 Remote 认证与数据源。
- `VITE_DEPLOYMENT_PROFILE=demo` 只用于公开演示站，允许生产构建使用闭环 Mock；不能用于真实业务部署。
- `VITE_DATA_MODE` 独立控制业务数据源，避免演示数据静默进入真实业务流程。
- `VITE_ERROR_REPORT_ENDPOINT` 仅允许配置同源绝对路径（如 `/api/client-errors`），留空即关闭错误上报。
- `VITE_CAPTCHA_PROVIDER` 默认为兼容演示用的 `puzzle-captcha`；真实登录可切换为免费自托管的 `altcha`，但必须同时提供挑战和服务端验签接口。
- 本机临时覆盖使用 Git 已忽略的 `.env.local`，不要修改并提交共享环境文件中的密钥。

| 变量                           | 开发/测试默认    | 业务生产/预发要求 | 公开演示         | 说明                               |
| ------------------------------ | ---------------- | ----------------- | ---------------- | ---------------------------------- |
| `VITE_DEPLOYMENT_PROFILE`      | `application`    | `application`     | `demo`           | 部署用途边界                       |
| `VITE_AUTH_MODE`               | `mock`           | `remote`          | `mock`           | 登录、刷新令牌和当前用户数据来源   |
| `VITE_DATA_MODE`               | `mock`           | `remote`          | `mock`           | 账号及系统管理业务数据来源         |
| `VITE_API_BASE`                | `/api`           | `/api` 或网关     | 示例地址         | 建议使用同源反向代理               |
| `VITE_ERROR_REPORT_ENDPOINT`   | 留空             | 按需配置          | 留空             | 只接受 `/` 开头的同源绝对路径      |
| `VITE_CAPTCHA_PROVIDER`        | `puzzle-captcha` | 推荐 `altcha`     | `puzzle-captcha` | 人机验证提供方                     |
| `VITE_CAPTCHA_CHALLENGE_URL`   | 留空             | 同源接口          | 留空             | 签发一次性 ALTCHA 挑战             |
| `VITE_CAPTCHA_VERIFY_ENDPOINT` | 留空             | 同源接口          | 留空             | 验证 ALTCHA payload 并换取登录令牌 |

构建配置会在 Vite 启动阶段校验。非法模式、`application` 生产 Mock 或跨域错误上报地址会直接中止构建，而不是静默回退。`demo` 是显式例外，不会放宽 `application` 的安全约束。

ALTCHA 是 MIT 开源、自托管且无调用额度的 PoW 方案。两个端点都必须使用同源绝对路径；后端负责签发短时一次性挑战、验证并防重放/限流，HMAC 密钥不得使用 `VITE_` 前缀或进入浏览器。当前仓库没有后端实现，因此默认配置不会伪装成生产安全模式。

示例：

```dotenv
YOUDAO_APP_ID=your-app-id
YOUDAO_APP_KEY=your-app-key

VITE_CAPTCHA_PROVIDER=altcha
VITE_CAPTCHA_CHALLENGE_URL=/api/auth/captcha/challenge
VITE_CAPTCHA_VERIFY_ENDPOINT=/api/auth/captcha/verify
```
