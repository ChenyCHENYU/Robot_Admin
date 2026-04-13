<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-04-13
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-04-13
 * @FilePath: \Robot_Admin\docs\skills-roadmap.md
 * @Description: AI Skills 路线图分析 — 社区 vs 定制
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

# AI Skills 路线图分析

> 基于 [skills.sh](https://skills.sh) 社区 + Robot Admin 项目特性，梳理可引用的社区 Skills 以及待建设的定制 Skills。
>
> 技能安装命令：`npx skills add <owner/repo> --skill <skill-name>`
> 支持的 AI 工具：GitHub Copilot · Cursor · Claude Code · Windsurf · Cline · Codex · Gemini 等

---

## 一、项目技术栈参照

| 维度        | 当前状态                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------- |
| 框架        | Vue 3.5.30 + TypeScript ~5.8.3                                                                     |
| 构建        | Vite 8.0.3 + Bun ≥1.x                                                                              |
| UI 库       | Naive UI 2.44.1 + @robot-admin/naive-ui-components 0.8.2                                           |
| 样式        | UnoCSS 66.6.6 + Sass 1.97.3                                                                        |
| 状态        | Pinia 3.0.4 + pinia-plugin-persistedstate                                                          |
| 路由        | Vue Router 4.6.4                                                                                   |
| 测试        | ⚠️ 无测试覆盖（风险项）                                                                            |
| 国际化      | vue-auto-i18n-plugin + scripts/generate-route-translations.ts                                      |
| 已有 Skills | prototype-scan / api-contract / page-codegen / route-sync / convention-audit / mock-codegen（6个） |

---

## 二、可直接引用的社区 Skills

### ⭐ 强烈推荐

#### 1. `frontend-design` — 前端界面设计指南

| 属性         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| 来源         | `anthropics/skills`                                                                         |
| 安装         | `npx skills add https://github.com/anthropics/skills --skill frontend-design`               |
| 周安装量     | 284K（全平台）                                                                              |
| 核心价值     | 设计思维引导：大胆的美学方向、排版字体、色彩主题、动效、空间布局                            |
| 适用场景     | **新建 Demo 页面、新组件视觉设计、Dashboard 改版**时，引导 AI 产出有个性而非"AI 套路"的界面 |
| 与项目契合度 | ★★★★★ — 项目有 54+ 个 demo 页面，每次都需要设计决策                                         |
| 注意事项     | 偏重创意设计，用于辅助决策，不替代项目 Naive UI 组件规范                                    |

#### 2. `vercel-react-best-practices` — 前端性能最佳实践

| 属性         | 内容                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| 来源         | `vercel-labs/agent-skills`                                                                                       |
| 安装         | `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices`                 |
| 周安装量     | 309K（全平台）                                                                                                   |
| 核心价值     | 69条规则，覆盖 8 个性能域（异步并行、Bundle优化、重渲染优化、JS性能...）                                         |
| 适用场景     | **代码 Review、重构、性能优化**；内容虽是 React，但规则本质是 JavaScript 性能原则                                |
| 与项目契合度 | ★★★★☆ — 框架无关的性能规则（如 `async-parallel`、`bundle-barrel-imports`、`js-set-map-lookups`）完全适用于 Vue 3 |
| 注意事项     | React 特定规则（RSC/SSR/`useTransition`）跳过即可，其余 60%+ 规则通用                                            |

#### 3. `find-skills` — 发现社区 Skills 元技能

| 属性         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 来源         | `vercel-labs/skills`                                                       |
| 安装         | `npx skills add https://github.com/vercel-labs/skills --skill find-skills` |
| 核心价值     | 在 skills.sh 社区中搜索满足特定需求的已有 Skills，避免重复建设             |
| 适用场景     | **每次想新建定制 Skill 前**，先用此 Skill 搜索社区是否已有                 |
| 与项目契合度 | ★★★★★ — 长期维护 skills 生态的必备元工具                                   |

#### 4. `skill-creator` — 创建新 Skill 的引导技能

| 属性         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| 来源         | `anthropics/skills`                                                         |
| 安装         | `npx skills add https://github.com/anthropics/skills --skill skill-creator` |
| 核心价值     | 提供 SKILL.md 最佳实践模板、触发条件写法、工具调用规范                      |
| 适用场景     | **新建定制 Skill 时**，获取专业的 Skill 结构指导                            |
| 与项目契合度 | ★★★★☆ — 项目 skills 生态仍在扩展中，将持续用到                              |

---

### ✅ 值得关注

#### 5. `web-design-guidelines` — Web 响应式 & 可访问性规范

| 属性         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 来源         | `vercel-labs/agent-skills`                                                                 |
| 安装         | `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines` |
| 核心价值     | 响应式设计、可访问性（a11y）WCAG 规则、Web 设计最佳实践                                    |
| 适用场景     | **关注可访问性合规、移动端适配**时的辅助检查                                               |
| 与项目契合度 | ★★★☆☆ — 后台管理系统 a11y 不是首要目标，但 UI 规范部分有参考价值                           |

#### 6. `extract-design-system` — 提取设计系统信息

| 属性         | 内容                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| 来源         | `arvindrk/extract-design-system`                                                                 |
| 安装         | `npx skills add https://github.com/arvindrk/extract-design-system --skill extract-design-system` |
| 核心价值     | 从现有 UI 代码库中提取设计 Token（颜色/字体/间距/组件变量）                                      |
| 适用场景     | **重构主题系统、迁移 CSS 变量**时，快速梳理 @robot-admin/theme + Naive UI themeOverrides         |
| 与项目契合度 | ★★★☆☆ — 偶发性需求，不常用                                                                       |

#### 7. `caveman-review` — AI 辅助 Code Review

| 属性         | 内容                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| 来源         | `juliusbrussee/caveman`                                                                                         |
| 安装         | `npx skills add https://github.com/juliusbrussee/caveman --skill caveman-review`                                |
| 核心价值     | 智能代码审查，关注逻辑错误、安全漏洞、可维护性                                                                  |
| 适用场景     | **PR 审查环节**，与项目已有 `convention-audit` Skill 互补（convention-audit 侧重规范，caveman-review 侧重逻辑） |
| 与项目契合度 | ★★★☆☆ — convention-audit 已覆盖规范维度，此项补充逻辑复查                                                       |

---

### ❌ 暂不适用

| Skill                           | 原因                                       |
| ------------------------------- | ------------------------------------------ |
| `remotion-best-practices`       | 视频渲染库，与项目无关                     |
| `agent-browser`                 | 给需要浏览器自动化的 Agent，非代码生成场景 |
| `vercel-composition-patterns`   | Next.js 部署架构，与 Vite SPA 不同         |
| `azure-*` / `microsoft-foundry` | 不使用 Azure 平台                          |
| `supabase-*`                    | 不使用 Supabase                            |
| `brainstorming`                 | 通用创意工具，ROI 偏低                     |

---

## 三、定制 Skills 路线图（待建）

项目已有 6 个 Skills，以下是建议补充的定制 Skills，按优先级排列：

### 🔴 高优先级

#### T1. `test-codegen` — 单元测试自动生成

| 属性     | 内容                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 状态     | **未建**                                                                                                                          |
| 触发词   | 生成测试、单测、vitest、unit test、测试覆盖                                                                                       |
| 核心功能 | 1. 为 composables / utils / stores 生成 Vitest 单测<br>2. 对 API 层生成 mock + 断言<br>3. 遵循 AAA 模式（Arrange / Act / Assert） |
| 背景     | ⚠️ 项目当前**零测试覆盖**，是最大技术风险点                                                                                       |
| 参考     | `@vitest/coverage-v8` 已在依赖中（未使用）                                                                                        |

#### T2. `i18n-sync` — 国际化同步助手

| 属性     | 内容                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 状态     | **未建**                                                                                                                                                                           |
| 触发词   | i18n、国际化、翻译、lang、多语言同步                                                                                                                                               |
| 核心功能 | 1. 扫描 `lang/index.json` 检测缺失翻译 key<br>2. 为新页面生成路由 i18n 条目<br>3. 调用 `scripts/generate-route-translations.ts` 流程指导<br>4. 中英文对照补全（`zh_CN` / `en_US`） |
| 背景     | 项目已有 `vue-auto-i18n-plugin` + route-translations 脚本，但规律不明；新增页面时经常漏翻                                                                                          |

---

### 🟡 中优先级

#### T3. `store-codegen` — Pinia Store 代码生成

| 属性     | 内容                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 状态     | **未建**                                                                                                                                         |
| 触发词   | 生成 store、新建状态、pinia store、状态管理                                                                                                      |
| 核心功能 | 1. 按 `s_` 命名规范生成 Setup Store / Options Store 骨架<br>2. 含持久化配置（pinia-plugin-persistedstate）<br>3. 含 TSDoc 注释、区块分隔注释模板 |
| 背景     | 每次新增 Store 都有相同的模板工作量                                                                                                              |

#### T4. `perf-audit` — 性能审计助手

| 属性     | 内容                                                                                                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 状态     | **未建**                                                                                                                                                                                                                   |
| 触发词   | 性能审计、bundle 分析、分包优化、懒加载、首屏优化                                                                                                                                                                          |
| 核心功能 | 1. 检查 `vite.config.ts` 的 `manualChunks` 分包策略合理性<br>2. 检查 `optimizeDeps.exclude` 是否正确排除 Vue 全家桶<br>3. 扫描未套用懒加载的大型页面路由<br>4. 引用 `vercel-react-best-practices` 中框架无关的 JS 性能规则 |
| 背景     | 项目分包策略复杂（10+ vendor chunks），需要持续治理                                                                                                                                                                        |

#### T5. `component-publish` — 组件库发版流程

| 属性     | 内容                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 状态     | **未建**                                                                                                                                                                       |
| 触发词   | 发版、publish、npm release、changesets、组件库发布                                                                                                                             |
| 核心功能 | 1. Changesets 变更集创建流程<br>2. `bun run build` → `bun run check:exports` → `bun run release` 完整流程校验<br>3. 版本号语义化检查（semver）<br>4. 发布前 CHANGELOG 更新提醒 |
| 背景     | @robot-admin/naive-ui-components 发版步骤繁琐，容易遗漏                                                                                                                        |

---

### 🟢 低优先级（未来考虑）

#### T6. `accessibility-check` — 可访问性检查

| 属性     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 状态     | **未建**                                                     |
| 触发词   | 可访问性、a11y、WCAG、无障碍                                 |
| 核心功能 | 针对 Naive UI 组件的 ARIA 属性检查，Tab 键顺序、色彩对比度   |
| 背景     | 现阶段 a11y 不是优先项，但若项目面向企业大客户可能有合规需求 |

---

## 四、已有 Skills 一览

| #   | Skill              | 触发词                          | 状态            |
| --- | ------------------ | ------------------------------- | --------------- |
| 1   | `prototype-scan`   | 原型解析、axure扫描、页面清单   | ✅ 已建         |
| 2   | `api-contract`     | 接口约定、生成api、swagger转ts  | ✅ 已建         |
| 3   | `page-codegen`     | 生成页面、代码生成、vue页面     | ✅ 已建         |
| 4   | `route-sync`       | 注册路由、添加菜单、路由配置    | ✅ 已建         |
| 5   | `convention-audit` | 规范检查、代码审查、code review | ✅ 已建         |
| 6   | `mock-codegen`     | 生成mock、mock数据、模拟数据    | ✅ 已建（可选） |

---

## 五、标准工作流（含社区 Skills）

```
需求输入（原型 / 详设 / 口述）
  │
  ├──▶ [community] find-skills    → 检索社区是否有现成方案
  │
  ├──▶ prototype-scan             → page-spec JSON
  │         │
  │         ├──▶ api-contract     → src/api/ 类型 + 请求函数
  │         ├──▶ page-codegen     → src/views/ 页面三件套
  │         ├──▶ route-sync       → dynamicRouter.json
  │         └──▶ mock-codegen（可选）→ data.ts 内联 Mock
  │
  ├──▶ [community] frontend-design → 界面美学辅助决策
  │
  └──▶ convention-audit           → 规范合规报告
              │
              └──▶ [community] vercel-react-best-practices → 性能规则复查
```

---

## 六、社区 Skills 快速安装命令

```bash
# 强烈推荐
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/skills --skill find-skills
npx skills add https://github.com/anthropics/skills --skill skill-creator

# 值得关注
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/arvindrk/extract-design-system --skill extract-design-system
npx skills add https://github.com/juliusbrussee/caveman --skill caveman-review
```

> 安装后 Skill 文件会保存到 `.github/skills/` 目录，自动对 GitHub Copilot 生效。

---

## 七、建设优先级总结

```
立即可用（引用社区）    → frontend-design, find-skills, skill-creator
短期建设（定制高优先）  → test-codegen, i18n-sync
中期建设（定制中优先）  → store-codegen, perf-audit, component-publish
长期考虑（定制低优先）  → accessibility-check
参考学习（框架不同）    → vercel-react-best-practices（JS性能规则部分通用）
```

---

> 最后更新：2026-04-13 · 平台参考：[skills.sh](https://skills.sh) · 总计 91,655 个社区 Skills
