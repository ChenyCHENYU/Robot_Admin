# Robot Admin Monorepo 完整执行方案（终极版）

> **作者**: CHENY <ycyplus@gmail.com>  
> **团队**: 3人 | **周期**: 4周 | **NPM**: @agile-team  
> **原则**: 够用就好，不过度设计  
> **版本**: v2.0 Complete - 包含所有必需步骤

---

## 📦 最终包结构

```
robot-admin-monorepo/
├── packages/
│   ├── core/                    # 核心功能包
│   │   ├── src/
│   │   │   ├── router/         # 路由管理
│   │   │   ├── stores/         # 状态管理
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── api/            # API封装
│   │   │   ├── types/          # 类型定义
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── ui/                      # UI组件库（组件+指令+Hooks）
│   │   ├── src/
│   │   │   ├── components/     # 30+ 全局组件
│   │   │   ├── directives/     # 7个自定义指令
│   │   │   ├── hooks/          # 8个自定义Hooks
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── business/                # 业务模块包
│   │   ├── src/
│   │   │   ├── auth/           # 认证授权
│   │   │   ├── permission/     # 权限管理
│   │   │   ├── i18n/           # 国际化
│   │   │   ├── theme/          # 主题系统
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── integrations/            # 第三方集成包
│   │   ├── src/
│   │   │   ├── naive-ui/       # Naive UI配置
│   │   │   ├── echarts/        # ECharts封装
│   │   │   ├── antv/           # AntV X6封装
│   │   │   ├── wangeditor/     # 富文本编辑器
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── apps/
│       └── admin/               # 管理后台主应用
│           ├── src/
│           │   ├── views/      # 页面组件
│           │   ├── styles/     # 样式文件
│           │   ├── assets/     # 静态资源
│           │   ├── App.vue
│           │   └── main.ts
│           ├── public/
│           ├── index.html
│           ├── package.json
│           └── vite.config.ts
│
├── scripts/                     # 自动化脚本
│   ├── init-structure.sh       # 初始化目录结构
│   ├── replace-imports.sh      # 🆕 批量替换导入路径
│   ├── generate-package-readme.sh  # 🆕 生成包README
│   ├── verify-build.sh         # 验证构建
│   └── benchmark.ts            # 性能测试
│
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD配置
│
├── package.json                 # 根配置
├── .bunfig.toml                # Bun配置
├── tsconfig.json               # TypeScript配置
├── .changeset/                 # 版本管理
│   └── config.json
├── .gitignore
└── README.md
```

---

## 🚀 第一周：基础架构搭建

### Day 1: 创建分支和目录结构

**1.1 创建功能分支**

```bash
# 确保在最新的develop分支
git checkout develop
git pull origin develop

# 创建monorepo迁移分支
git checkout -b feature/monorepo-migration

# 备份当前项目（可选但推荐）
git tag backup-before-monorepo
```

**1.2 创建目录结构脚本**

```bash
# 创建 scripts 目录
mkdir -p scripts

# 创建初始化脚本
cat > scripts/init-structure.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 初始化 Robot Admin Monorepo 结构..."

# 创建包目录
mkdir -p packages/{core,ui,business,integrations}/src
mkdir -p packages/apps/admin/{src,public}

# 创建源码子目录
mkdir -p packages/core/src/{router,stores,utils,api,types}
mkdir -p packages/ui/src/{components,directives,hooks}
mkdir -p packages/business/src/{auth,permission,i18n,theme}
mkdir -p packages/integrations/src/{naive-ui,echarts,antv,wangeditor}
mkdir -p packages/apps/admin/src/{views,styles,assets}

echo "✅ 目录结构创建完成"
tree -L 3 packages/ -I 'node_modules|dist'
EOF

# 添加执行权限
chmod +x scripts/init-structure.sh

# 执行初始化
bash scripts/init-structure.sh
```

**1.3 验证目录结构**

```bash
# 检查目录是否创建成功
ls -la packages/
ls -la packages/core/src/
ls -la packages/ui/src/

# 应该看到所有预期的目录
```

---

### Day 2: 根配置文件

**2.1 根 package.json**

```bash
cat > package.json << 'EOF'
{
  "name": "robot-admin-monorepo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "author": "CHENY <ycyplus@gmail.com>",
  "license": "MIT",
  "workspaces": [
    "packages/*",
    "packages/apps/*"
  ],
  "scripts": {
    "dev": "bun --filter @agile-team/admin dev",
    "dev:admin": "bun --filter @agile-team/admin dev",

    "build": "bun run build:packages && bun run build:apps",
    "build:packages": "bun --filter './packages/*' --filter '!./packages/apps/*' build",
    "build:apps": "bun --filter './packages/apps/*' build",
    "build:core": "bun --filter @agile-team/core build",
    "build:ui": "bun --filter @agile-team/ui build",
    "build:business": "bun --filter @agile-team/business build",
    "build:integrations": "bun --filter @agile-team/integrations build",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"packages/**/*.{ts,tsx,vue,json,md}\"",
    "type-check": "vue-tsc --noEmit --composite false",

    "clean": "rm -rf packages/*/dist packages/apps/*/dist",
    "clean:cache": "rm -rf .bun-cache .vite-cache node_modules/.cache",
    "clean:all": "bun run clean && bun run clean:cache && rm -rf node_modules",

    "changeset": "changeset",
    "version": "changeset version",
    "release": "bun run build && changeset publish",

    "verify": "bash scripts/verify-build.sh",
    "benchmark": "bun scripts/benchmark.ts"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@types/node": "^22.13.9",
    "@vitejs/plugin-vue": "^5.2.1",
    "bun-types": "latest",
    "eslint": "^9.21.0",
    "prettier": "^3.5.3",
    "typescript": "~5.8.0",
    "vite": "^7.0.6",
    "vite-plugin-dts": "^3.9.0",
    "vue-tsc": "^2.2.8"
  },
  "engines": {
    "bun": ">=1.2.19",
    "node": ">=20.19.0"
  }
}
EOF
```

**2.2 Bun 配置**

```bash
cat > .bunfig.toml << 'EOF'
[install]
workspace = true
cache = true
cache-dir = ".bun-cache"
max-age = 604800

[build]
target = "browser"
minify = true
sourcemap = true
EOF
```

