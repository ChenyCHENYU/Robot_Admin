/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\components\image-workspace-exports.component.ts
 * @Description: 图片裁剪异步结果与签名水印的页面契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NCheckbox, NDialogProvider, NMessageProvider } from 'naive-ui'
import type { CropResult } from '@robot-admin/naive-ui-components/C_ImageCropper'
import CropPage from '@/views/demo/45-image-cropper/index.vue'
import SignaturePage from '@/views/demo/42-signature/index.vue'
import { deferred } from './d_deferred'

test('替图解码与旧图导出交错时丢弃旧结果，随后可重新导出', async () => {
  const decode = deferred<void>()
  const previousExport = deferred<CropResult>()
  const result: CropResult = {
    base64: 'data:image/png;base64,',
    blob: new Blob([], { type: 'image/png' }),
    width: 100,
    height: 100,
    format: 'png',
  }
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 100
      naturalHeight = 100
      decode = () => decode.promise
    }
  )
  const getCropResult = vi
    .fn()
    .mockReturnValueOnce(previousExport.promise)
    .mockResolvedValue(result)
  const cropper = defineComponent({
    name: 'C_ImageCropper',
    emits: ['ready'],
    /** 页面仍通过正式的裁剪实例方法与就绪事件交互。 */
    setup(_, { expose }) {
      expose({ getCropResult })
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(NMessageProvider, null, () => h(CropPage)),
    }),
    { global: { stubs: { C_ImageCropper: cropper, C_ActionBar: true } } }
  )
  try {
    wrapper.findAllComponents(cropper)[0].vm.$emit('ready')
    const fileInput = wrapper.get('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', {
      value: [new File(['new source'], 'new.png', { type: 'image/png' })],
    })
    await fileInput.trigger('change')
    const generate = wrapper
      .findAll('button')
      .find(button => button.text() === '生成裁剪结果')!
    await generate.trigger('click')
    expect(getCropResult).toHaveBeenCalledOnce()

    decode.resolve(undefined)
    await flushPromises()
    expect(wrapper.get('.crop-source').text()).toContain('new.png')
    previousExport.resolve(result)
    await flushPromises()
    expect(wrapper.find('.crop-result__canvas img').exists()).toBe(false)

    wrapper.findAllComponents(cropper)[0].vm.$emit('ready')
    await wrapper.vm.$nextTick()
    await generate.trigger('click')
    await flushPromises()
    expect(wrapper.find('.crop-result__canvas img').exists()).toBe(true)
  } finally {
    wrapper.unmount()
    vi.unstubAllGlobals()
  }
})

test('签名导出的水印参数跟随页面复选框', async () => {
  const exportImage = vi.fn().mockResolvedValue('data:image/png;base64,')
  const signature = defineComponent({
    name: 'C_Signature',
    emits: ['change'],
    /** 捕获页面传入正式签名导出方法的配置。 */
    setup(_, { expose }) {
      expose({ isEmpty: () => false, export: exportImage })
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(SignaturePage))
        ),
    }),
    { global: { stubs: { C_Signature: signature, C_Icon: true } } }
  )
  try {
    wrapper.getComponent(signature).vm.$emit('change', [{}])
    await wrapper.vm.$nextTick()
    const generate = wrapper
      .findAll('button')
      .find(button => button.text() === '生成签名图片')!
    await generate.trigger('click')
    await flushPromises()
    expect(exportImage).toHaveBeenLastCalledWith(
      expect.objectContaining({ includeWatermark: false })
    )

    const watermark = wrapper
      .findAllComponents(NCheckbox)
      .find(checkbox => checkbox.text() === '添加演示水印')!
    watermark.vm.$emit('update:checked', true)
    await wrapper.vm.$nextTick()
    await generate.trigger('click')
    await flushPromises()
    expect(exportImage).toHaveBeenLastCalledWith(
      expect.objectContaining({ includeWatermark: true })
    )
  } finally {
    wrapper.unmount()
  }
})
