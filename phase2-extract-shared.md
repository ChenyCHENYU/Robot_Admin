# 阶段二：提取共享代码（第 2-3 周）

## 目标

从 `apps/admin` 提取真正可复用的代码到 `packages/shared`，为未来的多应用做准备。

---

## 原则

**只提取真正共享的代码：**
- ✅ 通用工具函数（日期、字符串、数组处理等）
- ✅ 通用类型定义
- ✅ 通用常量和配置
- ✅ 通用 hooks（如果未来会复用）
- ❌ 业务逻辑（保留在 admin）
- ❌ 页面组件（保留在 admin）
- ❌ 路由配置（保留在 admin）

---

## 📦 packages/shared 目标结构

```
packages/shared/
├── src/
│   ├── utils/              # 工具函数
│   │   ├── date.ts        # 日期处理
│   │   ├── string.ts      # 字符串处理
│   │   ├── validate.ts    # 验证函数
│   │   ├── format.ts      # 格式化函数
│   │   └── index.ts
│   │
│   ├── types/              # 共享类型
│   │   ├── common.ts      # 通用类型
│   │   ├── api.ts         # API 类型
│   │   └── index.ts
│   │
│   ├── constants/          # 常量
│   │   ├── index.ts       # 通用常量
│   │   └── regex.ts       # 正则表达式
│   │
│   ├── hooks/              # 共享 hooks（可选）
│   │   └── index.ts
│   │
│   └── index.ts            # 主入口
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 步骤 1：分析现有代码

```bash
# 运行分析脚本
bash scripts/phase2-analyze-shared.sh
```

这个脚本会：
1. 列出所有 `utils/` 下的文件
2. 标记哪些是通用的
3. 生成迁移清单

---

## 步骤 2：创建共享包配置

### 2.1 更新 package.json

```json
{
  "name": "@robot/shared",
  "version": "1.0.0",
  "description": "Robot Admin 共享工具包",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./utils": "./src/utils/index.ts",
    "./types": "./src/types/index.ts",
    "./constants": "./src/constants/index.ts",
    "./hooks": "./src/hooks/index.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "typescript": "~5.8.0"
  }
}
```

### 2.2 创建 README

```markdown
# @robot/shared

Robot Admin 共享工具包

## 使用

\`\`\`typescript
// 在任何应用中导入
import { formatDate, validateEmail } from '@robot/shared'
import type { ApiResponse } from '@robot/shared/types'
\`\`\`

## 原则

只包含真正可复用的工具函数和类型，不包含业务逻辑。
```

---

## 步骤 3：渐进式迁移代码

### 3.1 迁移示例：日期工具

```bash
# 1. 从 admin 复制到 shared
cp apps/admin/src/utils/date.ts packages/shared/src/utils/

# 2. 在 shared 创建导出
cat >> packages/shared/src/utils/index.ts << 'EOF'
export * from './date'
EOF

cat >> packages/shared/src/index.ts << 'EOF'
export * from './utils'
EOF

# 3. 在 admin 中使用 shared 版本
# 修改 apps/admin/src/xxx.ts
# 从: import { formatDate } from '@/utils/date'
# 到: import { formatDate } from '@robot/shared'

# 4. 验证没有问题后，删除 admin 中的原文件
# rm apps/admin/src/utils/date.ts

# 5. 提交
git add .
git commit -m "refactor: extract date utils to shared package"
```

### 3.2 建议的迁移顺序

**Week 1:**
1. ✅ 通用工具函数（不依赖 Vue/Router/Store 的）
   - 日期处理
   - 字符串处理
   - 数字格式化
   - 验证函数

**Week 2:**
2. ✅ 类型定义
   - API 响应类型
   - 通用数据类型
   - 工具类型

3. ✅ 常量
   - 正则表达式
   - 枚举值
   - 配置常量

---

## 步骤 4：更新 admin 的导入

### 自动化替换脚本

```bash
# 运行导入路径更新脚本
bash scripts/phase2-update-imports.sh
```

这个脚本会：
1. 查找所有从 `@/utils/xxx` 导入的代码
2. 如果该 util 已迁移到 shared，自动替换为 `@robot/shared`
3. 生成变更报告

### 手动验证

```bash
# 搜索是否还有旧的导入路径
grep -r "from '@/utils" apps/admin/src/

# 类型检查
bun run type-check

# 测试运行
bun run dev
```

---

## 步骤 5：验证和测试

```bash
# 1. 检查 shared 包导出
cd packages/shared
bun run type-check

# 2. 在 admin 中测试
cd ../../
bun run dev

# 3. 构建测试
bun run build:admin
```

---

## 🎯 阶段二完成标志

- [x] `packages/shared` 包含了可复用的工具
- [x] `apps/admin` 成功使用 `@robot/shared`
- [x] 所有测试通过
- [x] 类型检查无错误
- [x] 应用正常运行

---

## ⚠️ 注意事项

### 不要过度提取

**错误示例 ❌：**
```typescript
// 不要提取业务逻辑
export function calculateUserPermission() { ... }  // 这是业务逻辑

// 不要提取 Vue 特定的东西
export function useUserStore() { ... }  // 保留在 admin
```

**正确示例 ✅：**
```typescript
// 提取纯函数
export function formatDate(date: Date): string { ... }

// 提取通用类型
export type ApiResponse<T> = { ... }
```

### 避免循环依赖

```
❌ 错误：
apps/admin -> @robot/shared -> apps/admin

✅ 正确：
apps/admin -> @robot/shared
```

### 保持语义化版本

每次修改 shared 包，更新版本号：
```bash
cd packages/shared
# 更新 package.json 的 version
git commit -m "feat(shared): add new utils"
```

---

## 📋 迁移检查清单

### 工具函数迁移
- [ ] 日期处理函数
- [ ] 字符串处理函数
- [ ] 数字格式化函数
- [ ] 验证函数（邮箱、手机号等）
- [ ] 文件处理函数
- [ ] URL 处理函数

### 类型定义迁移
- [ ] API 响应类型
- [ ] 分页类型
- [ ] 表单类型
- [ ] 通用数据类型

### 常量迁移
- [ ] 正则表达式
- [ ] 枚举值
- [ ] HTTP 状态码
- [ ] 错误代码

---

## 🚀 下一阶段

阶段二完成后，你将拥有：
- ✅ 一个可复用的共享包
- ✅ 清晰的代码组织
- ✅ 为多应用做好准备

阶段三将添加第二个应用，真正体现 Monorepo 的价值。