**2.3 TypeScript 配置**

```bash
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
    "jsx": "preserve",
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@agile-team/*": ["packages/*/src"]
    }
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/business" },
    { "path": "./packages/integrations" },
    { "path": "./packages/apps/admin" }
  ]
}
EOF
```

**2.4 Git 配置**

```bash
cat > .gitignore << 'EOF'
# 依赖
node_modules/
.bun-cache/

# 构建产物
dist/
build/
*.local

# 缓存
.vite-cache/
coverage/

# 环境变量
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系统
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*
EOF
```

**2.5 安装依赖**

```bash
# 安装根依赖
bun install

# 初始化 Changesets
bun changeset init
```

**2.6 配置 Changesets**

```bash
cat > .changeset/config.json << 'EOF'
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": true,
  "linked": [
    ["@agile-team/core", "@agile-team/ui", "@agile-team/business"]
  ],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
EOF
```

**2.7 提交基础架构**

```bash
git add .
git commit -m "feat: initialize monorepo structure"
git push origin feature/monorepo-migration
```

---

## 📦 第二周：Core 和 UI 包迁移

### Day 3-4: 创建 Core 包

**3.1 创建 Core 包配置**

```bash
cat > packages/core/package.json << 'EOF'
{
  "name": "@agile-team/core",
  "version": "1.0.0",
  "description": "Robot Admin 核心功能包",
  "author": "CHENY <ycyplus@gmail.com>",
  "license": "MIT",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./router": {
      "import": "./dist/router/index.js",
      "types": "./dist/router/index.d.ts"
    },
    "./stores": {
      "import": "./dist/stores/index.js",
      "types": "./dist/stores/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "types": "./dist/utils/index.d.ts"
    },
    "./api": {
      "import": "./dist/api/index.js",
      "types": "./dist/api/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "sideEffects": false,
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^3.0.1",
    "axios": "^1.7.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@types/node": "^22.13.9",
    "typescript": "~5.8.0",
    "vite": "^7.0.6",
    "vite-plugin-dts": "^3.9.0"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  }
}
EOF
```

**3.2 创建 Core Vite 配置**

```bash
cat > packages/core/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgileTeamCore',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'dayjs',
        /^@agile-team\//
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          axios: 'axios',
          dayjs: 'dayjs'
        }
      }
    }
  },
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true
    })
  ]
})
EOF
```

**3.3 创建 Core TypeScript 配置**

```bash
cat > packages/core/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

**3.4 迁移 Core 源码**

```bash
# 迁移路由
cp -r src/router/* packages/core/src/router/

# 迁移状态管理
cp -r src/stores/* packages/core/src/stores/

# 迁移工具函数
cp -r src/utils/* packages/core/src/utils/

# 迁移 API
cp -r src/api/* packages/core/src/api/

# 迁移类型定义
cp -r src/types/* packages/core/src/types/
```

**3.5 创建 Core 主入口文件**

```bash
cat > packages/core/src/index.ts << 'EOF'
// 导出路由
export * from './router'

// 导出状态管理
export * from './stores'

// 导出工具函数
export * from './utils'

// 导出 API
export * from './api'

// 导出类型
export * from './types'
EOF
```

**🆕 3.6 创建 Core 子目录入口文件**

```bash
echo "🆕 创建 Core 包子目录入口文件..."

# 创建 router 入口文件
cat > packages/core/src/router/index.ts << 'EOF'
// 导出所有路由相关模块
export * from './dynamicRouter'
export * from './permission'
export * from './staticRouter'
export { default as router } from './index'
// 根据你的实际路由文件调整
EOF

# 创建 stores 入口文件
cat > packages/core/src/stores/index.ts << 'EOF'
// 导出所有 store
export { s_userStore } from './user'
export { s_appStore } from './app'
export { s_themeStore } from './theme'
export { s_reLoginStore } from './reLogin'
// 根据你的实际 stores 添加
EOF

# 创建 utils 入口文件
cat > packages/core/src/utils/index.ts << 'EOF'
// 导出所有工具函数
export * from './d_auth'
export * from './d_menu'
export * from './d_route'
export * from './v_verify'
export * from './errorHandler'
// 根据你的实际工具函数添加
EOF

# 创建 api 入口文件
cat > packages/core/src/api/index.ts << 'EOF'
// 导出所有 API 模块
export * from './request'
export * from './endpoints'
// 根据你的实际 API 模块添加
EOF

# 创建 types 入口文件
cat > packages/core/src/types/index.ts << 'EOF'
// 导出所有类型定义
export * from './user'
export * from './menu'
export * from './route'
export * from './api'
// 根据你的实际类型添加
EOF

echo "✅ Core 子目录入口文件创建完成"
```

**3.7 安装 Core 依赖并构建**

```bash
cd packages/core
bun install
bun run build

# 验证构建产物
ls -la dist/
# 应该看到: index.js, index.cjs, index.d.ts, router/, stores/, utils/, api/, types/

cd ../..
```

---

### Day 5-6: 创建 UI 包

**5.1 创建 UI 包配置**

```bash
cat > packages/ui/package.json << 'EOF'
{
  "name": "@agile-team/ui",
  "version": "1.0.0",
  "description": "Robot Admin UI组件库（组件+指令+Hooks）",
  "author": "CHENY <ycyplus@gmail.com>",
  "license": "MIT",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./components": {
      "import": "./dist/components/index.js",
      "types": "./dist/components/index.d.ts"
    },
    "./components/*": {
      "import": "./dist/components/*/index.js",
      "types": "./dist/components/*/index.d.ts"
    },
    "./directives": {
      "import": "./dist/directives/index.js",
      "types": "./dist/directives/index.d.ts"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js",
      "types": "./dist/hooks/index.d.ts"
    },
    "./style": "./dist/style.css"
  },
  "files": ["dist", "README.md"],
  "sideEffects": ["*.css", "*.scss"],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "dependencies": {
    "@agile-team/core": "workspace:*",
    "naive-ui": "^2.41.0",
    "@iconify/vue": "^5.0.0",
    "unocss": "^0.66.0",
    "@vueuse/core": "^11.0.0",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "sass": "^1.70.0",
    "typescript": "~5.8.0",
    "vite": "^7.0.6",
    "vite-plugin-dts": "^3.9.0"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  }
}
EOF
```

**5.2 创建 UI Vite 配置**

```bash
cat > packages/ui/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgileTeamUI',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: [
        'vue',
        'naive-ui',
        '@iconify/vue',
        'unocss',
        '@vueuse/core',
        /^@agile-team\//
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'naive-ui': 'NaiveUI',
          '@vueuse/core': 'VueUse'
        }
      }
    },
    cssCodeSplit: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "sass:math";`
      }
    }
  },
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      exclude: ['**/*.spec.ts', '**/*.test.ts']
    })
  ]
})
EOF
```

