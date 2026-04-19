# @robot-admin/theme 扩展方案

> 基于现有主题包扩展设计风格系统，实现统一的视觉管理

## 🎯 方案概述

在现有的 `@robot-admin/theme` 包基础上扩展设计风格系统，实现：

- **保持现有功能** - light/dark/system + 菜单风格
- **新增设计风格** - glass-morphism/corporate-minimal/dark-tech
- **统一管理** - 一个包管理所有视觉相关功能

## 📊 职责分析

### 现有功能（保持不变）

```typescript
// 基础主题模式
type ThemeMode = 'light' | 'dark' | 'system'

// 菜单风格
type MenuThemeType = 'signature' | 'standard'

// 当前已实现
- 明暗主题切换 ✅
- View Transition API ✅
- 菜单风格控制 ✅
- Naive UI 主题覆盖 ✅
```

### 新增功能（扩展）

```typescript
// 设计风格系统
type DesignStyle = 'glass-morphism' | 'corporate-minimal' | 'dark-tech'

// 需要新增
- 设计风格切换 🆕
- 组件库主题变量 🆕
- Naive UI 风格覆盖 🆕
- 风格预设配置 🆕
```

## 🏗️ 扩展架构设计

### 1. 类型系统扩展

```typescript
// src/types/index.ts (扩展)

// 现有类型保持不变
export type ThemeMode = 'light' | 'dark' | 'system'
export type MenuThemeType = 'signature' | 'standard'

// 新增设计风格类型
export type DesignStyle = 'glass-morphism' | 'corporate-minimal' | 'dark-tech'

// 扩展主题配置
export interface ThemeConfig {
  /** 当前主题模式 */
  mode: ThemeMode
  /** 是否为暗色模式 */
  isDark: boolean
  /** 系统是否为暗色模式 */
  systemIsDark: boolean
  /** 菜单风格 */
  menuTheme: MenuThemeType
  /** 设计风格 🆕 */
  designStyle: DesignStyle
}

// 设计风格配置
export interface DesignStyleConfig {
  name: string
  description: string
  cssFile: string
  preview?: string
  supportedThemes: ThemeMode[]
}

// Store 选项扩展
export interface ThemeStoreOptions {
  /** 默认主题模式 */
  defaultMode?: ThemeMode
  /** 默认菜单风格 */
  defaultMenuTheme?: MenuThemeType
  /** 默认设计风格 🆕 */
  defaultDesignStyle?: DesignStyle
  /** localStorage 键名 */
  storageKey?: string
  /** 是否启用 View Transition API */
  enableTransition?: boolean
  /** 过渡动画时长（毫秒） */
  transitionDuration?: number
}
```

### 2. 常量配置扩展

```typescript
// src/constants/index.ts (扩展)

// 现有常量保持不变
export const DEFAULT_THEME_OPTIONS = {
  defaultMode: 'system' as const,
  defaultMenuTheme: 'signature' as const,
  defaultDesignStyle: 'glass-morphism' as const, // 🆕
  storageKey: 'theme-mode',
  menuThemeKey: 'robot-admin-menu-theme',
  designStyleKey: 'robot-admin-design-style', // 🆕
  enableTransition: true,
  transitionDuration: 500,
}

// 新增设计风格配置
export const DESIGN_STYLE_CONFIGS: Record<DesignStyle, DesignStyleConfig> = {
  'glass-morphism': {
    name: '拟态玻璃',
    description: '现代化的毛玻璃效果，营造层次丰富的视觉体验',
    cssFile: 'glass-morphism',
    supportedThemes: ['light', 'dark', 'system'],
  },
  'corporate-minimal': {
    name: '企业简约',
    description: '简洁专业的商务风格，注重功能性和可读性',
    cssFile: 'corporate-minimal',
    supportedThemes: ['light', 'dark', 'system'],
  },
  'dark-tech': {
    name: '深邃科技',
    description: '炫酷的科技感设计，适合技术类应用',
    cssFile: 'dark-tech',
    supportedThemes: ['dark'], // 仅支持暗色
  },
}

export const DESIGN_STYLE_LABELS = {
  'glass-morphism': '拟态玻璃',
  'corporate-minimal': '企业简约',
  'dark-tech': '深邃科技',
} as const
```

### 3. Store 扩展

