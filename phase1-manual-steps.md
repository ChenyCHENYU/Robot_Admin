# 阶段一：手动操作步骤

## ⚠️ 重要提示

在执行任何操作前，确保：

1. 已提交所有未提交的更改：`git add . && git commit -m "chore: prepare for monorepo migration"`
2. 已创建备份分支：`git branch backup-before-monorepo`
3. 当前在 `feature/monorepo-migration` 分支

---

## 步骤 1：运行初始化脚本

```bash
bash scripts/phase1-init-monorepo.sh
```

脚本会暂停并要求你手动执行 `git mv` 命令。

---

## 步骤 2：手动移动文件（保持 Git 历史）

**为什么要手动执行？**
使用 `git mv` 而不是普通 `mv` 可以保留文件的 Git 历史记录。

```bash
# 移动主要目录
git mv src apps/admin/
git mv public apps/admin/
git mv index.html apps/admin/

# 移动配置文件
git mv vite.config.ts apps/admin/
git mv tsconfig apps/admin/
git mv unocss.config.ts apps/admin/
git mv eslint.config.ts apps/admin/

# 移动环境变量文件（如果存在）
git mv .env apps/admin/ 2>/dev/null || true
git mv .env.development apps/admin/ 2>/dev/null || true
git mv .env.production apps/admin/ 2>/dev/null || true

# 移动其他项目特定文件
git mv envs apps/admin/ 2>/dev/null || true

# 提交移动操作
git add .
git commit -m "refactor: move existing app to apps/admin structure"
```

---

## 步骤 3：更新 apps/admin/package.json

打开 `apps/admin/package.json`，修改以下内容：

```json
{
  "name": "@robot/admin", // ← 改为带 scope 的名字
  "version": "2.0.0", // ← 更新版本号（可选）
  "private": true // ← 保持为 private
  // ... 其他保持不变
}
```

---

## 步骤 4：更新 apps/admin/tsconfig.json

修改 `apps/admin/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.json", // ← 继承根配置
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@robot/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

---

## 步骤 5：创建 packages/shared 占位包

```bash
# 创建基础文件
cat > packages/shared/package.json << 'EOF'
{
  "name": "@robot/shared",
  "version": "1.0.0",
  "description": "Robot Admin 共享工具包",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

cat > packages/shared/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

cat > packages/shared/src/index.ts << 'EOF'
// Robot Admin 共享工具包
// 阶段二将从 apps/admin 提取共享代码到这里

export const version = '1.0.0'

// 占位函数
export function log(message: string) {
  console.log(`[Robot Shared] ${message}`)
}
EOF

# 提交
git add packages/
git commit -m "feat: create shared package placeholder"
```

---

## 步骤 6：安装依赖

```bash
# 安装所有依赖
bun install

# 如果出现问题，尝试清理缓存
rm -rf node_modules bun.lock
bun install
```

---

## 步骤 7：验证配置

```bash
# 1. 检查 workspace 是否正确识别
bun pm ls

# 应该看到：
# ├── @robot/admin
# └── @robot/shared

# 2. 启动开发服务器
bun run dev

# 3. 检查类型
bun run type-check

# 4. 检查构建
bun run build:admin
```

---

## 步骤 8：提交最终配置

```bash
git add .
git commit -m "feat: complete phase 1 - monorepo basic structure"
git push origin feature/monorepo-migration
```

---

## 🎉 阶段一完成标志

如果以下所有项都成功，说明阶段一完成：

- [x] 目录结构正确（apps/admin, packages/shared）
- [x] `bun install` 成功
- [x] `bun run dev` 可以正常启动
- [x] 页面可以正常访问和使用
- [x] `bun run build` 构建成功
- [x] 没有类型错误

---

## ⚠️ 常见问题

### Q1: `git mv` 提示文件不存在

**原因：** 文件已经移动过或不存在

**解决：** 跳过该文件，继续下一个

### Q2: `bun install` 提示依赖冲突

**解决：**

```bash
rm -rf node_modules bun.lock
bun install --force
```

### Q3: 开发服务器启动失败

**检查：**

1. `apps/admin/vite.config.ts` 路径是否正确
2. `apps/admin/index.html` 是否存在
3. 查看终端错误信息

**解决：**

```bash
cd apps/admin
bun run dev  # 直接在 admin 目录启动
```

### Q4: 类型检查报错

**原因：** tsconfig.json 路径映射不正确

**解决：** 检查 `apps/admin/tsconfig.json` 的 paths 配置

---

## 📋 下一阶段预告

阶段一完成后，系统会：

- ✅ 完全正常运行（和之前一样）
- ✅ 支持 Monorepo 结构
- ✅ 为多应用做好准备

阶段二将：

- 🔄 提取共享工具到 `packages/shared`
- 🎨 提取共享组件（可选）
- 📦 设置独立的共享包

阶段三将：

- ➕ 添加第二个应用（如 mobile-h5）
- 🔗 实现应用间代码共享
- 🚀 独立部署配置
