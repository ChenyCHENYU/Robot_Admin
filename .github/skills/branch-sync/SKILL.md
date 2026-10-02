---
name: branch-sync
description: 'Use when: upgrading dependencies, adding common features, or when the user explicitly requests branch sync check. Triggers on: 分支同步, branch sync, 版本升级, dependency upgrade, 同步更新, sync branches, 依赖更新, 通用功能.'
---

# Skill: 多架构分支同步检查（branch-sync）

当**单体主分支（dev/main）**发生通用性变更时，**主动提醒并协助用户**将变更同步到其他架构分支。

---

## 触发条件

以下场景触发此 Skill：

1. **依赖升级** — `package.json` 中 `@robot-admin/*`、`vue`、`vite`、`naive-ui` 等核心依赖版本变更
2. **通用功能新增** — 新增了公共组件（`C_*`）、公共 Store（`s_*`）、公共 Composable（`use*`）、工具函数（`d_*`）
3. **构建配置变更** — `vite.config.ts`、`tsconfig.json`、`unocss.config.ts` 等构建相关文件修改
4. **布局/主题变更** — `@robot-admin/layout`、`@robot-admin/theme` 相关样式或配置调整
5. **路由/权限变更** — `src/router/`、`src/stores/` 中的通用逻辑修改
6. **用户显式触发** — 用户说"帮我同步分支"、"检查下其他分支要不要更新"、或让我读取此文档

---

## 架构分支清单

| 分支                | 架构模式                 | 与单体的差异点                                                                 |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `micro-app`         | 微前端（京东 micro-app） | 门户页面、子应用容器、C_Header 扩展 props、`@shared/constants`、micro-app 注册 |
| `module-federation` | 模块联邦                 | federation 插件配置、远程模块暴露、共享依赖声明                                |
| `monorepo`          | Monorepo 工程化          | workspace 结构、包引用方式（workspace:\*）、构建脚本                           |

---

## 执行流程

### Step 1: 变更分析

检查当前分支最近的变更，分类为：

| 分类         | 说明                             | 需要同步？                  |
| ------------ | -------------------------------- | --------------------------- |
| **通用业务** | 新页面、新组件、新 API、bug 修复 | ✅ 大概率需要               |
| **依赖版本** | package.json 依赖升级            | ✅ 需要，但要检查兼容性     |
| **构建配置** | vite/tsconfig/unocss 变更        | ⚠️ 需确认，各架构可能有差异 |
| **架构特有** | 仅当前分支使用的功能             | ❌ 不需要同步               |

### Step 2: 生成同步报告

输出格式：

```markdown
## 🔄 分支同步检查报告

### 本次变更摘要

- **变更类型**: 依赖升级 / 功能新增 / bug 修复 / 构建配置
- **涉及文件**: （列出关键文件）
- **变更描述**: （简要说明）

### 同步建议

| 目标分支          | 是否需要同步 | 风险等级 | 可能的冲突点            |
| ----------------- | ------------ | -------- | ----------------------- |
| micro-app         | ✅ 需要      | 🟢 低    | 无预期冲突              |
| module-federation | ✅ 需要      | 🟡 中    | vite.config.ts 可能冲突 |
| monorepo          | ❌ 跳过      | -        | 结构差异大，手动处理    |

### 推荐操作

1. `git checkout micro-app && git rebase dev`
2. `git checkout module-federation && git rebase dev`
```

### Step 3: 用户确认

**必须等待用户确认后才执行**，提供选项：

- **全部同步** — 依次切换到每个分支执行 rebase
- **选择性同步** — 只同步用户指定的分支
- **仅记录** — 不操作，仅记录待同步事项供后续处理
- **跳过** — 本次不同步

### Step 4: 执行同步（用户确认后）

```bash
# 对每个需要同步的分支：
git stash                          # 保存当前工作
git checkout <target-branch>       # 切换目标分支
git rebase dev                     # 变基到最新 dev
# 如果有冲突 → 停下来，报告冲突文件，等用户处理
# 如果无冲突 → 报告成功
git checkout dev                   # 切回 dev
git stash pop                      # 恢复工作
```

### Step 5: 冲突处理

如果 rebase 产生冲突：

1. **列出冲突文件**及冲突原因（架构差异 vs 真正冲突）
2. **不自动解决** — 架构分支的冲突需要用户判断
3. 提供冲突解决建议（保留哪边、如何合并）
4. 等用户确认后再 `git rebase --continue`

---

## 兼容性检查清单

同步前自动检查以下项：

- [ ] **Vite 版本兼容** — 确认目标分支的 Vite 插件（federation/micro-app）是否兼容新版本
- [ ] **依赖冲突** — 检查升级的包是否与架构特有依赖冲突
- [ ] **API 变更** — 如果升级了 `@robot-admin/*` 包，检查是否有 breaking changes
- [ ] **构建测试** — 建议同步后在目标分支执行 `bun run build` 验证

---

## 注意事项

1. **绝不自动 force push** — 所有 push 操作必须由用户手动执行
2. **monorepo 分支特殊** — 目录结构差异大，通常建议 cherry-pick 而非 rebase
3. **冲突不猜测** — 遇到架构相关文件冲突时，明确告知用户而非自动选择
4. **先 stash 后操作** — 切换分支前必须保存当前工作区
5. **保持当前分支** — 操作完成后必须切回用户原来所在的分支
