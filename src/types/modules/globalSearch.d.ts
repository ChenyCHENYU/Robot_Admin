import type { MenuOption } from 'naive-ui/es'

/** 全局搜索菜单项 */
export interface SearchMenuItem {
  key: string
  label: string
  icon?: any
  children?: MenuOption[]
}

/** 搜索历史记录项 */
export interface HistoryItem {
  query: string
  menuItem: {
    key: string
    label: string
    icon?: any
    children?: any[]
  } | null
  timestamp: number
}