```typescript
// src/stores/theme.ts (扩展现有)

export function createThemeStore(options: ThemeStoreOptions = {}) {
  const {
    defaultMode = DEFAULT_THEME_OPTIONS.defaultMode,
    defaultMenuTheme = DEFAULT_THEME_OPTIONS.defaultMenuTheme,
    defaultDesignStyle = DEFAULT_THEME_OPTIONS.defaultDesignStyle, // 🆕
    storageKey = DEFAULT_THEME_OPTIONS.storageKey,
    enableTransition = DEFAULT_THEME_OPTIONS.enableTransition,
    transitionDuration = DEFAULT_THEME_OPTIONS.transitionDuration,
  } = options

  return defineStore('theme', () => {
    // ============ 现有状态保持不变 ============
    const mode = ref<ThemeMode>(savedMode || defaultMode)
    const systemIsDark = ref(mediaQuery?.matches ?? false)
    const menuTheme = ref<MenuThemeType>(savedMenuTheme || defaultMenuTheme)

    // ============ 新增设计风格状态 ============
    const savedDesignStyle =
      typeof window !== 'undefined'
        ? (localStorage.getItem(
            DEFAULT_THEME_OPTIONS.designStyleKey
          ) as DesignStyle)
        : null

    const designStyle = ref<DesignStyle>(savedDesignStyle || defaultDesignStyle)

    // ============ 现有计算属性保持不变 ============
    const isDark = computed(() => {
      if (mode.value === 'system') {
        return systemIsDark.value
      }
      return mode.value === 'dark'
    })

    // ============ 新增计算属性 ============

    /** 当前设计风格配置 */
    const currentDesignStyleConfig = computed(() => {
      return DESIGN_STYLE_CONFIGS[designStyle.value]
    })

    /** 当前设计风格是否支持当前主题模式 */
    const isDesignStyleSupported = computed(() => {
      const config = currentDesignStyleConfig.value
      return config.supportedThemes.includes(mode.value)
    })

    // ============ 内部方法扩展 ============

    const syncThemeAttr = () => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement

        // 现有属性
        const themeValue = isDark.value ? 'dark' : 'light'
        root.setAttribute('data-theme', themeValue)
        root.setAttribute('data-menu-theme', menuTheme.value)

        // 新增设计风格属性
        root.setAttribute('data-design-style', designStyle.value)
      }
    }

    /** 加载设计风格CSS */
    const loadDesignStyleCSS = async (style: DesignStyle) => {
      if (typeof document === 'undefined') return

      // 移除旧的设计风格CSS
      const oldLink = document.querySelector('link[data-design-style-css]')
      if (oldLink) {
        oldLink.remove()
      }

      // 加载新的设计风格CSS
      const config = DESIGN_STYLE_CONFIGS[style]
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `/themes/${config.cssFile}.css` // 假设CSS文件在public/themes/目录
      link.setAttribute('data-design-style-css', 'true')

      return new Promise<void>((resolve, reject) => {
        link.onload = () => resolve()
        link.onerror = () =>
          reject(new Error(`Failed to load ${config.cssFile}.css`))
        document.head.appendChild(link)
      })
    }

    // ============ Actions 扩展 ============

    const init = () => {
      // 现有初始化逻辑保持不变
      if (mediaQuery) {
        systemIsDark.value = mediaQuery.matches
      }

      // 同步所有属性到 DOM
      syncThemeAttr()

      // 加载初始设计风格CSS
      loadDesignStyleCSS(designStyle.value)

      // 现有监听器保持不变
      if (mediaQuery) {
        mediaQuery.addEventListener('change', e => {
          systemIsDark.value = e.matches
          if (mode.value === 'system') {
            syncThemeAttr()
          }
        })
      }
    }

    // 现有方法保持不变
    const setMode = async (newMode: ThemeMode) => {
      // 检查设计风格兼容性
      const config = DESIGN_STYLE_CONFIGS[designStyle.value]
      if (!config.supportedThemes.includes(newMode)) {
        console.warn(
          `Design style "${designStyle.value}" doesn't support theme mode "${newMode}"`
        )
        // 可以选择自动切换到兼容的设计风格
        if (newMode === 'light' && designStyle.value === 'dark-tech') {
          await setDesignStyle('glass-morphism')
        }
      }

      const oldDark = isDark.value
      mode.value = newMode

      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newMode)
      }

      const newDark = isDark.value

      if (oldDark === newDark) {
        syncThemeAttr()
        return
      }

      if (enableTransition) {
        await useViewTransition(syncThemeAttr, {
          duration: transitionDuration,
        })
      } else {
        syncThemeAttr()
      }
    }

    const setMenuTheme = (theme: MenuThemeType) => {
      menuTheme.value = theme
      localStorage.setItem(DEFAULT_THEME_OPTIONS.menuThemeKey, theme)
      syncThemeAttr()
    }

    // 🆕 新增设计风格方法
    const setDesignStyle = async (style: DesignStyle) => {
      // 检查主题模式兼容性
      const config = DESIGN_STYLE_CONFIGS[style]
      if (!config.supportedThemes.includes(mode.value)) {
        console.warn(
          `Theme mode "${mode.value}" is not supported by design style "${style}"`
        )
        // 可以选择自动切换到兼容的主题模式
        if (style === 'dark-tech' && mode.value !== 'dark') {
          await setMode('dark')
        }
      }

      const oldStyle = designStyle.value
      designStyle.value = style

      if (typeof window !== 'undefined') {
        localStorage.setItem(DEFAULT_THEME_OPTIONS.designStyleKey, style)
      }

      // 加载新的CSS并更新DOM
      try {
        if (enableTransition) {
          await useViewTransition(
            async () => {
              await loadDesignStyleCSS(style)
              syncThemeAttr()
            },
            {
              duration: transitionDuration,
            }
          )
        } else {
          await loadDesignStyleCSS(style)
          syncThemeAttr()
        }
      } catch (error) {
        console.error('Failed to load design style:', error)
        // 回滚到旧风格
        designStyle.value = oldStyle
      }
    }

    const toggleDesignStyle = async () => {
      const styles = Object.keys(DESIGN_STYLE_CONFIGS) as DesignStyle[]
      const currentIndex = styles.indexOf(designStyle.value)
      const nextIndex = (currentIndex + 1) % styles.length
      await setDesignStyle(styles[nextIndex])
    }

    // ============ 返回扩展 ============
    return {
      // 现有状态
      mode,
      systemIsDark,
      isDark,
      menuTheme,

      // 新增状态
      designStyle,
      currentDesignStyleConfig,
      isDesignStyleSupported,

      // 现有方法
      init,
      setMode,
      toggleMode,
      toggleDark,
      setMenuTheme,

      // 新增方法
      setDesignStyle,
      toggleDesignStyle,
    }
  })
}
```

### 4. CSS 主题文件结构

```
@robot-admin/theme/
├── dist/
│   ├── themes/
│   │   ├── glass-morphism.css
│   │   ├── corporate-minimal.css
│   │   └── dark-tech.css
│   ├── index.js
│   └── index.d.ts
├── src/
│   ├── themes/
│   │   ├── glass-morphism/
│   │   │   ├── index.scss
│   │   │   ├── variables.scss
│   │   │   ├── components.scss      # 组件库 C_* 主题
│   │   │   └── naive-ui.scss        # Naive UI 覆盖
│   │   ├── corporate-minimal/
│   │   └── dark-tech/
│   └── ...现有文件
```

### 5. 使用方式

```typescript
// Robot Admin 项目中使用
import { useThemeStore } from '@robot-admin/theme'

