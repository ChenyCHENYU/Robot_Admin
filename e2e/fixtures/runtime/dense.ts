/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-31
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\dense.ts
 * @Description: 真实发布包的 400 字段、长校验提示与输入帧耗时夹具，不进入产品构建
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { createApp, h, nextTick, ref } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { C_FormModal } from '@robot-admin/naive-ui-components/C_FormModal'
import type {
  FormOption,
  FormRecord,
} from '@robot-admin/naive-ui-components/C_Form'
import '@robot-admin/naive-ui-components/C_FormModal/style.css'

performance.mark('dense-form-mount-start')
const model = ref<FormRecord>(
  Object.fromEntries(
    Array.from({ length: 400 }, (_, i) => [`f${i}`, i ? '已填' : ''])
  )
)
const options: FormOption[] = Array.from({ length: 400 }, (_, i) => ({
  prop: `f${i}`,
  type: 'input',
  label: `字段 ${i + 1}`,
  ...(i
    ? {}
    : {
        rules: [
          {
            required: true,
            message:
              '请核对生产计划的客户、交付批次及对应业务范围，填写完整的有效信息后再提交；此处是用于确认多行校验提示能够完整展示的说明，不应遮挡下一行字段。',
          },
        ],
      }),
}))
const editor = {
  model,
  visible: ref(true),
  title: ref('400 字段密集录入'),
  mode: ref<'create' | 'edit'>('create'),
  loading: ref(false),
  setModel: (value: FormRecord) => {
    model.value = value
  },
  close: () => {
    editor.visible.value = false
  },
  submit: async () => false,
}
const config = {
  density: 'compact',
  labelPlacement: 'left',
  labelWidth: 84,
  layout: 'grid',
  grid: { cols: 12, minItemWidth: 250 },
} as const
createApp({
  render: () =>
    h(NConfigProvider, null, {
      default: () =>
        h(C_FormModal<FormRecord>, {
          editor,
          options,
          config,
          width: 'min(1120px, calc(100vw - 32px))',
          createText: '保存验证',
        }),
    }),
}).mount('#app')

// 两次 RAF 等待首次布局后的绘制边界；只存在于独立回归夹具中。
void nextTick(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      performance.mark('dense-form-mount-end')
      performance.measure(
        'dense-form-mount',
        'dense-form-mount-start',
        'dense-form-mount-end'
      )
    })
  })
})
