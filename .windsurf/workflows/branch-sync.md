---
description: 多架构分支同步检查 — 当单体主分支有通用变更时，检查并同步到 micro-app / module-federation / monorepo 分支
---

# 分支同步检查

当你在 dev/main 分支完成了依赖升级、通用功能新增、构建配置变更等操作后，使用此流程检查是否需要同步到其他架构分支。

## 步骤

1. 读取 `.github/skills/branch-sync/SKILL.md` 获取完整规则
2. 执行 `git log --oneline -10` 查看最近变更
3. 执行 `git branch -a` 确认架构分支列表
4. 分析变更内容，生成同步报告
5. 等待用户确认后执行同步操作
