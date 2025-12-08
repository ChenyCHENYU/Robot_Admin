# Robot Admin Monorepo - 渐进式迁移指南

> **适用场景**：当前有1个成熟应用，未来需要支持多个应用的场景  
> **原则**：渐进式、实用主义、不过度设计  
> **周期**：3-6周（分3个阶段）

---

## 🎯 为什么需要 Monorepo？

### 你的场景
- ✅ 当前：1个成熟的 Admin 管理后台
- ✅ 未来：可能有多个应用（mobile、landing、admin-v2 等）
- ✅ 目标：
  - 共享代码（工具、类型、API、组件）
  - 独立部署（每个应用可单独发布）
  - 避免重复维护（不要像烟囱一样）
  - 统一的技术栈和规范

### 什么时候不需要 Monorepo？
- ❌ 只有1个应用，没有多应用计划
- ❌ 应用之间完全独立，没有共享需求
- ❌ 团队太小（1-2人），维护成本高

---

## 📊 三阶段对比

| 阶段 | 时间 | 目标 | 风险 | 价值 |
|------|------|------|------|------|
| **阶段一** | 1周 | 搭建基础架构 | ⭐ 低 | ⭐⭐⭐ |
| **阶段二** | 2-3周 | 提取共享代码 | ⭐⭐ 中 | ⭐⭐⭐⭐ |
| **阶段三** | 2-3周 | 添加新应用 | ⭐ 低 | ⭐⭐⭐⭐⭐ |

---

## 🚀 阶段一：基础架构（1周）

### 目标
将现有应用无缝迁移到 Monorepo 结构，保持100%功能正常。

### 最终结构
```
robot-admin-monorepo/
├── apps/
│   └── admin/              # 现有应用（完整迁移）
├── packages/
│   └── shared/             # 共享包（占位）
├── package.json            # 根配置
└── .bunfig.toml           # Bun 配置
```

### 执行步骤

#### 1. 运行初始化脚本
```bash
bash scripts/phase1-init-monorepo.sh
```

#### 2. 手动移动文件（保持 Git 历史）
```bash
# 使用 git mv 保留历史
git mv src apps/admin/
git mv public apps/admin/
git mv index.html apps/admin/
git mv vite.config.ts apps/admin/
git mv tsconfig apps/admin/

git add .
git commit -m "refactor: move to monorepo structure"
```

#### 3. 更新配置文件
- `apps/admin/package.json` 改名为 `@robot/admin`
- `apps/admin/tsconfig.json` 继承根配置

#### 4. 安装并测试
```bash
bun install
bun run dev      # 应该正常启动
bun run build    # 应该正常构建
```

### 完成标志
- ✅ 应用正常运行（和之前一样）
- ✅ 没有功能损失
- ✅ 支持 Monorepo 结构
- ✅ 为后续阶段做好准备

**详细步骤：** 查看 `phase1-manual-steps.md`

---

## 📦 阶段二：提取共享代码（2-3周）

### 目标
识别并提取可复用的代码到 `packages/shared`。

### 提取原则

#### 应该提取 ✅
- 通用工具函数（日期、字符串、验证等）
- 类型定义
- 常量和配置
- API 调用函数
- 纯业务逻辑（如果多个应用需要）

#### 不应该提取 ❌
- 页面组件（保留在各应用中）
- 路由配置（应用特定）
- 状态管理（应用特定）
- 应用特定的样式

### 执行步骤

#### 1. 分析现有代码
```bash
# 列出可能需要提取的工具函数
ls -la apps/admin/src/utils/
```

#### 2. 渐进式迁移
```bash
# 示例：迁移日期工具
cp apps/admin/src/utils/date.ts packages/shared/src/utils/

# 在 admin 中使用
# 从: import { formatDate } from '@/utils/date'
# 到: import { formatDate } from '@robot/shared'

# 验证后删除原文件
rm apps/admin/src/utils/date.ts
```

#### 3. 更新导入路径
```bash
# 批量更新（小心使用）
bash scripts/phase2-update-imports.sh
```

### 建议的迁移顺序
1. 第1周：工具函数（date, string, validate, format）
2. 第2周：类型定义 + 常量
3. 第3周：API 函数（可选）

### 完成标志
- ✅ `packages/shared` 包含可复用代码
- ✅ `apps/admin` 成功使用 `@robot/shared`
- ✅ 应用正常运行
- ✅ 类型检查通过

**详细步骤：** 查看 `phase2-extract-shared.md`

---

## 🎨 阶段三：添加新应用（2-3周）

### 目标
添加第二个应用，展示 Monorepo 的真正价值。

### 应用示例
- **@robot/mobile** - 移动端 H5 应用
- **@robot/landing** - 产品官网
- **@robot/admin-v2** - 新版管理后台

### 最终结构
```
robot-admin-monorepo/
├── apps/
│   ├── admin/              # 现有管理后台
│   └── mobile/             # 新增移动端 🆕
├── packages/
│   ├── shared/             # 共享工具
│   └── ui-mobile/          # 移动端组件库（可选）🆕
```

