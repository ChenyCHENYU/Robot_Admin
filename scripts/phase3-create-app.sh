#!/bin/bash
set -e

APP_NAME=$1

if [ -z "$APP_NAME" ]; then
  echo "❌ 错误：请提供应用名称"
  echo "用法: bash scripts/phase3-create-app.sh <app-name>"
  echo "示例: bash scripts/phase3-create-app.sh mobile"
  exit 1
fi

echo "🚀 创建新应用: @robot/$APP_NAME"
echo "=========================================="

# 1. 创建目录结构
echo ""
echo "📁 步骤 1/7: 创建目录结构..."
mkdir -p "apps/$APP_NAME"/{src/{views,components,styles,router},public}
echo "✅ 目录创建完成"

# 2. 创建 package.json
echo ""
echo "📝 步骤 2/7: 创建 package.json..."
cat > "apps/$APP_NAME/package.json" << EOF
{
  "name": "@robot/$APP_NAME",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@robot/shared": "workspace:*",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^3.0.1",
    "@vueuse/core": "^11.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^7.0.6",
    "vue-tsc": "^2.2.8",
    "typescript": "~5.8.0",
    "sass": "^1.70.0"
  }
}
EOF
echo "✅ package.json 创建完成"

# 3. 创建 vite.config.ts
echo ""
echo "⚙️  步骤 3/7: 创建 vite.config.ts..."
cat > "apps/$APP_NAME/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@robot/shared': resolve(__dirname, '../../packages/shared/src')
    }
  },

  server: {
    port: 3002,
    host: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
EOF
echo "✅ vite.config.ts 创建完成"

# 4. 创建 tsconfig.json
echo ""
echo "📝 步骤 4/7: 创建 tsconfig.json..."
cat > "apps/$APP_NAME/tsconfig.json" << 'EOF'
{
  "extends": "../../tsconfig.json",
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
EOF
echo "✅ tsconfig.json 创建完成"

# 5. 创建基础源码文件
echo ""
echo "📝 步骤 5/7: 创建基础源码文件..."

# App.vue
cat > "apps/$APP_NAME/src/App.vue" << 'EOF'
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('App mounted')
})
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
EOF

# main.ts
cat > "apps/$APP_NAME/src/main.ts" << 'EOF'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 使用共享工具
import { log } from '@robot/shared'

async function bootstrap() {
  log('App Starting...')

  const app = createApp(App)
  
  // 状态管理
  const pinia = createPinia()
  app.use(pinia)

  // 路由
  app.use(router)

  // 等待路由准备就绪
  await router.isReady()

  // 挂载应用
  app.mount('#app')
  
  log('App Started!')
}

bootstrap().catch(console.error)
EOF

# router/index.ts
cat > "apps/$APP_NAME/src/router/index.ts" << 'EOF'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    }
  ]
})

export default router
EOF

# views/Home.vue
cat > "apps/$APP_NAME/src/views/Home.vue" << EOF
<template>
  <div class="home">
    <h1>Welcome to @robot/$APP_NAME</h1>
    <p>{{ message }}</p>
    <p>Current time: {{ formattedTime }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { log } from '@robot/shared'

const message = ref('This is a new application in the Robot Admin Monorepo')
const currentTime = ref(new Date())

const formattedTime = computed(() => {
  return currentTime.value.toLocaleString()
})

log('Home page loaded')
</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;

  h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #666;
    margin: 0.5rem 0;
  }
}
</style>
EOF

echo "✅ 源码文件创建完成"

# 6. 创建 index.html
echo ""
echo "📝 步骤 6/7: 创建 index.html..."
cat > "apps/$APP_NAME/index.html" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@robot/$APP_NAME</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF
echo "✅ index.html 创建完成"

# 7. 创建 README
echo ""
echo "📝 步骤 7/7: 创建 README.md..."
cat > "apps/$APP_NAME/README.md" << EOF
# @robot/$APP_NAME

## 开发

\`\`\`bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 或在根目录运行
bun --filter @robot/$APP_NAME dev
\`\`\`

## 构建

\`\`\`bash
# 构建生产版本
bun run build

# 或在根目录运行
bun --filter @robot/$APP_NAME build
\`\`\`

## 预览

\`\`\`bash
bun run preview
\`\`\`

## 特性

- ✅ Vue 3 + TypeScript
- ✅ Vite 7
- ✅ Vue Router
- ✅ Pinia
- ✅ 使用 @robot/shared 共享包
EOF
echo "✅ README.md 创建完成"

echo ""
echo "=========================================="
echo "✅ 应用 @robot/$APP_NAME 创建完成！"
echo ""
echo "📋 下一步操作："
echo "   1. cd apps/$APP_NAME"
echo "   2. bun install"
echo "   3. bun run dev"
echo ""
echo "或在根目录运行："
echo "   bun install"
echo "   bun --filter @robot/$APP_NAME dev"
echo ""
echo "🎉 Happy coding!"
