# Robot Admin 模块化改造分析

> 📅 创建日期：2026-02-07  
> 🎯 目标：分析项目结构，识别可拆分模块，制定拆包策略

---

## 📊 项目现状

| 指标     | 数值                                 |
| -------- | ------------------------------------ |
| 核心代码 | ~15000 行                            |
| 技术栈   | Vue 3.4 + Naive UI + Pinia + Vite    |
| 主要问题 | 部分通用模块可复用，但与项目配置耦合 |

---

## 🔍 模块分析

### ✅ 可拆分模块（纯工具类）

#### 1. form-validators（表单验证）

**路径**: `src/utils/v_verify.ts`  
**代码量**: 500+ 行  
**特点**:

- ✅ 纯验证规则函数
- ✅ PRESET_RULES 完全通用
- ✅ 零配置依赖

**核心功能**:

```typescript
PRESET_RULES.required()
PRESET_RULES.range(1, 150)
PRESET_RULES.mobile()
PRESET_RULES.email()
PRESET_RULES.idCard()
// ... 等 20+ 个规则
```

---

#### 2. hooks（业务 Hooks）

**路径**: `src/hooks/`  
**代码量**: 1100+ 行  
**特点**:

- ✅ 自包含，不依赖项目配置
- ✅ 功能完整独立

**包含模块**:

- `useDownload/` (289 行) - 文件下载，支持 20+ 文件类型
- `useExcel/` (320 行) - Excel 导入导出
- `useCopy/` (506 行) - 复制到剪贴板

---

### ⏳ 暂缓拆分（依赖配置）

#### 3. useTableCrud（CRUD 逻辑）

**路径**: `src/composables/useTableCrud/`  
**代码量**: 458 行  
**暂缓原因**:

- ❌ 依赖项目的 `@/axios/request.ts`（7 个插件）
- ❌ 拆分后需要每次传 httpClient，反而啰嗦

**依赖分析**:

```typescript
// 依赖项目的 request
import { getData, postData, putData, deleteData } from '@/axios/request'

// request.ts 包含：
// - 7 个插件：cache、retry、dedupe、request、response、cancel、reLogin
// - token 注入、错误处理、业务码判断
// - 项目环境变量（baseURL、timeout）
```

**对比**:

```typescript
// 在项目内（简洁）
const table = useTableCrud({
  api: { ... },
  columns: [ ... ]
})

// 拆成包后（啰嗦）
const table = useTableCrud({
  httpClient: { get, post, put, delete }, // 每次都要传 😫
  api: { ... },
  columns: [ ... ]
})
```

---

#### 4. theme（主题系统）

**路径**: `src/stores/theme/`  
**暂缓原因**: 主题配置项目特定（颜色、字体、组件样式）

---

#### 5. i18n（国际化）

**路径**: `lang/`  
**暂缓原因**: 翻译内容业务特定

---

### ❌ 不应拆分的模块

**业务特定**:

- `src/utils/d_auth.ts` - 权限工具
- `src/utils/d_menu.ts` - 菜单工具
- `src/utils/d_route.ts` - 路由工具
- `src/stores/permission/` - 权限管理
- `src/stores/user/` - 用户状态

**项目配置**:

- `src/axios/` - axios 封装（7 个插件）
- `src/config/` - 项目配置
- `src/plugins/` - 插件系统
- `vite.config.ts` - 构建配置

**简单工具**（代码少，拆分收益低）:

- `src/hooks/useOnClickOutside/` - 点击外部检测
- `src/hooks/useStorage/` - 本地存储

**业务组件**:

- `src/views/` - 页面组件
- `src/components/local/` - 本地组件
- `src/api/` - API 接口

---

## 🎯 拆分决策

### 立即拆分（2 个包）

| 包名                           | 来源                                       | 代码量   | 原因               |
| ------------------------------ | ------------------------------------------ | -------- | ------------------ |
| `@robot-admin/form-validators` | `src/utils/v_verify.ts`                    | 500+ 行  | 纯函数，零依赖     |
| `@robot-admin/hooks`           | `src/hooks/{useDownload,useExcel,useCopy}` | 1100+ 行 | 自包含，不依赖配置 |

### 暂缓理由

- **useTableCrud**: 依赖 request.ts，拆分后使用反而啰嗦
- **theme/i18n**: 内容项目特定，拆分收益低

---

## 📦 包设计

### 1. @robot-admin/form-validators

**目录结构**:

```
packages/form-validators/
├── src/
│   ├── core/
│   │   ├── createRule.ts       # 创建自定义规则
│   │   ├── patterns.ts         # 正则表达式集合
│   │   └── asyncRule.ts        # 异步验证
│   ├── presets.ts              # PRESET_RULES
│   ├── types.ts
│   └── index.ts
├── package.json
├── tsup.config.ts
└── README.md
```

