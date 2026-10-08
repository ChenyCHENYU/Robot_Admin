/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\data.ts
 * @Description: 菜单工作区状态展示和表单默认配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { DEFAULT_MENU_FORM_DATA } from '@/api/d_menu'

export const MENU_STATUS_CONFIGS = [
  {
    field: 'status',
    values: {
      0: { text: '禁用', type: 'error' as const },
      1: { text: '', type: 'success' as const },
    },
  },
  {
    field: 'hidden',
    values: {
      0: { text: '', type: 'success' as const },
      1: { text: '隐藏', type: 'warning' as const },
    },
  },
]

export const DEFAULT_FORM_DATA = { ...DEFAULT_MENU_FORM_DATA }