**5.3 创建 UI TypeScript 配置**

```bash
cat > packages/ui/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

**5.4 迁移 UI 源码**

```bash
# 迁移全局组件
cp -r src/components/global/* packages/ui/src/components/

# 迁移自定义指令
cp -r src/directives/* packages/ui/src/directives/

# 迁移自定义 Hooks
cp -r src/hooks/* packages/ui/src/hooks/
```

**5.5 创建 UI 主入口文件**

```bash
cat > packages/ui/src/index.ts << 'EOF'
import type { App } from 'vue'

// 导出所有组件
export * from './components'

// 导出所有指令
export * from './directives'

// 导出所有 hooks
export * from './hooks'

// Vue 插件安装方法
import * as components from './components'
import * as directives from './directives'

export default {
  install(app: App) {
    // 注册组件
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })

    // 注册指令
    Object.entries(directives).forEach(([name, directive]) => {
      const directiveName = name.replace(/^v/, '').toLowerCase()
      app.directive(directiveName, directive)
    })
  }
}
EOF
```

**🆕 5.6 创建 UI 子目录入口文件**

```bash
echo "🆕 创建 UI 包子目录入口文件..."

# 创建 components 入口文件
cat > packages/ui/src/components/index.ts << 'EOF'
// 导出所有组件
// 根据你的实际组件列表调整
export { default as C_AntV } from './C_AntV/index.vue'
export { default as C_Barcode } from './C_Barcode/index.vue'
export { default as C_Breadcrumb } from './C_Breadcrumb/index.vue'
export { default as C_Captcha } from './C_Captcha/index.vue'
export { default as C_Cascade } from './C_Cascade/index.vue'
export { default as C_City } from './C_City/index.vue'
export { default as C_Code } from './C_Code/index.vue'
export { default as C_Date } from './C_Date/index.vue'
export { default as C_Draggable } from './C_Draggable/index.vue'
export { default as C_Editor } from './C_Editor/index.vue'
export { default as C_FilePreview } from './C_FilePreview/index.vue'
export { default as C_Footer } from './C_Footer/index.vue'
export { default as C_Form } from './C_Form/index.vue'
export { default as C_FormSearch } from './C_FormSearch/index.vue'
export { default as C_FullCalendar } from './C_FullCalendar/index.vue'
export { default as C_GlobalSearch } from './C_GlobalSearch/index.vue'
export { default as C_Guide } from './C_Guide/index.vue'
export { default as C_Header } from './C_Header/index.vue'
export { default as C_Icon } from './C_Icon/index.vue'
export { default as C_Language } from './C_Language/index.vue'
export { default as C_Layout } from './C_Layout/index.vue'
export { default as C_Map } from './C_Map/index.vue'
export { default as C_Markdown } from './C_Markdown/index.vue'
export { default as C_Menu } from './C_Menu/index.vue'
export { default as C_MenuTop } from './C_MenuTop/index.vue'
export { default as C_NavbarRight } from './C_NavbarRight/index.vue'
export { default as C_Notice } from './C_Notice/index.vue'
export { default as C_Progress } from './C_Progress/index.vue'
export { default as C_ReLoginDialog } from './C_ReLoginDialog/index.vue'
export { default as C_Settings } from './C_Settings/index.vue'
export { default as C_Steps } from './C_Steps/index.vue'
export { default as C_Table } from './C_Table/index.vue'
export { default as C_TagsView } from './C_TagsView/index.vue'
export { default as C_Theme } from './C_Theme/index.vue'
export { default as C_Time } from './C_Time/index.vue'
export { default as C_Tree } from './C_Tree/index.vue'
export { default as C_VtableGantt } from './C_VtableGantt/index.vue'
export { default as C_WorkFlow } from './C_WorkFlow/index.vue'
// 根据你的实际组件添加或删除
EOF

# 创建 directives 入口文件
cat > packages/ui/src/directives/index.ts << 'EOF'
// 导出所有指令
export { default as vCopy } from './modules/copy'
export { default as vDebounce } from './modules/debounce'
export { default as vThrottle } from './modules/throttle'
export { default as vLongpress } from './modules/longpress'
export { default as vPermission } from './modules/permission'
export { default as vWatermark } from './modules/watermark'
export { default as vDrag } from './modules/drag'
EOF

# 创建 hooks 入口文件
cat > packages/ui/src/hooks/index.ts << 'EOF'
// 导出所有 hooks
export * from './useTable'
export * from './useForm'
export * from './useModal'
export * from './useLoading'
export * from './useRequest'
export * from './usePagination'
export * from './useChart'
export * from './useTheme'
// 根据你的实际 hooks 添加
EOF

echo "✅ UI 子目录入口文件创建完成"
```

**5.7 安装 UI 依赖并构建**

```bash
cd packages/ui
bun install
bun run build

# 验证构建产物
ls -la dist/
ls -la dist/components/
ls -la dist/directives/
ls -la dist/hooks/

cd ../..
```

**5.8 提交 Core 和 UI 包**

```bash
git add packages/core packages/ui
git commit -m "feat: migrate core and ui packages"
git push origin feature/monorepo-migration
```

---

## 📦 第三周：Business 和 Integrations 包

### Day 7-8: 创建 Business 包

**7.1 创建 Business 包配置**

```bash
cat > packages/business/package.json << 'EOF'
{
  "name": "@agile-team/business",
  "version": "1.0.0",
  "description": "Robot Admin 业务模块包",
  "author": "CHENY <ycyplus@gmail.com>",
  "license": "MIT",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./auth": {
      "import": "./dist/auth/index.js",
      "types": "./dist/auth/index.d.ts"
    },
    "./permission": {
      "import": "./dist/permission/index.js",
      "types": "./dist/permission/index.d.ts"
    },
    "./i18n": {
      "import": "./dist/i18n/index.js",
      "types": "./dist/i18n/index.d.ts"
    },
    "./theme": {
      "import": "./dist/theme/index.js",
      "types": "./dist/theme/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "sideEffects": false,
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "dependencies": {
    "@agile-team/core": "workspace:*",
    "@agile-team/ui": "workspace:*",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "typescript": "~5.8.0",
    "vite": "^7.0.6",
    "vite-plugin-dts": "^3.9.0"
  }
}
EOF
```

**7.2 创建 Business Vite 配置**

```bash
cat > packages/business/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgileTeamBusiness',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: ['vue', /^@agile-team\//]
    }
  },
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true
    })
  ]
})
EOF
```

**7.3 创建 Business TypeScript 配置**

```bash
cat > packages/business/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

**7.4 迁移 Business 源码**

```bash
# 根据你的实际项目结构调整
# 如果有这些模块，执行对应的命令

# 迁移认证模块
[ -d "src/auth" ] && cp -r src/auth/* packages/business/src/auth/

# 迁移权限模块
[ -d "src/permission" ] && cp -r src/permission/* packages/business/src/permission/

# 迁移国际化模块
[ -d "src/i18n" ] && cp -r src/i18n/* packages/business/src/i18n/

# 迁移主题模块
[ -d "src/theme" ] && cp -r src/theme/* packages/business/src/theme/

# 如果这些模块不存在，可能在 stores 中，需要手动提取
echo "⚠️  如果上述目录不存在，请从 stores 中手动提取相关逻辑"
```

**7.5 创建 Business 入口文件**

```bash
cat > packages/business/src/index.ts << 'EOF'
// 导出认证模块
export * from './auth'

// 导出权限模块
export * from './permission'

// 导出国际化模块
export * from './i18n'

// 导出主题模块
export * from './theme'
EOF
```

**7.6 构建 Business 包**

```bash
cd packages/business
bun install
bun run build
cd ../..
```

---

### Day 9-10: 创建 Integrations 包

**9.1 创建 Integrations 包配置**

```bash
cat > packages/integrations/package.json << 'EOF'
{
  "name": "@agile-team/integrations",
  "version": "1.0.0",
  "description": "Robot Admin 第三方集成包",
  "author": "CHENY <ycyplus@gmail.com>",
  "license": "MIT",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./naive-ui": {
      "import": "./dist/naive-ui/index.js",
      "types": "./dist/naive-ui/index.d.ts"
    },
    "./echarts": {
      "import": "./dist/echarts/index.js",
      "types": "./dist/echarts/index.d.ts"
    },
    "./antv": {
      "import": "./dist/antv/index.js",
      "types": "./dist/antv/index.d.ts"
    },
    "./editor": {
      "import": "./dist/wangeditor/index.js",
      "types": "./dist/wangeditor/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "sideEffects": false,
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "dependencies": {
    "@agile-team/core": "workspace:*",
    "@agile-team/ui": "workspace:*",
    "naive-ui": "^2.41.0",
    "echarts": "^5.6.0",
    "@antv/x6": "^2.18.1",
    "wangeditor": "^4.7.15",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "~5.8.0",
    "vite": "^7.0.6",
    "vite-plugin-dts": "^3.9.0"
  }
}
EOF
```

**9.2 创建 Integrations Vite 配置**

```bash
cat > packages/integrations/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgileTeamIntegrations',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: [
        'vue',
        'naive-ui',
        'echarts',
        '@antv/x6',
        'wangeditor',
        'axios',
        /^@agile-team\//
      ]
    }
  },
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true
    })
  ]
})
EOF
```

**9.3 创建 Integrations TypeScript 配置**

```bash
cat > packages/integrations/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

**9.4 迁移 Integrations 源码**

```bash
# 如果你有第三方库的封装，迁移它们
# 否则创建基础的配置文件

# 创建 Naive UI 配置
mkdir -p packages/integrations/src/naive-ui
cat > packages/integrations/src/naive-ui/index.ts << 'EOF'
import type { App } from 'vue'
import { create } from 'naive-ui'

export function setupNaiveUI(app: App) {
  const naive = create({
    components: []  // 按需导入
  })
  app.use(naive)
}

export * from 'naive-ui'
EOF

# 创建 ECharts 封装
mkdir -p packages/integrations/src/echarts
cat > packages/integrations/src/echarts/index.ts << 'EOF'
import * as echarts from 'echarts'

export function useECharts() {
  // 你的 ECharts 封装逻辑
  return {
    echarts
  }
}

export { echarts }
EOF

# 创建 AntV 封装
mkdir -p packages/integrations/src/antv
cat > packages/integrations/src/antv/index.ts << 'EOF'
import { Graph } from '@antv/x6'

export function useAntV() {
  // 你的 AntV 封装逻辑
  return {
    Graph
  }
}

export * from '@antv/x6'
EOF

# 创建 WangEditor 封装
mkdir -p packages/integrations/src/wangeditor
cat > packages/integrations/src/wangeditor/index.ts << 'EOF'
import E from 'wangeditor'

export function useEditor() {
  // 你的编辑器封装逻辑
  return {
    Editor: E
  }
}

export { E as Editor }
EOF
```

**9.5 创建 Integrations 入口文件**

```bash
cat > packages/integrations/src/index.ts << 'EOF'
export * from './naive-ui'
export * from './echarts'
export * from './antv'
export * from './wangeditor'
EOF
```

**9.6 构建 Integrations 包**

```bash
cd packages/integrations
bun install
bun run build
cd ../..
```

**9.7 提交 Business 和 Integrations 包**

```bash
git add packages/business packages/integrations
git commit -m "feat: migrate business and integrations packages"
git push origin feature/monorepo-migration
```

---

## 🖥️ 第四周：Admin 应用重构

### Day 11-12: 创建 Admin 应用

**11.1 创建 Admin 包配置**

```bash
cat > packages/apps/admin/package.json << 'EOF'
{
  "name": "@agile-team/admin",
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
    "@agile-team/core": "workspace:*",
    "@agile-team/ui": "workspace:*",
    "@agile-team/business": "workspace:*",
    "@agile-team/integrations": "workspace:*",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^3.0.1",
    "naive-ui": "^2.41.0",
    "@vueuse/core": "^11.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "sass": "^1.70.0",
    "typescript": "~5.8.0",
    "unocss": "^0.66.0",
    "vite": "^7.0.6",
    "vue-tsc": "^2.2.8"
  }
}
EOF
```

**11.2 创建 Admin Vite 配置**

```bash
cat > packages/apps/admin/vite.config.ts << 'EOF'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      UnoCSS()
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@core': resolve(__dirname, '../../core/src'),
        '@ui': resolve(__dirname, '../../ui/src'),
        '@business': resolve(__dirname, '../../business/src'),
        '@integrations': resolve(__dirname, '../../integrations/src')
      }
    },

    server: {
      port: 3000,
      host: true,
      proxy: env.VITE_PROXY === 'true' ? {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined,
      fs: {
        allow: ['..']
      }
    },

    build: {
      target: 'es2022',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'naive-ui': ['naive-ui'],
            'charts': ['echarts'],
            'antv': ['@antv/x6']
          }
        }
      }
    }
  }
})
EOF
```

**🆕 11.3 创建 UnoCSS 配置**

```bash
echo "🆕 创建 UnoCSS 配置..."

cat > packages/apps/admin/uno.config.ts << 'EOF'
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center',
  },
  theme: {
    colors: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
    }
  }
})
EOF

echo "✅ UnoCSS 配置创建完成"
```

**11.4 创建 Admin TypeScript 配置**

```bash
cat > packages/apps/admin/tsconfig.json << 'EOF'
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["../../core/src/*"],
      "@ui/*": ["../../ui/src/*"],
      "@business/*": ["../../business/src/*"],
      "@integrations/*": ["../../integrations/src/*"]
    }
  },
  "include": ["src/**/*", "uno.config.ts"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