### 执行步骤

#### 1. 快速创建新应用
```bash
bash scripts/phase3-create-app.sh mobile
```

#### 2. 配置新应用
- 设置不同的端口（避免冲突）
- 配置独立的路由
- 使用共享包

#### 3. 代码共享示例
```typescript
// apps/admin 和 apps/mobile 都使用
import { formatDate, validateEmail } from '@robot/shared'
import type { User, ApiResponse } from '@robot/shared/types'
```

#### 4. 独立开发和部署
```bash
# 同时开发两个应用
bun run dev:all

# 独立构建
bun run build:admin
bun run build:mobile

# 独立部署（CI/CD）
```

### 完成标志
- ✅ 新应用创建成功
- ✅ 可以独立运行和构建
- ✅ 成功使用共享代码
- ✅ 两个应用可以同时开发
- ✅ 可以独立部署

**详细步骤：** 查看 `phase3-add-new-app.md`

---

## 📋 完整检查清单

### 阶段一
- [ ] 运行 `phase1-init-monorepo.sh`
- [ ] 执行 `git mv` 移动文件
- [ ] 更新 `apps/admin/package.json`
- [ ] 更新 `apps/admin/tsconfig.json`
- [ ] `bun install` 成功
- [ ] `bun run dev` 正常启动
- [ ] `bun run build` 正常构建
- [ ] 应用功能完全正常

### 阶段二
- [ ] 分析现有代码
- [ ] 创建 `packages/shared` 结构
- [ ] 迁移工具函数
- [ ] 迁移类型定义
- [ ] 迁移常量
- [ ] 更新导入路径
- [ ] 类型检查通过
- [ ] 应用正常运行

### 阶段三
- [ ] 运行 `phase3-create-app.sh`
- [ ] 配置新应用
- [ ] 实现代码共享
- [ ] 两个应用可以同时开发
- [ ] 配置 CI/CD
- [ ] 可以独立部署

---

## 🛠️ 常用命令

### 开发
```bash
# 开发单个应用
bun run dev:admin
bun run dev:mobile

# 同时开发所有应用
bun run dev:all
```

### 构建
```bash
# 构建所有
bun run build

# 构建单个
bun run build:admin
bun run build:mobile
```

### 其他
```bash
# 类型检查
bun run type-check

# 代码检查
bun run lint

# 清理
bun run clean

# 重新安装
bun run fresh
```

---

## 📊 对比：迁移前 vs 迁移后

| 维度 | 迁移前 | 迁移后 |
|------|--------|--------|
| **应用数量** | 1个 | 多个（可扩展） |
| **代码复用** | ❌ 复制粘贴 | ✅ 包级别共享 |
| **部署方式** | 单一 | 独立部署 |
| **维护成本** | 高（重复代码） | 低（统一维护） |
| **开发效率** | 一般 | 高（代码复用） |
| **类型安全** | 应用内 | 跨应用 |
| **技术栈** | 单一 | 统一管理 |

---

## ⚠️ 注意事项

### 1. Git 历史保留
使用 `git mv` 而不是普通 `mv`，保留文件历史。

### 2. 渐进式迁移
不要一次性迁移所有代码，先迁移最简单的部分。

### 3. 充分测试
每个阶段完成后都要充分测试，确保功能正常。

### 4. 避免过度提取
只提取真正需要共享的代码，不要为了"看起来整洁"而过度抽象。

### 5. 保持简单
不要引入过多的工具和配置，保持架构简单实用。

---

## 🎯 成功标准

### 技术层面
- ✅ 所有应用正常运行
- ✅ 构建流程顺畅
- ✅ 类型检查无错误
- ✅ 代码可以共享
- ✅ 可以独立部署

### 团队层面
- ✅ 团队理解 Monorepo 工作流
- ✅ 开发效率提升
- ✅ 维护成本降低
- ✅ 代码质量提高

---

## 📚 相关文档

- [阶段一详细步骤](./phase1-manual-steps.md)
- [阶段二详细步骤](./phase2-extract-shared.md)
- [阶段三详细步骤](./phase3-add-new-app.md)
- [你的完整方案](./monorepo.md)（保留作为学习参考）

---

## 🤝 需要帮助？

如果在迁移过程中遇到问题：

1. 查看对应阶段的详细文档
2. 检查完整检查清单
3. 查看常见问题部分
4. 回滚到上一个稳定状态

---

## 🎉 总结

这个渐进式方案：
- ✅ **低风险**：每个阶段都可以回滚
- ✅ **实用**：只添加真正需要的功能
- ✅ **渐进**：可以根据需要调整节奏
- ✅ **面向未来**：为多应用做好准备

**记住：** 不要为了 Monorepo 而 Monorepo，要为了解决实际问题而采用 Monorepo。

---

**版本**: v1.0  
**更新时间**: 2025-12-08  
**状态**: ✅ 生产就绪