const themeStore = useThemeStore()

// 现有功能保持不变
themeStore.setMode('dark')
themeStore.setMenuTheme('standard')

// 新增设计风格功能
themeStore.setDesignStyle('glass-morphism')
themeStore.toggleDesignStyle()

// 组合使用
await themeStore.setMode('dark')
await themeStore.setDesignStyle('dark-tech')
```

### 6. 组件库集成

```scss
// @robot-admin/naive-ui-components 中使用主题变量
.c-table-wrapper {
  // 使用主题包提供的CSS变量
  background: var(--dt-card-bg, rgba(255, 255, 255, 0.12));
  backdrop-filter: var(--dt-card-backdrop, none);
  border: 1px solid var(--dt-card-border, var(--border-color));
  transition: var(--dt-transition, all 0.3s ease);

  &:hover {
    transform: var(--dt-hover-transform, none);
    box-shadow: var(--dt-hover-shadow, none);
  }
}
```

## 🎯 实施计划

### Phase 1: 扩展类型和常量 (2-3天)

1. 扩展 TypeScript 类型定义
2. 添加设计风格配置常量
3. 更新导出接口

### Phase 2: 扩展 Store 逻辑 (3-4天)

1. 在现有 Store 中添加设计风格状态
2. 实现设计风格切换逻辑
3. 添加 CSS 动态加载功能
4. 确保向后兼容性

### Phase 3: 创建主题CSS文件 (1周)

1. 创建三种设计风格的 SCSS 文件
2. 实现组件库主题变量
3. 实现 Naive UI 覆盖样式
4. 构建和测试 CSS 文件

### Phase 4: 项目集成测试 (2-3天)

1. 在 Robot Admin 中测试新功能
2. 更新组件库使用新的主题变量
3. 确保所有功能正常工作

## ✅ 方案优势

1. **保持兼容性** - 现有代码无需修改
2. **职责统一** - 所有主题相关功能在一个包中
3. **扩展性强** - 易于添加新的设计风格
4. **维护成本低** - 统一的版本管理和发布
5. **类型安全** - 完整的 TypeScript 支持

## 🔄 版本规划

### v0.2.0 - 设计风格系统

- 添加设计风格类型和配置
- 扩展 Store 支持设计风格切换
- 提供基础的 CSS 主题文件

### v0.3.0 - 完整主题系统

- 完善所有设计风格的 CSS 实现
- 优化性能和兼容性
- 完善文档和示例

---

**结论：** 扩展现有 `@robot-admin/theme` 包是最优方案，既保持了架构的一致性，又实现了功能的完整性。
