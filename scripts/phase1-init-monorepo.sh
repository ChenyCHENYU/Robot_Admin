#!/bin/bash
set -e

echo "🚀 阶段一：初始化 Monorepo 基础架构"
echo "=========================================="

# 1. 创建新的目录结构
echo ""
echo "📁 步骤 1/6: 创建目录结构..."
mkdir -p apps/admin
mkdir -p packages/shared/src
mkdir -p .monorepo-backup

echo "✅ 目录结构创建完成"

# 2. 备份现有配置文件
echo ""
echo "💾 步骤 2/6: 备份重要配置..."
cp package.json .monorepo-backup/package.json.backup
cp tsconfig.json .monorepo-backup/tsconfig.json.backup
cp vite.config.ts .monorepo-backup/vite.config.ts.backup
echo "✅ 配置文件已备份到 .monorepo-backup/"

# 3. 移动代码到 apps/admin（保持 Git 历史）
echo ""
echo "📦 步骤 3/6: 移动代码到 apps/admin..."
echo "   ⚠️  这一步需要手动执行以保持 Git 历史"
echo ""
echo "   请执行以下命令："
echo "   git mv src apps/admin/"
echo "   git mv public apps/admin/"
echo "   git mv index.html apps/admin/"
echo "   git mv vite.config.ts apps/admin/"
echo "   git mv tsconfig apps/admin/"
echo "   git mv .env* apps/admin/ 2>/dev/null || true"
echo ""
read -p "完成后按 Enter 继续..."

echo "✅ 代码移动完成（需要手动执行 git mv）"

# 4. 创建根 package.json
echo ""
echo "📝 步骤 4/6: 创建根 package.json..."
cat > package.json << 'PKGEOF'
{
  "name": "robot-admin-monorepo",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "description": "Robot Admin Monorepo - 企业级多应用管理平台",
  "author": {
    "name": "ChenY",
    "email": "ycyplus@gmail.com",
    "url": "https://github.com/ChenyCHENYU"
  },
  "license": "MIT",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "bun --filter @robot/admin dev",
    "dev:admin": "bun --filter @robot/admin dev",
    "build": "bun run build:packages && bun run build:apps",
    "build:packages": "bun --filter './packages/*' build",
    "build:apps": "bun --filter './apps/*' build",
    "build:admin": "bun --filter @robot/admin build",
    "preview:admin": "bun --filter @robot/admin preview",
    "lint": "bun --filter './apps/*' lint",
    "lint:fix": "bun --filter './apps/*' lint:fix",
    "type-check": "bun --filter './apps/*' type-check",
    "clean": "rm -rf apps/*/dist packages/*/dist",
    "clean:modules": "rm -rf node_modules apps/*/node_modules packages/*/node_modules",
    "fresh": "bun run clean:modules && bun install"
  },
  "devDependencies": {
    "@types/node": "^22.13.9",
    "typescript": "~5.8.0"
  },
  "engines": {
    "bun": ">=1.2.19",
    "node": ">=20.19.0"
  }
}
PKGEOF
echo "✅ 根 package.json 创建完成"

# 5. 创建 Bun 配置
echo ""
echo "⚙️  步骤 5/6: 创建 Bun 配置..."
cat > .bunfig.toml << 'EOF'
[install]
# 启用 workspace
workspace = true

# 自动安装 peer dependencies
auto = "auto"

# 缓存配置
cache = true
cache-dir = ".bun-cache"

# 更快的安装
production = false
frozen-lockfile = false

[install.scopes]
# 可以配置私有 npm registry
# "@robot" = { url = "https://registry.npmjs.org/" }
EOF
echo "✅ Bun 配置创建完成"

# 6. 创建根 tsconfig.json
echo ""
echo "📝 步骤 6/6: 创建根 tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@robot/*": ["packages/*/src"]
    }
  },
  "references": [
    { "path": "./apps/admin" },
    { "path": "./packages/shared" }
  ]
}
EOF
echo "✅ 根 tsconfig.json 创建完成"

echo ""
echo "=========================================="
echo "✅ 阶段一初始化完成！"
echo ""
echo "📋 下一步手动操作："
echo "   1. 执行 git mv 命令移动文件（见上面的提示）"
echo "   2. 更新 apps/admin/package.json 的 name 为 @robot/admin"
echo "   3. 更新 apps/admin/tsconfig.json 继承根配置"
echo "   4. 运行 bun install 安装依赖"
echo "   5. 运行 bun run dev 测试"
echo ""
echo "📝 详细步骤请查看 phase1-manual-steps.md"
