<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-23
 * @FilePath: \Robot_Admin\SECURITY.md
 * @Description: Robot Admin 依赖安全门禁、临时补丁及消费边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

# 安全维护

发现安全问题时，请通过仓库的私密安全报告渠道提交受影响版本、最小复现与影响条件，不要在公开 issue 中提交账号、token 或可利用的业务数据。

## 依赖安装与审计

项目使用 Bun，并提交应用自身的 `bun.lock`。依赖包根目录的 `overrides` 和开发补丁不会自动传递给应用，因此必须在 Robot_Admin 中安装、锁定和验证。

```bash
bun install --frozen-lockfile
bun run security:audit
bun run security:audit:raw
bun audit --production --json
```

`security:audit:raw` 保留原始 JSON 与退出码。`security:audit` 执行真实审计，遇到网络错误、非 JSON、未知公告、补丁丢失或行为回归失败立即失败；它没有按风险等级忽略全部开发依赖。

## braces 的一条精确临时缓解

2026-10-23 的原始审计报告了 [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)，当时公告影响 `braces <=3.0.3`，上游没有发布修复版本。本项目通过开发工具链的 micromatch 使用该依赖。审计服务结果会变化，以每次真实执行的输出为准。

与组件库保持一致，`patchedDependencies` 将 `patches/braces@3.0.3.patch` 应用到 `braces@3.0.3`。补丁在 parse、compile、expand、stringify 中将花括号、括号以及直接 AST 遍历的嵌套深度限制为 100；它不宣称解决所有正则或 glob 复杂度问题。

审核过的补丁 SHA-256：`6c59dad67310b2f93ed0fead159b0207845d70a6d30a5ae49384c2930df48303`。

安全门禁只在下面检查全部成功时，将这一条公告报告为 **locally mitigated（本地已缓解）**：

- 公告的 ID、URL、严重等级和影响版本范围完全匹配。
- `patchedDependencies` 的版本、补丁路径、补丁哈希与真实安装版本匹配。
- micromatch 实际解析到受检的 braces；锁中没有另一个未验证的 braces 版本。
- 超深字符串和独立构造的 4000 层 AST 被拒绝；正常 glob、范围展开、普通 AST 和深度边界结果保持正确。

原始审计若仍报告这一条 high 公告，会保留非零状态；验证门禁只在补丁检查通过后报告 `rawFindings: 1` 与 `locallyMitigated`，不能称为漏洞清零。如果服务返回 `{}` 且退出码为 0，则报告 `rawFindings: 0`，仍验证补丁的完整性和行为。上游发布已验证修复后，应升级并移除本地补丁和这条精确处置，不扩大为通用白名单。

## 组件库消费者的传递依赖

当前 Visactor 兼容版本仍固定旧依赖：`@visactor/vtable@1.26.8` 固定 lodash 4.17.21，`@visactor/vdataset` 经 geojson-dissolve → geojson-flatten 固定 minimist 1.2.0。2026-10-23 对组件库新安装且没有应用覆盖的独立取样，审计报告了三条 lodash 和两条 minimist 公告。

已检查的 VTable ESM/CJS 路径仅使用 `lodash/get`，公告涉及的函数是 unset/omit/template；geojson-flatten 使用 minimist 的位置是命令行程序而非库入口。这说明检查到的调用范围，不代表任何应用都无法触达风险代码。

Robot_Admin 显式配置并锁定 `lodash=4.18.1`、`minimist=1.2.8`、`markdown-it=14.3.3`。Markdown 覆盖用于防止 `md-editor-v3@6.5.6` 的宽松 `^14.0.0` 声明沿用消费侧旧锁。其他安全覆盖及精确版本以本项目 `package.json` 和 `bun.lock` 为准，不能仅依据组件库的审计结果判断应用安全。

2026-10-24 本项目完成冻结锁安装后，真实全量与生产依赖原始审计均返回 `{}`、退出码 0；安全门禁另完成 67 项补丁行为检查。这个结果只代表当次服务与锁文件，后续依赖变化仍需重新验证。
