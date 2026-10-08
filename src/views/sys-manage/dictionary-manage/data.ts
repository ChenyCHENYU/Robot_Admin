/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\dictionary-manage\data.ts
 * @Description: 字典状态展示和表单默认配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DictFormData } from '@/api/dictionary-manage.contract'

export const DICT_STATUS_CONFIGS = [
  {
    field: 'status',
    values: {
      0: { text: '已停用', type: 'error' as const },
      1: { text: '', type: 'success' as const },
    },
  },
]

export const DEFAULT_DICT_FORM_DATA: DictFormData = {
  name: '',
  type: 'type',
  parentId: null,
  code: '',
  value: '',
  sort: 0,
  status: 1,
  remark: '',
  typeCode: '',
  dictLabel: '',
  dictValue: '',
}
