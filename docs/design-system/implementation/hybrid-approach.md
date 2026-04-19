# 混合组件设计系统实施方案

> 解决组件库组件 + Naive UI 原生组件的统一风格问题

## 🎯 问题定义

当前项目存在两套组件体系：

1. **@robot-admin/naive-ui-components** - 你的组件库 (C\_\*)
2. **Naive UI 原生组件** - 直接使用 (N\*)

需要让两套组件保持统一的设计风格。

## 🔧 双层设计系统方案

### Layer 1: 组件库层 (@robot-admin/naive-ui-components)

#### 在组件库中实现主题系统

```scss
// src/styles/themes/glass-morphism.scss
:root[data-design-theme='glass-morphism'] {
  // 组件库专用变量
  --c-card-bg: rgba(255, 255, 255, 0.12);
  --c-card-backdrop: blur(16px) saturate(180%);
  --c-card-border: rgba(255, 255, 255, 0.2);
  --c-hover-transform: translateY(-4px);
  --c-hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

#### 组件库组件自动应用主题

```scss
// C_Table/index.scss
.c-table-wrapper {
  background: var(--c-card-bg);
  backdrop-filter: var(--c-card-backdrop, none);
  border: 1px solid var(--c-card-border);
  transition: all var(--c-transition-base);

  &:hover {
    transform: var(--c-hover-transform, none);
    box-shadow: var(--c-hover-shadow, none);
  }
}
```

### Layer 2: 项目层 (Robot Admin)

#### 通过CSS覆盖统一Naive UI组件风格

```scss
// src/styles/naive-ui-theme-override.scss

/* ===== 玻璃拟态主题 ===== */
[data-design-theme='glass-morphism'] {
  /* NCard 玻璃化 */
  .n-card {
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(16px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.08),
      inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:hover {
      transform: translateY(-4px) !important;
      box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.12),
        inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
    }
  }

  /* NButton 玻璃化 */
  .n-button {
    backdrop-filter: blur(8px) saturate(150%) !important;
    border-radius: 12px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:not(.n-button--disabled):hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
    }

    /* 主要按钮 */
    &.n-button--primary-type {
      background: rgba(32, 128, 240, 0.9) !important;
      border: 1px solid rgba(32, 128, 240, 0.3) !important;

      &:hover {
        background: rgba(32, 128, 240, 1) !important;
        border-color: rgba(32, 128, 240, 0.5) !important;
      }
    }

    /* 次要按钮 */
    &.n-button--default-type {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;

      &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }
    }
  }

  /* NModal 玻璃化 */
  .n-modal {
    .n-card {
      background: rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      box-shadow:
        0 16px 48px rgba(0, 0, 0, 0.15),
        inset 0 2px 4px rgba(255, 255, 255, 0.4) !important;
    }
  }

  /* NDrawer 玻璃化 */
  .n-drawer {
    .n-drawer-body-content-wrapper {
      background: rgba(255, 255, 255, 0.12) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  }

  /* NForm 表单项增强 */
  .n-form-item {
    .n-input,
    .n-select,
    .n-date-picker {
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(8px) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;

      &:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        border-color: rgba(255, 255, 255, 0.25) !important;
      }

      &:focus,
      &.n-input--focus {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(32, 128, 240, 0.5) !important;
        box-shadow: 0 0 0 2px rgba(32, 128, 240, 0.2) !important;
      }
    }
  }

  /* NTable 表格玻璃化 */
  .n-data-table {
    background: rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 12px !important;

    .n-data-table-thead {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    .n-data-table-tr:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  /* NTag 标签玻璃化 */
  .n-tag {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 6px !important;
  }
}

/* ===== 暗色主题适配 ===== */
[data-design-theme='glass-morphism'][data-theme='dark'] {
  .n-card {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
  }

  .n-button--default-type {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
  }

  .n-input,
  .n-select,
  .n-date-picker {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
}

/* ===== 企业简约主题 ===== */
[data-design-theme='corporate-minimal'] {
  .n-card {
    background: var(--card-color) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
    transition: all 0.2s ease !important;

    &:hover {
      border-color: var(--primary-color) !important;
      box-shadow: 0 4px 16px rgba(32, 128, 240, 0.08) !important;
    }
  }

  .n-button {
    border-radius: 6px !important;
    transition: all 0.2s ease !important;

    &:hover {
      transform: none !important;
    }
  }
}

/* ===== 深邃科技主题 ===== */
[data-design-theme='dark-tech'] {
  .n-card {
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.8) 0%,
      rgba(30, 41, 59, 0.6) 100%
    ) !important;
    border: 1px solid rgba(56, 189, 248, 0.3) !important;
    border-radius: 4px !important;
    box-shadow:
      0 0 20px rgba(56, 189, 248, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    transition: all 0.3s ease !important;

    &:hover {
      border-color: rgba(56, 189, 248, 0.6) !important;
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.2) !important;
    }
  }

  .n-button--primary-type {
    background: linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.8) 0%,
      rgba(56, 189, 248, 1) 100%
    ) !important;
    border: 1px solid rgba(56, 189, 248, 0.5) !important;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.3) !important;
  }
}
```

## 🎨 主题切换系统

### TypeScript 接口定义

```typescript
// src/types/design-system.ts
export enum DesignTheme {
  GLASS_MORPHISM = 'glass-morphism',
  CORPORATE_MINIMAL = 'corporate-minimal',
  DARK_TECH = 'dark-tech',
}

