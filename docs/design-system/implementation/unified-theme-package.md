# 统一主题包方案

> 通过独立主题包实现一处维护，多处复用的设计系统

## 🎯 方案概述

创建独立的主题包 `@robot-admin/design-themes`，统一管理：

- 组件库 C\_\* 组件主题
- Naive UI 原生组件主题覆盖
- 主题切换逻辑
- 共享设计变量

## 📦 主题包结构

```
@robot-admin/design-themes/
├── src/
│   ├── themes/
│   │   ├── glass-morphism/
│   │   │   ├── index.scss           # 主题入口
│   │   │   ├── variables.scss       # 主题变量
│   │   │   ├── components.scss      # 组件库主题
│   │   │   └── naive-ui.scss        # Naive UI 覆盖
│   │   ├── corporate-minimal/
│   │   └── dark-tech/
│   ├── composables/
│   │   └── useDesignTheme.ts        # 主题切换逻辑
│   ├── types/
│   │   └── index.ts                 # 类型定义
│   └── index.ts                     # 统一导出
├── dist/                            # 构建产物
├── package.json
└── README.md
```

## 🎨 主题包实现

### 1. 主题变量系统

```scss
// src/themes/glass-morphism/variables.scss
:root[data-design-theme='glass-morphism'] {
  /* ===== 基础变量 ===== */
  --dt-primary: #2080f0;
  --dt-primary-alpha: rgba(32, 128, 240, 0.12);

  /* ===== 玻璃效果变量 ===== */
  --dt-glass-bg: rgba(255, 255, 255, 0.12);
  --dt-glass-border: rgba(255, 255, 255, 0.2);
  --dt-glass-backdrop: blur(16px) saturate(180%);
  --dt-glass-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.3);

  /* ===== 交互效果变量 ===== */
  --dt-hover-transform: translateY(-4px);
  --dt-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  --dt-transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* ===== 组件专用变量 ===== */
  --dt-card-bg: var(--dt-glass-bg);
  --dt-card-border: var(--dt-glass-border);
  --dt-card-backdrop: var(--dt-glass-backdrop);
  --dt-card-shadow: var(--dt-glass-shadow);

  --dt-button-bg: var(--dt-glass-bg);
  --dt-button-border: var(--dt-glass-border);
  --dt-button-backdrop: blur(8px) saturate(150%);

  --dt-modal-bg: rgba(255, 255, 255, 0.15);
  --dt-modal-backdrop: blur(24px) saturate(200%);
  --dt-modal-border: rgba(255, 255, 255, 0.3);
}

/* 暗色主题适配 */
[data-design-theme='glass-morphism'][data-theme='dark'] {
  --dt-glass-bg: rgba(255, 255, 255, 0.08);
  --dt-glass-border: rgba(255, 255, 255, 0.15);
  --dt-card-bg: var(--dt-glass-bg);
  --dt-card-border: var(--dt-glass-border);
}
```

### 2. 组件库主题

```scss
// src/themes/glass-morphism/components.scss
/* ===== 组件库 C_* 组件主题 ===== */
[data-design-theme='glass-morphism'] {
  /* C_Table */
  .c-table-wrapper {
    background: var(--dt-card-bg);
    backdrop-filter: var(--dt-card-backdrop);
    border: 1px solid var(--dt-card-border);
    box-shadow: var(--dt-card-shadow);
    border-radius: 12px;
    transition: var(--dt-transition);

    &:hover {
      transform: var(--dt-hover-transform);
      box-shadow: var(--dt-hover-shadow);
    }
  }

  /* C_ActionBar */
  .c-action-bar {
    background: var(--dt-glass-bg);
    backdrop-filter: var(--dt-glass-backdrop);
    border: 1px solid var(--dt-glass-border);
    border-radius: 10px;
    padding: 12px 16px;
  }

  /* C_Login */
  .c-login-panel {
    background: var(--dt-glass-bg);
    backdrop-filter: var(--dt-glass-backdrop);
    border: 1px solid var(--dt-glass-border);
    box-shadow: var(--dt-glass-shadow);
    border-radius: 16px;
  }

  /* 更多组件... */
}
```

