---
name: convention-audit
description: 'Use when: reviewing code for compliance with Robot Admin project conventions, or when generating a compliance report. Triggers on: convention check, 规范检查, audit, 代码审查, code review, 命名规范, naming convention, 代码规范.'
---

# Skill: 规范审计（convention-audit）

对 Robot Admin 项目中的代码进行**规范合规性审查**，检测违反编码约定的问题并给出修正建议。

---

## 触发

- 代码审查请求（code review）
- 新代码提交前的合规性检查
- 项目级别的规范巡检
- 手动请求"帮我检查代码规范"

---

## 审计维度

### 1. 文件结构审计

**目录命名：**

| 类型         | 约定               | 示例                       | 反例                    |
| ------------ | ------------------ | -------------------------- | ----------------------- |
| 全局组件目录 | `C_` + PascalCase  | `C_Header/`, `C_Settings/` | `header/`, `cHeader/`   |
| 局部组件目录 | `c_` + camelCase   | `c_detail/`, `c_role/`     | `Detail/`, `c-detail/`  |
| Demo 目录    | `数字编号-功能名`  | `01-icon/`, `10-table/`    | `icon/`, `table-demo/`  |
| Store 目录   | 领域名(kebab-case) | `user/`, `theme/`          | `userStore/`, `s_user/` |

**文件三件套：**

每个页面/组件目录必须包含：

- `index.vue` — 主组件
- `index.scss` — 样式（scoped）
- `data.ts` — 配置数据（页面级）或 `types.ts`（组件级）

### 2. 命名审计

**变量/函数：**

| 类型         | 约定                       | 示例                                    | 反例                        |
| ------------ | -------------------------- | --------------------------------------- | --------------------------- |
| Store 导出   | `s_` + camelCase + `Store` | `s_userStore`                           | `useUserStore`, `userStore` |
| Composable   | `use` + PascalCase         | `useLoginController`                    | `loginController`           |
| 工具函数文件 | `d_` 前缀                  | `d_auth.ts`                             | `auth.ts`, `authUtils.ts`   |
| 组件 name    | PascalCase                 | `defineOptions({ name: 'UserManage' })` | 缺少 name                   |
| API 函数     | 动词 + 资源 + `Api`        | `getUserListApi`                        | `getUsers`, `userList`      |
| 类型/接口    | PascalCase                 | `UserInfo`, `FormOption`                | `userInfo`, `form_option`   |

**组件引用：**

| 场景          | 约定       | 示例                            |
| ------------- | ---------- | ------------------------------- |
| 模板中组件    | PascalCase | `<C_Table />`, `<NCard />`      |
| 自有组件库    | `C_` 前缀  | `<C_Form />`, `<C_ActionBar />` |
| Naive UI 组件 | `N` 前缀   | `<NButton />`, `<NModal />`     |

### 3. SFC 结构审计

**`<script setup lang="ts">` 区块顺序**（必须按序）：

```
① defineOptions({ name: '...' })
② Props / Emits
③ 外部 Store / Composable
④ 响应式状态 (ref / reactive)
⑤ 计算属性 (computed)
⑥ 方法函数
⑦ 生命周期 (onMounted / onUnmounted)
⑧ Watch
⑨ defineExpose
```

**违规检测项：**

- [ ] 缺少 `defineOptions({ name: '...' })` → 影响 DevTools 和 KeepAlive
- [ ] Props 使用对象语法 `defineProps({ ... })` → 应使用 interface + withDefaults
- [ ] 样式未使用 `@use './index.scss'` → 应使用 `@use` 而非内联样式或 `@import`
- [ ] 缺少 `lang="ts"` → 必须使用 TypeScript
- [ ] 缺少 `scoped` → 必须使用 scoped 样式

### 4. 导入审计

**自动导入违规：**

以下 API 应**不出现在 import 语句中**（已配置自动导入）：

```
// Vue 核心
ref, computed, watch, onMounted, nextTick, reactive, readonly, h, ...

// Vue Router
useRoute, useRouter

// Pinia
defineStore, storeToRefs

// VueUse
useLocalStorage, useClipboard, useDebounceFn, ...

// Naive UI 组件
NCard, NButton, NSpace, NInput, NSelect, NTag, NModal, ...

// Naive UI Composables
useMessage, useDialog, useNotification, useLoadingBar

// 用户自定义（stores / composables / hooks）
s_userStore, s_themeStore, useLoginController, ...
```

**导入顺序违规：**

正确顺序：