**11.5 迁移 Admin 源码**

```bash
# 迁移页面组件
cp -r src/views/* packages/apps/admin/src/views/

# 迁移样式文件
cp -r src/styles/* packages/apps/admin/src/styles/

# 迁移静态资源
cp -r src/assets/* packages/apps/admin/src/assets/

# 迁移 public 目录
cp -r public/* packages/apps/admin/public/

# 复制入口 HTML
cp index.html packages/apps/admin/
```

**🆕 11.6 迁移环境变量配置**

```bash
echo "🆕 迁移环境变量配置..."

# 复制环境变量文件（如果存在）
if [ -f ".env.development" ]; then
  cp .env.development packages/apps/admin/
  echo "✅ 已复制 .env.development"
fi

if [ -f ".env.production" ]; then
  cp .env.production packages/apps/admin/
  echo "✅ 已复制 .env.production"
fi

# 如果没有环境变量文件，创建模板
if [ ! -f "packages/apps/admin/.env.development" ]; then
  cat > packages/apps/admin/.env.development << 'EOF'
# 开发环境配置
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=Robot Admin
VITE_PROXY=true
VITE_ROUTER_MODE=history
EOF
  echo "✅ 已创建 .env.development 模板"
fi

if [ ! -f "packages/apps/admin/.env.production" ]; then
  cat > packages/apps/admin/.env.production << 'EOF'
# 生产环境配置
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=Robot Admin
VITE_PROXY=false
VITE_ROUTER_MODE=history
EOF
  echo "✅ 已创建 .env.production 模板"
fi
```

