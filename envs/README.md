# 环境配置安全约定

- `envs/.env.*` 只保存可公开的构建配置，禁止提交密码、Token、API Secret。
- 浏览器需要读取的变量才使用 `VITE_` 前缀；带此前缀的值会进入客户端产物。
- 有道翻译凭据使用 `YOUDAO_APP_ID`、`YOUDAO_APP_KEY`，仅放在本机或 CI 的密钥变量中。
- 生产和预发必须使用 `VITE_AUTH_MODE=remote`；Mock 仅允许开发和测试环境使用。
- 本机临时覆盖使用 Git 已忽略的 `.env.local`，不要修改并提交共享环境文件中的密钥。

示例：

```dotenv
YOUDAO_APP_ID=your-app-id
YOUDAO_APP_KEY=your-app-key
```
