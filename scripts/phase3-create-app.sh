#!/bin/bash
set -e

APP_NAME=$1
BASE_APP="robot-admin-internal"
PORT=$2

if [ -z "$APP_NAME" ]; then
  echo "❌ 错误：请提供应用名称"
  echo "用法: bash scripts/phase3-create-app.sh <app-name> [port]"
  echo "示例: bash scripts/phase3-create-app.sh mobile 1990"
  exit 1
fi

if [ -z "$PORT" ]; then
  PORT=1990
fi

if [ -d "apps/$APP_NAME" ]; then
  echo "❌ 错误：应用 apps/$APP_NAME 已存在"
  exit 1
fi

echo "🚀 基于 $BASE_APP 创建新应用: @robot/admin-$APP_NAME"
echo "   端口: $PORT"
echo "=========================================="

# 1. 复制基线应用
echo ""
echo "📁 步骤 1/5: 复制基线应用结构..."
cp -r "apps/$BASE_APP" "apps/robot-admin-$APP_NAME"
echo "✅ 目录复制完成"

# 2. 清理构建产物和临时文件
echo ""
echo "🧹 步骤 2/5: 清理临时文件..."
cd "apps/robot-admin-$APP_NAME"
rm -rf dist node_modules .env
echo "✅ 清理完成"

# 3. 更新 package.json
echo ""
echo "📝 步骤 3/5: 更新 package.json..."
sed -i "s/@robot\/admin-internal/@robot\/admin-$APP_NAME/g" package.json
sed -i "s/\"name\": \"robot-admin-internal\"/\"name\": \"robot-admin-$APP_NAME\"/g" package.json
sed -i "s/Robot Admin Internal/Robot Admin ${APP_NAME^}/g" package.json
echo "✅ package.json 更新完成"

# 4. 更新 vite.config.ts 端口
echo ""
echo "⚙️  步骤 4/5: 更新 vite.config.ts 端口..."
sed -i "s/port: 1988/port: $PORT/g" vite.config.ts
echo "✅ vite.config.ts 更新完成"

# 5. 更新环境变量文件
echo ""
echo "🔧 步骤 5/5: 更新环境变量..."
if [ -d "envs" ]; then
  for env_file in envs/.env*; do
    if [ -f "$env_file" ]; then
      sed -i "s/Robot Admin Internal/Robot Admin ${APP_NAME^}/g" "$env_file"
      sed -i "s/robot-admin-internal/robot-admin-$APP_NAME/g" "$env_file"
    fi
  done
fi
echo "✅ 环境变量更新完成"

cd ../..

echo ""
echo "=========================================="
echo "✅ 应用 @robot/admin-$APP_NAME 创建完成！"
echo ""
echo "📋 目录结构："
echo "   apps/robot-admin-$APP_NAME/"
echo "   ├── src/           # 源码（已包含完整结构）"
echo "   ├── scripts/       # 应用特定脚本"
echo "   ├── lang/          # 国际化"
echo "   ├── envs/          # 环境配置"
echo "   └── public/        # 静态资源"
echo ""
echo "📋 下一步操作："
echo ""
echo "   1. 在根 package.json 添加快捷命令："
echo "      \"dev:$APP_NAME\": \"bun --filter @robot/admin-$APP_NAME dev\","
echo "      \"build:$APP_NAME\": \"bun --filter @robot/admin-$APP_NAME build\","
echo "      \"preview:$APP_NAME\": \"bun --filter @robot/admin-$APP_NAME preview\""
echo ""
echo "   2. 安装依赖并启动："
echo "      bun install"
echo "      bun run dev:$APP_NAME"
echo ""
echo "   3. 访问地址："
echo "      http://localhost:$PORT"
echo ""
echo "🎉 Happy coding!"