### 3. Naive UI 覆盖

```scss
// src/themes/glass-morphism/naive-ui.scss
/* ===== Naive UI 原生组件覆盖 ===== */
[data-design-theme='glass-morphism'] {
  /* NCard */
  .n-card {
    background: var(--dt-card-bg) !important;
    backdrop-filter: var(--dt-card-backdrop) !important;
    border: 1px solid var(--dt-card-border) !important;
    box-shadow: var(--dt-card-shadow) !important;
    border-radius: 12px !important;
    transition: var(--dt-transition) !important;

    &:hover {
      transform: var(--dt-hover-transform) !important;
      box-shadow: var(--dt-hover-shadow) !important;
    }
  }

  /* NButton */
  .n-button {
    backdrop-filter: var(--dt-button-backdrop) !important;
    border-radius: 10px !important;
    transition: var(--dt-transition) !important;

    &:not(.n-button--disabled):hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
    }

    &.n-button--primary-type {
      background: rgba(32, 128, 240, 0.9) !important;
      border: 1px solid var(--dt-glass-border) !important;
    }

    &.n-button--default-type {
      background: var(--dt-button-bg) !important;
      border: 1px solid var(--dt-button-border) !important;
    }
  }

  /* NModal */
  .n-modal .n-card {
    background: var(--dt-modal-bg) !important;
    backdrop-filter: var(--dt-modal-backdrop) !important;
    border: 1px solid var(--dt-modal-border) !important;
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.15),
      inset 0 2px 4px rgba(255, 255, 255, 0.4) !important;
  }

  /* NDrawer */
  .n-drawer .n-drawer-body-content-wrapper {
    background: var(--dt-card-bg) !important;
    backdrop-filter: var(--dt-card-backdrop) !important;
    border-left: 1px solid var(--dt-card-border) !important;
  }

  /* NInput, NSelect 等表单组件 */
  .n-input,
  .n-select,
  .n-date-picker {
    .n-input__input-el,
    .n-base-selection {
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(8px) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 8px !important;
      transition: var(--dt-transition) !important;

      &:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        border-color: rgba(255, 255, 255, 0.25) !important;
      }

      &:focus {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: var(--dt-primary) !important;
        box-shadow: 0 0 0 2px var(--dt-primary-alpha) !important;
      }
    }
  }

  /* NDataTable */
  .n-data-table {
    background: var(--dt-card-bg) !important;
    backdrop-filter: var(--dt-card-backdrop) !important;
    border: 1px solid var(--dt-card-border) !important;
    border-radius: 12px !important;

    .n-data-table-thead {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    .n-data-table-tr:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }
}
```

### 4. 主题入口文件

```scss
// src/themes/glass-morphism/index.scss
@import './variables.scss';
@import './components.scss';
@import './naive-ui.scss';
```

### 5. TypeScript 类型和逻辑

```typescript
// src/types/index.ts
export enum DesignTheme {
  GLASS_MORPHISM = 'glass-morphism',
  CORPORATE_MINIMAL = 'corporate-minimal',
  DARK_TECH = 'dark-tech',
}

export interface ThemeConfig {
  name: string
  description: string
  cssFile: string
  previewImage?: string
}

export const THEME_CONFIGS: Record<DesignTheme, ThemeConfig> = {
  [DesignTheme.GLASS_MORPHISM]: {
    name: '拟态玻璃',
    description: '现代化的毛玻璃效果，营造层次丰富的视觉体验',
    cssFile: '@robot-admin/design-themes/glass-morphism',
  },
  [DesignTheme.CORPORATE_MINIMAL]: {
    name: '企业简约',
    description: '简洁专业的商务风格，注重功能性和可读性',
    cssFile: '@robot-admin/design-themes/corporate-minimal',
  },
  [DesignTheme.DARK_TECH]: {
    name: '深邃科技',
    description: '炫酷的科技感设计，适合技术类应用',
    cssFile: '@robot-admin/design-themes/dark-tech',
  },
}
```