export interface ThemeConfig {
  name: string
  description: string
  preview: string
  cssClass: string
}

export const THEME_CONFIGS: Record<DesignTheme, ThemeConfig> = {
  [DesignTheme.GLASS_MORPHISM]: {
    name: '拟态玻璃',
    description: '现代化的毛玻璃效果，营造层次丰富的视觉体验',
    preview: '/images/theme-glass.png',
    cssClass: 'glass-morphism',
  },
  [DesignTheme.CORPORATE_MINIMAL]: {
    name: '企业简约',
    description: '简洁专业的商务风格，注重功能性和可读性',
    preview: '/images/theme-corporate.png',
    cssClass: 'corporate-minimal',
  },
  [DesignTheme.DARK_TECH]: {
    name: '深邃科技',
    description: '炫酷的科技感设计，适合技术类应用',
    preview: '/images/theme-tech.png',
    cssClass: 'dark-tech',
  },
}
```

### 主题切换 Composable

```typescript
// src/composables/useDesignTheme.ts
import { ref, watch } from 'vue'
import { DesignTheme, THEME_CONFIGS } from '@/types/design-system'

const currentTheme = ref<DesignTheme>(
  (localStorage.getItem('design-theme') as DesignTheme) ||
    DesignTheme.GLASS_MORPHISM
)

export function useDesignTheme() {
  const setTheme = (theme: DesignTheme) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-design-theme', theme)
    localStorage.setItem('design-theme', theme)
  }

  const getThemeConfig = (theme: DesignTheme) => {
    return THEME_CONFIGS[theme]
  }

  // 初始化主题
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

### 主题选择器组件

```vue
<!-- src/components/global/C_ThemeSelector/index.vue -->
<template>
  <NDropdown
    :options="themeOptions"
    @select="handleThemeSelect"
  >
    <NButton
      quaternary
      circle
    >
      <template #icon>
        <Icon name="ri:palette-line" />
      </template>
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useDesignTheme } from '@/composables/useDesignTheme'
  import { DesignTheme } from '@/types/design-system'

  const { currentTheme, setTheme, themeConfigs } = useDesignTheme()

  const themeOptions = computed(() =>
    Object.values(DesignTheme).map(theme => ({
      label: themeConfigs[theme].name,
      key: theme,
      disabled: theme === currentTheme.value,
    }))
  )

  const handleThemeSelect = (theme: DesignTheme) => {
    setTheme(theme)
  }
</script>
```

## 📁 文件结构

```
Robot Admin/
├── src/
│   ├── styles/
│   │   ├── design-system/
│   │   │   ├── themes/
│   │   │   │   ├── glass-morphism.scss
│   │   │   │   ├── corporate-minimal.scss
│   │   │   │   └── dark-tech.scss
│   │   │   ├── naive-ui-overrides.scss
│   │   │   └── index.scss
│   │   └── index.scss
│   ├── composables/
│   │   └── useDesignTheme.ts
│   ├── types/
│   │   └── design-system.ts
│   └── components/
│       └── global/
│           └── C_ThemeSelector/
└── @robot-admin/naive-ui-components/
    └── src/
        └── styles/
            ├── themes/
            └── variables.scss
```

## 🚀 实施步骤

### Phase 1: 项目层主题系统 (1周)

1. 创建主题CSS覆盖文件
2. 实现主题切换逻辑
3. 添加主题选择器组件

### Phase 2: 组件库层主题系统 (1-2周)

1. 在组件库中添加主题变量
2. 更新所有C\_\*组件支持主题
3. 发布新版本组件库

### Phase 3: 优化与完善 (1周)

1. 性能优化
2. 边缘情况处理
3. 文档完善

## ⚠️ 注意事项

1. **CSS优先级** - 使用 `!important` 确保覆盖生效
2. **性能考虑** - 玻璃效果在低端设备上提供回退
3. **主题一致性** - 确保组件库主题和项目主题变量同步
4. **升级兼容性** - 组件库升级时注意主题变量变化

---

这个方案既保持了组件库的独立性，又解决了混合组件的统一风格问题。