**11.7 创建新的 main.ts**

```bash
cat > packages/apps/admin/src/main.ts << 'EOF'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from '@agile-team/core/router'
import AgileUI from '@agile-team/ui'
import { setupNaiveUI } from '@agile-team/integrations/naive-ui'
import App from './App.vue'

// 导入样式
import './styles/index.scss'
import 'uno.css'

async function bootstrap() {
  const app = createApp(App)

  // 状态管理
  const pinia = createPinia()
  app.use(pinia)

  // UI 组件库
  app.use(AgileUI)
  setupNaiveUI(app)

  // 路由
  app.use(router)

  // 等待路由准备就绪
  await router.isReady()

  // 挂载应用
  app.mount('#app')
}

bootstrap().catch(console.error)
EOF
```

**11.8 更新 App.vue（如果需要）**

```bash
cat > packages/apps/admin/src/App.vue << 'EOF'
<template>
  <router-view />
</template>

<script setup lang="ts">
// 应用级别的逻辑
</script>
EOF
```

**11.9 安装 Admin 依赖**

```bash
cd packages/apps/admin
bun install
cd ../../..
```

---

### Day 13: 导入路径更新和测试

**🆕 13.1 创建导入路径替换脚本**

```bash
echo "🆕 创建导入路径替换脚本..."

cat > scripts/replace-imports.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 批量替换导入路径..."

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  SED_INPLACE="sed -i ''"
else
  # Linux
  SED_INPLACE="sed -i"
fi

TARGET_DIR="packages/apps/admin/src"

# 替换工具函数导入
echo "  替换 utils 导入..."
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.vue" \) -exec sed -i.bak "s|from '@/utils/|from '@agile-team/core/utils/|g" {} \;

# 替换状态管理导入
echo "  替换 stores 导入..."
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.vue" \) -exec sed -i.bak "s|from '@/stores/|from '@agile-team/core/stores/|g" {} \;

# 替换路由导入
echo "  替换 router 导入..."
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.vue" \) -exec sed -i.bak "s|from '@/router/|from '@agile-team/core/router/|g" {} \;

# 替换 API 导入
echo "  替换 api 导入..."
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.vue" \) -exec sed -i.bak "s|from '@/api/|from '@agile-team/core/api/|g" {} \;

# 替换组件导入
echo "  替换 components 导入..."
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.vue" \) -exec sed -i.bak "s|from '@/components/global/|from '@agile-team/ui/components/|g" {} \;

# 替换类型导入
echo "  替换 types 导入..."
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.vue" \) -exec sed -i.bak "s|from '@/types/|from '@agile-team/core/types/|g" {} \;

# 删除备份文件
find "$TARGET_DIR" -name "*.bak" -delete

echo "✅ 导入路径替换完成"
echo "⚠️  请使用 git diff 检查变更，并手动修复可能的错误"
EOF

chmod +x scripts/replace-imports.sh

echo "✅ 导入路径替换脚本创建完成"
```