```
1. 外部样式
2. Vue 核心
3. 路由/状态
4. UI 库
5. @robot-admin/* 自有包
6. 项目内部 @/ 别名
7. 相对路径 ./
```

**路径别名违规：**

- [ ] 使用 `../../stores/user` → 应使用 `@/stores/user`
- [ ] 使用 `../../../api/auth` → 应使用 `@/api/auth`

### 5. 注释审计

**文件头注释（必须存在）：**

```typescript
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: YYYY-MM-DD
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: YYYY-MM-DD
 * @FilePath: \Robot_Admin\src\xxx\xxx.ts
 * @Description: 文件描述
 * Copyright (c) YYYY by CHENY, All Rights Reserved 😎.
 */
```

**JSDoc 注释（所有导出函数/类/方法必须有）：**

```typescript
/**
 * * @description: 功能描述
 * ? @param {Type} name 参数说明
 * ! @return {ReturnType} 返回值说明
 */
```

### 6. TypeScript 审计

- [ ] 使用 `any` → 应使用具体类型或 `unknown`
- [ ] 缺少函数返回类型 → 复杂函数应标注返回类型
- [ ] Props 未定义 interface → 应使用 interface + withDefaults
- [ ] API 响应未标注泛型 → `getData<T>()` 必须指定 T

### 7. 样式审计

**优先级规则：**

```
1. UnoCSS 原子类（间距、布局、颜色）
2. 组件 SCSS（复杂样式）
3. CSS 变量（主题适应）
```

**违规检测：**

- [ ] 硬编码颜色值 `color: #333` → 应使用 CSS 变量 `var(--c-text-1)`
- [ ] 使用 `@import` 导入样式 → 应使用 `@use`
- [ ] 缺少 `scoped` 属性
- [ ] 行内 style 过多 → 应抽离到 SCSS 文件

### 8. API 层审计

- [ ] 直接使用 `axios` → 应使用 `@robot-admin/request-core`
- [ ] API 函数缺少 JSDoc
- [ ] 响应类型未定义在 `generated/index.ts` 中
- [ ] 缺少泛型标注 `getData<T>(...)`

### 9. Store 审计

- [ ] Store 命名缺少 `s_` 前缀
- [ ] 缺少区块注释分隔 `// ============ 状态 ============`
- [ ] State 中复杂对象未定义 interface
- [ ] 使用 `useXxxStore` 命名（应为 `s_xxxStore`）

### 10. Git 提交审计

提交信息格式：

```
<type>(<scope>): <subject>
```

- [ ] 缺少 type → 必须有 feat/fix/docs/style/refactor/perf/test/chore 等
- [ ] 缺少 scope → 强制填写（如 components/views/stores/router 等）
- [ ] subject 不是中文 → 本项目使用中文提交描述
- [ ] type 首字母大写 → 必须小写

---

## 输出格式

审计结果以表格呈现：

```markdown
## 审计报告：{{文件路径}}

| #   | 维度 | 级别     | 问题描述                 | 建议修正                        |
| --- | ---- | -------- | ------------------------ | ------------------------------- |
| 1   | 命名 | 🔴 Error | Store 命名缺少 s\_ 前缀  | `useUserStore` → `s_userStore`  |
| 2   | 注释 | 🟡 Warn  | 缺少文件头注释           | 添加 @Author/@Date/@Description |
| 3   | 导入 | 🟡 Warn  | 手动导入了 ref           | 删除 import，已自动导入         |
| 4   | 样式 | 🔵 Info  | 可使用 UnoCSS 原子类替代 | `p-4` 替代 `padding: 16px`      |

### 等级说明

- 🔴 Error: 必须修正，违反强制规则
- 🟡 Warn: 建议修正，违反推荐规则
- 🔵 Info: 可选优化，提升代码质量
```

---

## 快速审计命令

当用户说"帮我检查下这个文件的规范"时，按以下流程执行：

1. 读取目标文件
2. 逐项检查上述 10 个维度
3. 输出审计报告表格
4. 提供一键修正建议（可直接应用的代码修改）

---

## 注意事项

1. **不要过度审计**：仅报告违反项目明确约定的问题，不作主观美学判断
2. **自动导入白名单很长**：确认某个 API 确实在自动导入范围内再报告违规
3. **CSS 变量不强制**：仅在涉及主题色时建议使用 CSS 变量
4. **区分 Error/Warn/Info**：只有影响运行时或违反 ESLint 强制规则的才标为 Error