```typescript
// src/composables/useDesignTheme.ts
import { ref, watch } from 'vue'
import { DesignTheme, THEME_CONFIGS } from '../types'

const currentTheme = ref<DesignTheme>(
  (localStorage.getItem('design-theme') as DesignTheme) ||
    DesignTheme.GLASS_MORPHISM
)

export function useDesignTheme() {
  const setTheme = async (theme: DesignTheme) => {
    // 动态加载主题CSS
    const themeConfig = THEME_CONFIGS[theme]

    // 移除旧主题
    const oldLink = document.querySelector('link[data-theme-css]')
    if (oldLink) {
      oldLink.remove()
    }

    // 加载新主题
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `${themeConfig.cssFile}.css`
    link.setAttribute('data-theme-css', 'true')
    document.head.appendChild(link)

    // 设置主题属性
    document.documentElement.setAttribute('data-design-theme', theme)
    localStorage.setItem('design-theme', theme)
    currentTheme.value = theme
  }

  const getThemeConfig = (theme: DesignTheme) => THEME_CONFIGS[theme]

  // 初始化
  watch(
    currentTheme,
    newTheme => {
      setTheme(newTheme)
    },
    { immediate: true }
  )

  return {
    currentTheme: readonly(currentTheme),
    setTheme,
    getThemeConfig,
    themes: Object.values(DesignTheme),
    themeConfigs: THEME_CONFIGS,
  }
}
```

### 6. 主题包导出

```typescript
// src/index.ts
export * from './types'
export * from './composables/useDesignTheme'
export { default as ThemeSelector } from './components/ThemeSelector.vue'

// 主题CSS文件也会被打包到 dist/ 目录
```

## 🚀 使用方式

### 1. 安装主题包

```bash
bun add @robot-admin/design-themes
```

### 2. 在项目中使用

```typescript
// main.ts
import { useDesignTheme } from '@robot-admin/design-themes'

const app = createApp(App)

// 初始化主题系统
const { setTheme } = useDesignTheme()
setTheme('glass-morphism') // 设置默认主题

app.mount('#app')
```

### 3. 组件库集成

```scss
// @robot-admin/naive-ui-components 中
// 不再需要自己的主题系统，直接使用主题包的变量
.c-table-wrapper {
  background: var(--dt-card-bg, rgba(255, 255, 255, 0.12));
  backdrop-filter: var(--dt-card-backdrop, none);
  // ...
}
```

### 4. 主题切换组件

```vue
<template>
  <ThemeSelector />
</template>

<script setup>
  import { ThemeSelector } from '@robot-admin/design-themes'
</script>
```

## 🎯 优势对比

| 方案           | 维护成本 | 一致性  | 复用性  | 升级便利性 |
| -------------- | -------- | ------- | ------- | ---------- |
| **双层维护**   | ❌ 高    | ⚠️ 中等 | ⚠️ 中等 | ❌ 复杂    |
| **统一主题包** | ✅ 低    | ✅ 高   | ✅ 高   | ✅ 简单    |

### 统一主题包的优势：

1. ✅ **一处维护** - 所有主题逻辑集中在主题包
2. ✅ **版本统一** - 主题包版本升级，所有项目自动获得新特性
3. ✅ **类型安全** - TypeScript 类型定义统一导出
4. ✅ **按需加载** - 动态加载主题CSS，性能更好
5. ✅ **独立发布** - 主题包可以独立迭代和发布
6. ✅ **多项目复用** - 其他项目也可以使用相同的主题包

## 📦 发布策略

### 主题包版本管理

```json
{
  "name": "@robot-admin/design-themes",
  "version": "1.0.0",
  "peerDependencies": {
    "vue": "^3.0.0",
    "naive-ui": "^2.35.0"
  }
}
```

### 项目依赖更新

```json
// Robot Admin package.json
{
  "dependencies": {
    "@robot-admin/design-themes": "^1.0.0",
    "@robot-admin/naive-ui-components": "^0.8.2"
  }
}
```

### 组件库依赖更新

```json
// @robot-admin/naive-ui-components package.json
{
  "peerDependencies": {
    "@robot-admin/design-themes": "^1.0.0"
  }
}
```

---

**结论：** 统一主题包方案实现了真正的"一处维护，处处生效"，是最优雅的解决方案！