**🆕 13.2 执行导入路径替换**

```bash
echo "🆕 执行批量导入路径替换..."

# 执行替换脚本
bash scripts/replace-imports.sh

# 查看变更（前50行）
echo ""
echo "📋 查看部分变更内容："
git diff packages/apps/admin/src | head -n 50

echo ""
echo "⚠️  重要提示："
echo "  1. 使用 'git diff packages/apps/admin/src' 查看完整变更"
echo "  2. 手动检查动态导入、条件导入等特殊情况"
echo "  3. 如果有问题，可以用 'git checkout packages/apps/admin/src' 回滚"
echo ""
```

**13.3 启动开发服务器**

```bash
# 在根目录启动
echo "🚀 启动开发服务器..."
bun run dev

# 或者直接在 admin 目录启动
# cd packages/apps/admin
# bun run dev
```

**13.4 检查常见问题**

```bash
# 如果开发服务器启动失败，按顺序检查：

# 1. 检查类型错误
echo "1️⃣ 检查类型错误..."
bun run type-check

# 2. 检查是否所有包都已构建
echo "2️⃣ 检查包构建状态..."
ls -la packages/core/dist/
ls -la packages/ui/dist/
ls -la packages/business/dist/
ls -la packages/integrations/dist/

# 3. 如果缺少构建产物，重新构建
if [ ! -d "packages/core/dist" ]; then
  echo "重新构建 core 包..."
  cd packages/core && bun run build && cd ../..
fi

# 4. 验证导入路径替换
echo "3️⃣ 搜索剩余的旧导入路径..."
grep -r "from '@/" packages/apps/admin/src --include="*.ts" --include="*.vue" | head -n 10
```

**13.5 常见问题修复**

```bash
# 问题1：找不到模块
# 解决方案：
echo "修复问题1: 找不到模块..."
bun install
bun run build:packages

# 问题2：类型错误
# 解决方案：检查 tsconfig.json 的 paths 配置
echo "修复问题2: 检查类型配置..."
cat packages/apps/admin/tsconfig.json | grep -A 10 "paths"

# 问题3：样式不生效
# 解决方案：确保 sideEffects 配置正确
echo "修复问题3: 检查样式配置..."
cat packages/ui/package.json | grep "sideEffects"
```

---

### Day 14: 优化、验证和文档

**14.1 创建验证脚本**

```bash
cat > scripts/verify-build.sh << 'EOF'
#!/bin/bash
set -e

echo "🔍 验证所有包的构建..."

packages=("core" "ui" "business" "integrations")
failed=0

for pkg in "${packages[@]}"; do
  echo "检查 @agile-team/$pkg..."

  if [ ! -d "packages/$pkg/dist" ]; then
    echo "  ❌ 缺少 dist 目录"
    failed=1
  else
    # 检查必要的文件
    if [ -f "packages/$pkg/dist/index.js" ] && [ -f "packages/$pkg/dist/index.d.ts" ]; then
      echo "  ✅ 构建产物完整"
    else
      echo "  ❌ 构建产物不完整"
      failed=1
    fi
  fi
done

if [ $failed -eq 0 ]; then
  echo ""
  echo "✅ 所有包验证通过"
  exit 0
else
  echo ""
  echo "❌ 验证失败，请检查构建"
  exit 1
fi
EOF

chmod +x scripts/verify-build.sh
```

**🆕 14.2 创建改进的性能测试脚本**

```bash
cat > scripts/benchmark.ts << 'EOF'
import { performance } from 'node:perf_hooks'
import { spawn } from 'node:child_process'
import { readdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

interface BenchmarkResult {
  buildTime: string
  installTime?: string
  bundleSize?: string
  timestamp: string
  bunVersion: string
  nodeVersion: string
}

async function measureTime(command: string, args: string[]): Promise<number> {
  const start = performance.now()

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true
    })

    let output = ''
    child.stdout?.on('data', (data) => {
      output += data.toString()
    })

    child.stderr?.on('data', (data) => {
      output += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed with code ${code}: ${output}`))
    })
  })

  const end = performance.now()
  return (end - start) / 1000
}

async function getDirectorySize(dir: string): Promise<number> {
  try {
    const files = await readdir(dir, { withFileTypes: true })
    const sizes = await Promise.all(
      files.map(async (file) => {
        const path = join(dir, file.name)
        if (file.isDirectory()) {
          return getDirectorySize(path)
        }
        const { size } = await stat(path)
        return size
      })
    )
    return sizes.reduce((acc, size) => acc + size, 0)
  } catch {
    return 0
  }
}

async function getBundleSize(): Promise<string> {
  try {
    const distPath = 'packages/apps/admin/dist'
    const totalSize = await getDirectorySize(distPath)
    
    if (totalSize === 0) {
      return 'N/A (dist 目录不存在或为空)'
    }
    
    return `${(totalSize / 1024 / 1024).toFixed(2)} MB`
  } catch (error) {
    console.warn('无法计算打包大小:', error)
    return 'N/A'
  }
}

async function main() {
  console.log('📊 Robot Admin Monorepo 性能测试\n')

  const results: BenchmarkResult = {
    buildTime: '0',
    timestamp: new Date().toISOString(),
    bunVersion: process.versions.bun || 'unknown',
    nodeVersion: process.version
  }

  try {
    // 测试构建时间
    console.log('⏱️  测试构建时间...')
    const buildTime = await measureTime('bun', ['run', 'build'])
    results.buildTime = buildTime.toFixed(2)
    console.log(`✅ 构建时间: ${buildTime.toFixed(2)}s\n`)

    // 获取打包大小
    console.log('📦 计算打包大小...')
    const bundleSize = await getBundleSize()
    results.bundleSize = bundleSize
    console.log(`✅ 打包大小: ${bundleSize}\n`)

    // 保存结果
    await writeFile(
      'benchmark-results.json',
      JSON.stringify(results, null, 2)
    )

    console.log('📊 测试结果已保存到 benchmark-results.json')
    console.table(results)
  } catch (error) {
    console.error('❌ 性能测试失败:', error)
    process.exit(1)
  }
}