**导出内容**:

```typescript
export { PRESET_RULES } from './presets'
export { createRule } from './core/createRule'
export { createAsyncRule } from './core/asyncRule'
export { REGEX_PATTERNS } from './core/patterns'
export type * from './types'
```

**使用示例**:

```typescript
import { PRESET_RULES } from '@robot-admin/form-validators'

const rules = {
  username: [PRESET_RULES.required('请输入用户名'), PRESET_RULES.length(3, 20)],
  age: [PRESET_RULES.required(), PRESET_RULES.range(1, 150)],
  email: [PRESET_RULES.email()],
  mobile: [PRESET_RULES.mobile()],
}
```

---

### 2. @robot-admin/hooks

**目录结构**:

```
packages/hooks/
├── src/
│   ├── useDownload/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── useExcel/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── templates.ts        # 预设模板
│   │   └── utils.ts
│   ├── useCopy/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── formatters.ts       # 数据格式化
│   │   └── utils.ts
│   └── index.ts
├── package.json
├── tsup.config.ts
└── README.md
```

**导出内容**:

```typescript
export { useDownload, useDownloadExcel, useDownloadPDF } from './useDownload'
export { useExcel } from './useExcel'
export { useCopy } from './useCopy'
export type * from './useDownload/types'
export type * from './useExcel/types'
export type * from './useCopy/types'
```

**使用示例**:

```typescript
import { useDownload, useExcel, useCopy } from '@robot-admin/hooks'

// 文件下载
await useDownload(api.exportUsers, {
  fileName: '用户列表',
  fileType: FileType.XLSX,
})

// Excel 导入导出
const excel = useExcel()
await excel.exportToExcel(data, { fileName: '数据' })

// 复制到剪贴板
const copy = useCopy()
await copy.copyJSON({ name: 'John' })
```

---

## 🔧 本地开发

### 目录结构

```
robot-admin-packages/          # 新建仓库
├── packages/
│   ├── form-validators/
│   └── hooks/
├── scripts/
│   ├── dev-link.ts           # 本地联调脚本
│   └── publish.ts            # 发布脚本
├── pnpm-workspace.yaml
└── package.json

Robot_Admin/                   # 主项目
├── src/
└── package.json
```

### 联调流程

```bash
# 1. 在 robot-admin-packages 目录
pnpm dev:link
# → 启动 watch 模式
# → 软链接到 Robot_Admin/node_modules

# 2. 在 Robot_Admin 目录
pnpm dev
# → 修改包代码 → 自动构建 → 主项目热更新 ✅

# 3. 取消联调
pnpm dev:unlink
```

---

## 📈 预期收益

### 代码瘦身

- 主项目代码: **-1600 行**
- 删除文件: **10+ 个**

### 复用性

- `@robot-admin/form-validators`: 所有 Vue + Naive UI 项目可用
- `@robot-admin/hooks`: 所有 Vue 项目可用

### 维护性

- 包独立维护、版本管理
- 主项目更清爽
- 跨项目复用，避免代码重复

---

## 📝 改造清单

### 创建包仓库

- [ ] 创建 `robot-admin-packages` 仓库
- [ ] 配置 pnpm workspace
- [ ] 创建包目录结构
- [ ] 编写 dev-link 脚本

### 拆分 form-validators

- [ ] 迁移 `src/utils/v_verify.ts`
- [ ] 拆分为 core、presets 模块
- [ ] 编写 README 和示例
- [ ] 本地测试
- [ ] 发布 npm

### 拆分 hooks

- [ ] 迁移 useDownload (289 行)
- [ ] 迁移 useExcel (320 行)
- [ ] 迁移 useCopy (506 行)
- [ ] 编写 README 和示例
- [ ] 测试 Excel 功能
- [ ] 发布 npm

### 主项目改造

- [ ] 安装包: `pnpm add @robot-admin/{form-validators,hooks}`
- [ ] 配置 Vite 自动导入
- [ ] 删除已迁移代码
- [ ] 全局功能测试
- [ ] 提交代码

---

## 💡 关键原则

> **拆分不是目的，提升开发体验才是目的**

1. ✅ **纯工具优先** - 先拆不依赖配置的纯工具类
2. ✅ **避免啰嗦** - 不能让使用变得更复杂
3. ✅ **实用主义** - 拆分要有明确收益
4. ✅ **渐进式** - 有需要时再拆分复杂模块

---

**最后更新**: 2026-02-07  
**文档版本**: v3.0 (整合版)
