/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\40-action-bar\useActionBarDemos.ts
 * @Description: 独立的表格动作、表单提交与当前页草稿
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { defineActions } from '@robot-admin/naive-ui-components/C_ActionBar'
import {
  PRESET_RULES,
  defineFormConfig,
  defineFormOptions,
  type FormInstance,
} from '@robot-admin/naive-ui-components/C_Form'
import type { TableInstance } from '@robot-admin/naive-ui-components/C_Table'
import { delayWithSignal } from '@/utils/abort'
import { MOCK_TABLE_DATA, type EmployeeRow } from './data'

/** 新增、删除和选择直接更新演示员工表；刷新保留本地增删。 */
export function useActionTableDemo() {
  const message = useMessage()
  const rows = ref(MOCK_TABLE_DATA.map(row => ({ ...row })))
  const selectedKeys = ref<Array<string | number>>([])
  const selectionCount = computed(() => selectedKeys.value.length)
  const tableRef = ref<TableInstance<EmployeeRow> | null>(null)
  const loading = ref(false)
  let nextId = Math.max(...MOCK_TABLE_DATA.map(row => row.id))

  const updateSelection = (keys: Array<string | number>) => {
    selectedKeys.value = keys
  }
  const clearSelection = () => {
    tableRef.value?.clearSelection()
    updateSelection([])
  }
  const actions = defineActions([
    {
      key: 'add',
      onClick: () => {
        const id = ++nextId
        rows.value = [
          ...rows.value,
          {
            id,
            name: `演示员工 ${id}`,
            department: '待分配',
            role: '待分配',
            status: '待入职',
          },
        ]
        message.success('已新增一条本地演示记录')
      },
    },
    {
      key: 'delete',
      disabled: () => !selectionCount.value,
      onClick: () => {
        const selected = new Set(selectedKeys.value)
        rows.value = rows.value.filter(row => !selected.has(row.id))
        clearSelection()
        message.success(`已移除 ${selected.size} 条本地演示记录`)
      },
    },
    {
      key: 'refresh',
      loading,
      onClick: async () => {
        loading.value = true
        try {
          await delayWithSignal(750)
          rows.value = [...rows.value]
          message.info('已重新读取本地演示列表')
        } finally {
          loading.value = false
        }
      },
    },
  ])
  return {
    tableRef,
    table: proxyRefs({
      rows,
      selectionCount,
      loading,
      actions,
      updateSelection,
      clearSelection,
    }),
  }
}

interface ActionDemoForm {
  username: string
  email: string
}

export const FORM_FIELDS = defineFormOptions<ActionDemoForm>([
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入',
    rules: [PRESET_RULES.required('用户名')],
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入',
    rules: [PRESET_RULES.optional(PRESET_RULES.email('邮箱'))],
  },
])

const FORM_CONFIG = defineFormConfig<ActionDemoForm>({
  labelPlacement: 'left',
  labelWidth: 80,
  showActions: false,
  submitSuccessText: '提交演示完成，数据未持久化',
  onSubmit: (_payload, context) => delayWithSignal(1000, context?.signal),
})

/** 按钮组复用表单本身的提交锁，草稿只保存在当前页面。 */
export function useActionFormDemo() {
  const message = useMessage()
  const formRef = ref<FormInstance<ActionDemoForm> | null>(null)
  const form = ref<ActionDemoForm>({ username: '', email: '' })
  const draft = shallowRef<ActionDemoForm>()
  const submitting = computed(() => formRef.value?.isSubmitting ?? false)
  const actions = defineActions([
    {
      key: 'save-draft',
      label: '草稿',
      icon: 'mdi:content-save-outline',
      disabled: submitting,
      onClick: () => {
        draft.value = { ...form.value }
        message.info('已保存本页草稿')
      },
    },
    {
      key: 'restore-draft',
      label: '恢复草稿',
      icon: 'mdi:restore',
      disabled: () => !draft.value || submitting.value,
      onClick: () => {
        if (draft.value) form.value = { ...draft.value }
      },
    },
    {
      key: 'reset',
      disabled: submitting,
      onClick: () => {
        formRef.value?.resetFields()
      },
    },
    {
      key: 'submit',
      label: '提交',
      icon: 'mdi:check',
      type: 'primary',
      loading: submitting,
      onClick: () => formRef.value?.submit(),
    },
  ])
  return {
    formRef,
    form: proxyRefs({ model: form, actions, config: FORM_CONFIG }),
  }
}
