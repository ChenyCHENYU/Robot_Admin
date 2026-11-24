/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\data.ts
 * @Description: 远程订单工作台静态表格和表单配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import { BUSINESS_GRID } from '../shared/presentation'
import type { OrderDraft } from './api'

export { BUSINESS_DETAIL, BUSINESS_DETAIL_DIALOG } from '../shared/presentation'
export { actionIcons } from '../shared/actionIcons'

export const GRID_CONFIG = {
  ...BUSINESS_GRID,
  multiSort: true,
  defaultColDef: { sortable: true, filter: false },
}
export const VARIANTS = [
  { value: 'delivery', label: '交付明细' },
  { value: 'quality', label: '质量追溯' },
]
export const DRAFT_FIELDS: FormOption<OrderDraft>[] = [
  {
    prop: 'owner',
    label: '业务人员',
    type: 'input',
    rules: [{ required: true, message: '请填写业务人员', trigger: 'blur' }],
    attrs: { maxlength: 30, inputProps: { 'aria-label': '订单业务人员' } },
  },
  {
    prop: 'urgent',
    label: '交付要求',
    type: 'select',
    attrs: { clearable: false, 'aria-label': '订单交付要求' },
  },
  {
    prop: 'note',
    label: '订单备注',
    type: 'input',
    attrs: { maxlength: 200, inputProps: { 'aria-label': '订单备注' } },
  },
]
