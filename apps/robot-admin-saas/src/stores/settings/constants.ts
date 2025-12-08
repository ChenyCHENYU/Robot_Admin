/**
 * 主题配置系统 - 常量定义
 */

import type { ThemePreset } from './types'

// ============ 主题色预设 ============
export const PRESET_COLORS = [
  { name: '拂晓蓝', value: '#409eff' },
  { name: '薄暮红', value: '#f5222d' },
  { name: '火山橙', value: '#fa541c' },
  { name: '日暮黄', value: '#faad14' },
  { name: '极光绿', value: '#52c41a' },
  { name: '明青', value: '#13c2c2' },
  { name: '极客蓝', value: '#2f54eb' },
  { name: '酱紫', value: '#722ed1' },
] as const

// ============ 主题预设方案 ============
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: '科技蓝',
    description: '蓝色科技风，适合技术型项目',
    icon: '💙',
    primaryColor: '#409eff',
    themeMode: 'dark',
    layoutMode: 'side',
    settings: {
      borderRadius: 'medium',
      transitionType: 'slide',
      showBreadcrumb: true,
      showTagsView: true,
      tagsViewStyle: 'default',
    },
  },
  {
    name: '清新绿',
    description: '绿色清新风，适合环保/健康类项目',
    icon: '💚',
    primaryColor: '#52c41a',
    themeMode: 'light',
    layoutMode: 'top',
    settings: {
      borderRadius: 'large',
      transitionType: 'fade',
      showBreadcrumb: true,
      showTagsView: true,
      tagsViewStyle: 'card',
    },
  },
  {
    name: '商务灰',
    description: '灰色商务风，适合企业级应用',
    icon: '🖤',
    primaryColor: '#666666',
    themeMode: 'dark',
    layoutMode: 'side',
    settings: {
      borderRadius: 'small',
      transitionType: 'none',
      showBreadcrumb: false,
      showTagsView: true,
      tagsViewStyle: 'default',
    },
  },
  {
    name: '活力橙',
    description: '橙色活力风，适合创意/设计类项目',
    icon: '🧡',
    primaryColor: '#fa541c',
    themeMode: 'light',
    layoutMode: 'side',
    settings: {
      borderRadius: 'large',
      transitionType: 'zoom',
      showBreadcrumb: true,
      showTagsView: true,
      tagsViewStyle: 'smart',
    },
  },
  {
    name: '优雅紫',
    description: '紫色优雅风，适合艺术/文化类项目',
    icon: '💜',
    primaryColor: '#722ed1',
    themeMode: 'light',
    layoutMode: 'top',
    settings: {
      borderRadius: 'medium',
      transitionType: 'fade',
      showBreadcrumb: true,
      showTagsView: false,
      tagsViewStyle: 'card',
    },
  },
  {
    name: '经典红',
    description: '红色经典风，适合电商/营销类项目',
    icon: '❤️',
    primaryColor: '#f5222d',
    themeMode: 'light',
    layoutMode: 'side',
    settings: {
      borderRadius: 'medium',
      transitionType: 'slide',
      showBreadcrumb: true,
      showTagsView: true,
      tagsViewStyle: 'default',
    },
  },
]

// ============ 圆角映射 ============
export const BORDER_RADIUS_MAP = {
  small: '4px',
  medium: '6px',
  large: '8px',
} as const

// ============ 动画映射 ============
export const TRANSITION_MAP = {
  fade: 'fade-transform',
  slide: 'fade-slide',
  zoom: 'fade-zoom',
  none: '',
} as const

// ============ 默认配置 ============
export const DEFAULT_SETTINGS = {
  // 外观
  themeMode: 'light' as const,
  primaryColor: '#409eff',
  borderRadius: 'medium' as const,
  transitionType: 'slide' as const, // 默认滑动动画
  enableTransition: true,

  // 布局
  layoutMode: 'side' as const,
  fixedHeader: true,
  showBreadcrumb: true,
  showBreadcrumbIcon: true,
  showTagsView: true,
  tagsViewHeight: 44,
  tagsViewStyle: 'default' as const,
  showFooter: true, // 默认显示页脚
  sidebarWidth: 220,
  sidebarCollapsedWidth: 64,
  headerHeight: 56,

  // 高级
  enableHotkeys: true,
  version: '1.0.0',
}