main()
EOF
```

**🆕 14.3 创建包 README 生成脚本**

```bash
cat > scripts/generate-package-readme.sh << 'EOF'
#!/bin/bash
set -e

echo "📝 生成各包的 README..."

# Core 包
cat > packages/core/README.md << 'PKGEOF'
# @agile-team/core

Robot Admin 核心功能包

## 功能

- 🔐 路由管理
- 📦 状态管理
- 🛠️ 工具函数
- 🌐 API 封装
- 📝 类型定义

## 安装

```bash
bun add @agile-team/core
```

## 使用

```typescript
// 路由
import { router } from '@agile-team/core/router'

// 状态管理
import { s_userStore } from '@agile-team/core/stores'

// 工具函数
import { formatDate } from '@agile-team/core/utils'

// API
import { request } from '@agile-team/core/api'

// 类型
import type { User } from '@agile-team/core/types'
```

## 开发

```bash
cd packages/core
bun install
bun run dev      # 监听模式
bun run build    # 构建
```

## License

MIT
PKGEOF

# UI 包
cat > packages/ui/README.md << 'PKGEOF'
# @agile-team/ui

Robot Admin UI 组件库（组件 + 指令 + Hooks）

## 功能

- 🎨 30+ 全局组件
- 🎯 7个自定义指令
- 🪝 8个自定义 Hooks

## 安装

```bash
bun add @agile-team/ui
```

## 使用

### 全量导入

```typescript
import AgileUI from '@agile-team/ui'
app.use(AgileUI)
```

### 按需导入

```typescript
// 组件
import { C_Button, C_Table } from '@agile-team/ui/components'

// 指令
import { vCopy, vDebounce } from '@agile-team/ui/directives'

// Hooks
import { useTable, useForm } from '@agile-team/ui/hooks'
```

## 开发

```bash
cd packages/ui
bun install
bun run dev      # 监听模式
bun run build    # 构建
```

## License

MIT
PKGEOF

# Business 包
cat > packages/business/README.md << 'PKGEOF'
# @agile-team/business

Robot Admin 业务模块包

## 功能

- 🔐 认证授权
- 🛡️ 权限管理
- 🌍 国际化
- 🎨 主题系统

## 安装

```bash
bun add @agile-team/business
```

## 使用

```typescript
// 认证
import { login, logout } from '@agile-team/business/auth'

// 权限
import { hasPermission } from '@agile-team/business/permission'

// 国际化
import { setupI18n } from '@agile-team/business/i18n'

// 主题
import { setupTheme } from '@agile-team/business/theme'
```

## 开发

```bash
cd packages/business
bun install
bun run dev      # 监听模式
bun run build    # 构建
```

## License

MIT
PKGEOF

# Integrations 包
cat > packages/integrations/README.md << 'PKGEOF'
# @agile-team/integrations

Robot Admin 第三方集成包

## 功能

- 🎨 Naive UI 配置
- 📊 ECharts 封装
- 🔀 AntV X6 封装
- ✏️ 富文本编辑器

## 安装

```bash
bun add @agile-team/integrations
```

## 使用

```typescript
// Naive UI
import { setupNaiveUI } from '@agile-team/integrations/naive-ui'

// ECharts
import { useECharts } from '@agile-team/integrations/echarts'

// AntV
import { useAntV } from '@agile-team/integrations/antv'

// 编辑器
import { useEditor } from '@agile-team/integrations/editor'
```

## 开发

```bash
cd packages/integrations
bun install
bun run dev      # 监听模式
bun run build    # 构建
```

## License

MIT
PKGEOF

echo "✅ 所有包的 README 已生成"
EOF

chmod +x scripts/generate-package-readme.sh
```

**14.4 运行所有验证**

```bash
# 生成包 README
echo "📝 生成包 README..."
bash scripts/generate-package-readme.sh

# 验证构建
echo ""
echo "🔍 验证构建..."
bash scripts/verify-build.sh

# 性能测试
echo ""
echo "📊 运行性能测试..."
bun scripts/benchmark.ts

# 验证类型检查
echo ""
echo "🔍 类型检查..."
bun run type-check

# 验证代码质量
echo ""
echo "🎨 代码检查..."
bun run lint
```

**14.5 创建根 README**

```bash
cat > README.md << 'EOF'
# Robot Admin Monorepo

基于 Bun + Vite 的现代化 Monorepo 架构

## 📦 包结构

- `@agile-team/core` - 核心功能（路由、状态、工具、API、类型）
- `@agile-team/ui` - UI组件库（30+组件 + 7个指令 + 8个Hooks）
- `@agile-team/business` - 业务模块（认证、权限、国际化、主题）
- `@agile-team/integrations` - 第三方集成（Naive UI、ECharts、AntV、编辑器）
- `@agile-team/admin` - 管理后台应用

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 开发

```bash
bun run dev
```

### 构建

```bash
bun run build
```

### 测试

```bash
bun run type-check
bun run lint
```

## 📝 常用命令

```bash
# 开发
bun run dev                    # 启动开发服务器
bun run dev:admin              # 启动 admin 应用

# 构建
bun run build                  # 构建所有包
bun run build:packages         # 只构建库包
bun run build:apps             # 只构建应用
bun run build:core             # 构建 core 包

# 代码质量
bun run lint                   # 代码检查
bun run lint:fix               # 修复代码问题
bun run format                 # 格式化代码
bun run type-check             # 类型检查

# 清理
bun run clean                  # 清理构建产物
bun run clean:cache            # 清理缓存
bun run clean:all              # 清理所有

# 验证
bun run verify                 # 验证构建
bun run benchmark              # 性能测试

# 版本管理
bun changeset                  # 创建变更集
bun run version                # 更新版本
bun run release                # 发布
```

## 🏗️ 项目结构

