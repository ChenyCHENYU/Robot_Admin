/*
 * @Description: 表格配置中心 — 编辑组件映射、表单生成、显示值处理
 * @Refactor: 配置构建逻辑迁至 composables/Table/useTableConfig.ts
 *            列渲染逻辑迁至 composables/Table/useTableColumns.ts
 */

import type { TableColumn, EditType } from '@/types/modules/table'
import type { FormOption, ComponentType } from '@/types/modules/form'
import type { FieldRule } from '@robot-admin/form-validate'

// ================= 编辑组件映射 =================

export const EDIT_COMPONENTS: Record<EditType, any> = {
  number: NInputNumber,
  switch: NSwitch,
  input: NInput,
  email: NInput,
  mobile: NInput,
  date: (props: any) =>
    h(NDatePicker, { ...props, type: 'date', format: 'yyyy-MM-dd' }),
  select: (props: any) =>
    h(NSelect, { ...props, options: props.options || [] }),
  textarea: (props: any) => h(NInput, { ...props, type: 'textarea', rows: 3 }),
}

// ================= 表单选项生成 =================

const EDIT_TO_FORM_TYPE: Record<string, ComponentType> = {
  number: 'inputNumber',
  date: 'datePicker',
  textarea: 'textarea',
  select: 'select',
  switch: 'switch',
}

/**
 * 根据可编辑列配置自动生成表单选项（用于编辑弹窗）
 */
export const generateFormOptions = (columns: TableColumn[]): FormOption[] =>
  columns.map(column => {
    const rules: FieldRule[] = column.required
      ? [
          {
            required: true,
            message: `请输入${column.title}`,
            trigger: ['blur', 'input'],
            validator: async (_: any, value: any) => {
              if (!value && value !== 0 && value !== false)
                throw new Error(`请输入${column.title}`)
            },
          },
        ]
      : []

    return {
      prop: column.key,
      label: column.title || column.key,
      type: EDIT_TO_FORM_TYPE[column.editType || 'input'] || 'input',
      placeholder: `请输入${column.title}`,
      rules,
      attrs: column.editProps || {},
      layout: { span: 1 },
      show: true,
    }
  })
