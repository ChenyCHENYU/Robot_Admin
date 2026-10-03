<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\docs\build-identity.md
 * @Description: 构建身份卡字段、安全边界与缓存约定
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->

# 构建身份卡

访问 `/build-info.json`，或登录后点击右上角用户菜单底部的“构建信息”，可查看当前部署的只读身份卡。它借鉴 `wl-ui-public` 的 `env.json` 构建溯源字段，但与运行时配置分离；不要把 API 地址、凭据、完整环境变量或租户数据写入此文件。

| 字段                                  | 含义                                                      |
| ------------------------------------- | --------------------------------------------------------- |
| `schemaVersion`                       | 身份卡结构版本，当前为 `1`                                |
| `application.id/name/version`         | 应用标识、名称及 `package.json` 版本                      |
| `build.environment/deploymentProfile` | 构建环境与 `application`／`demo` 部署类型                 |
| `build.authMode/dataMode`             | 本次构建采用的认证和业务数据模式，不包含连接信息          |
| `build.branch/commitSha/commitShort`  | Git 分支与提交；无法确定时为 `null`                       |
| `build.dirty`                         | 构建时工作树是否有未提交变动；Git 不可用时为 `null`       |
| `build.pipelineId`                    | Vercel 部署 ID 或 GitHub Actions 运行 ID；没有时为 `null` |
| `build.builtAt`                       | 构建产物的 UTC ISO 时间；开发服务器无构建产物，为 `null`  |

Vite 在构建阶段生成文件，不在每次访问时运行 Git。开发服务仅在访问该路径时返回身份信息，不增加登录页的首屏请求。Vercel 对身份卡配置了 `no-cache, no-store`，避免切换版本后看到旧标识；其他部署平台也应对该路径设置不缓存。`build.dirty` 是溯源提示，不应替代 CI 的洁净工作树门禁。需要核对版本时，同时比对 `commitSha`、`environment` 和 `deploymentProfile`，不要仅凭前端页面文案判断部署版本。