```
robot-admin-monorepo/
├── packages/
│   ├── core/                  # 核心包
│   ├── ui/                    # UI组件库
│   ├── business/              # 业务模块
│   ├── integrations/          # 第三方集成
│   └── apps/
│       └── admin/             # 主应用
├── scripts/                   # 自动化脚本
└── package.json               # 根配置
```

## 📚 文档

详细文档请查看各包的 README：

- [Core 包文档](./packages/core/README.md)
- [UI 包文档](./packages/ui/README.md)
- [Business 包文档](./packages/business/README.md)
- [Integrations 包文档](./packages/integrations/README.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 License

MIT

## 👥 团队

CHENY <ycyplus@gmail.com>

---

**版本**: v2.0 Complete  
**更新时间**: 2025-01-20  
**状态**: ✅ 生产就绪 - 包含所有必需步骤
EOF
```

**14.6 最终提交**

```bash
git add .
git commit -m "feat: complete monorepo migration with all enhancements"
git push origin feature/monorepo-migration
```

---

## ✅ 完整检查清单

### 第1周：基础架构

- [ ] 创建 `feature/monorepo-migration` 分支
- [ ] 创建目录结构
- [ ] 配置根 `package.json`
- [ ] 配置 `.bunfig.toml`
- [ ] 配置 `tsconfig.json`
- [ ] 配置 `.gitignore`
- [ ] 安装根依赖
- [ ] 初始化 Changesets
- [ ] 提交代码

### 第2周：Core 和 UI

- [ ] 创建 `@agile-team/core` 包
- [ ] 迁移 router、stores、utils、api、types
- [ ] 🆕 创建 Core 子目录入口文件
- [ ] 构建 Core 包
- [ ] 验证 Core 包
- [ ] 创建 `@agile-team/ui` 包
- [ ] 迁移 components、directives、hooks
- [ ] 🆕 创建 UI 子目录入口文件
- [ ] 构建 UI 包
- [ ] 验证 UI 包
- [ ] 提交代码

### 第3周：Business 和 Integrations

- [ ] 创建 `@agile-team/business` 包
- [ ] 迁移业务模块
- [ ] 构建 Business 包
- [ ] 创建 `@agile-team/integrations` 包
- [ ] 迁移第三方集成
- [ ] 构建 Integrations 包
- [ ] 提交代码

### 第4周：Admin 应用

- [ ] 创建 `@agile-team/admin` 应用
- [ ] 🆕 创建 UnoCSS 配置
- [ ] 🆕 迁移环境变量配置
- [ ] 迁移 views、styles、assets
- [ ] 创建新的 main.ts
- [ ] 🆕 创建导入路径替换脚本
- [ ] 🆕 执行批量导入路径替换
- [ ] 测试开发环境
- [ ] 测试生产构建
- [ ] 创建验证脚本
- [ ] 🆕 创建改进的性能测试
- [ ] 🆕 生成各包 README
- [ ] 更新根 README
- [ ] 最终提交

### 完成后

- [ ] 创建 PR 到 develop
- [ ] 代码审查
- [ ] 合并到 develop
- [ ] 测试环境验证
- [ ] 合并到 main
- [ ] 发布第一个版本

---

## 🎯 常见问题

### Q1: 如何处理旧的导入路径？

```bash
# 使用自动化脚本批量替换
bash scripts/replace-imports.sh

# 然后手动检查特殊情况
git diff packages/apps/admin/src
```

### Q2: 子目录入口文件的作用是什么？

```typescript
// 没有子目录入口文件，这样导入会失败：
import { router } from '@agile-team/core/router'  // ❌ 找不到模块

// 有了 packages/core/src/router/index.ts，就可以正常导入：
import { router } from '@agile-team/core/router'  // ✅ 正常工作
```

### Q3: 如何在迁移期间保持主分支可用？

```bash
# 在 feature/monorepo-migration 分支开发
# main/develop 分支继续接受其他改动

# 需要时同步 develop 的更新
git checkout feature/monorepo-migration
git merge develop
# 解决冲突后提交
```

### Q4: 构建失败怎么办？

```bash
# 1. 清理缓存
bun run clean:all
bun install

# 2. 单独构建每个包，查看错误
cd packages/core
bun run build

# 3. 检查依赖关系
bun run type-check

# 4. 使用验证脚本
bash scripts/verify-build.sh
```

### Q5: 导入路径替换后还有问题怎么办？

```bash
# 1. 搜索剩余的旧路径
grep -r "from '@/" packages/apps/admin/src

# 2. 回滚重新替换
git checkout packages/apps/admin/src
bash scripts/replace-imports.sh

# 3. 手动修复特殊情况（动态导入、条件导入等）
```

---

## 📞 支持

遇到问题请联系：

- 作者: CHENY
- 邮箱: ycyplus@gmail.com

---

## 🔄 CI/CD 配置

### GitHub Actions 工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop, feature/monorepo-migration]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        bun: ['1.2.19', 'latest']
        node: ['20.x']

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ matrix.bun }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun run type-check

      - name: Lint
        run: bun run lint

      - name: Build packages
        run: bun run build:packages

      - name: Build apps
        run: bun run build:apps

      - name: Run benchmark
        run: bun scripts/benchmark.ts

      - name: Upload benchmark results
        uses: actions/upload-artifact@v4
        with:
          name: benchmark-results-${{ matrix.bun }}
          path: benchmark-results.json

  release:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build packages
        run: bun run build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: bun run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🎯 新增内容标记说明

本文档中所有标记 🆕 的内容都是相比原版新增的关键步骤：

- **3.6**: 创建 Core 子目录入口文件（router/stores/utils/api/types）
- **5.6**: 创建 UI 子目录入口文件（components/directives/hooks）
- **11.3**: 创建 UnoCSS 配置
- **11.6**: 迁移环境变量配置
- **13.1**: 创建导入路径替换脚本
- **13.2**: 执行批量导入路径替换
- **14.2**: 改进的性能测试脚本（正确计算打包大小）
- **14.3**: 包 README 生成脚本

这些步骤都是**必需的**，不是可选的！

---

**版本**: v2.0 Complete  
**更新时间**: 2025-01-20  
**状态**: ✅ 生产就绪 - 完整版包含所有必需步骤