/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\config\dictionaries.ts
 * @Description: 应用枚举与远程字典声明，选项保持原始编码，展示风格由组件配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineEnum } from '@robot-admin/dictionary'
import { getDictionaryOptionsApi } from '@/api/dictionary-options'

export const ORDER_STATUS_OPTIONS = defineEnum([
  { value: 0, label: '待下达' },
  { value: 1, label: '执行中' },
  { value: 2, label: '已完成' },
])

/** 接口解包只适配一次；控件、详情与两种表格共享同一源。 */
export const APP_DICTIONARIES = {
  'order-status': ORDER_STATUS_OPTIONS,
  'user-status': {
    load: ({ signal }: { signal: AbortSignal }) =>
      getDictionaryOptionsApi('user_status', signal),
  },
}
