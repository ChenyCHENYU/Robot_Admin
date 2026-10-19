/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 笔迹编辑、快照恢复与准确导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  SignatureExpose,
  SignatureStroke,
} from '@robot-admin/naive-ui-components/C_Signature'
/** 原始笔迹和生成图片分开保存，任何编辑都会明确标记结果过期。 */
export function useSignatureWorkspace() {
  const message = useMessage()
  const dialog = useDialog()
  const signatureRef = ref<SignatureExpose | null>(null)
  const penColor = ref('#25364f')
  const penWidth = ref(3)
  const watermark = ref(false)
  const readonly = ref(false)
  const format = ref<'png' | 'jpeg' | 'svg'>('png')
  const strokes = shallowRef<SignatureStroke[]>([])
  const saved = shallowRef<SignatureStroke[] | null>(null)
  const result = ref('')
  const stale = ref(false)
  const exporting = ref(false)
  const changed = (value: SignatureStroke[]) => {
    strokes.value = value
    if (result.value) stale.value = true
  }
  const save = () => {
    saved.value = JSON.parse(
      JSON.stringify(signatureRef.value?.getSignatureData() ?? [])
    )
    message.success('笔迹快照已保留在当前页面')
  }
  const restore = () => {
    if (saved.value)
      signatureRef.value?.loadSignatureData(
        JSON.parse(JSON.stringify(saved.value))
      )
  }
  const clear = () =>
    dialog.warning({
      title: '清空当前笔迹',
      content: '当前画布将清空，已保存的笔迹快照仍可恢复。',
      positiveText: '清空画布',
      negativeText: '保留',
      onPositiveClick: () => signatureRef.value?.clear(),
    })
  const generate = async () => {
    if (!signatureRef.value || signatureRef.value.isEmpty() || exporting.value)
      return
    exporting.value = true
    try {
      const value = await signatureRef.value.export({
        format: format.value,
        includeBackground: true,
        backgroundColor: '#ffffff',
        includeWatermark: true,
      })
      if (typeof value !== 'string') throw new Error('未能生成图片')
      result.value = value
      stale.value = false
    } catch (error) {
      message.error(error instanceof Error ? error.message : '导出失败，请重试')
    } finally {
      exporting.value = false
    }
  }
  const download = () => {
    if (!result.value || stale.value) return
    const anchor = document.createElement('a')
    anchor.href = result.value
    anchor.download = `signature.${format.value === 'jpeg' ? 'jpg' : format.value}`
    anchor.click()
  }
  watch([format, watermark], () => {
    if (result.value) stale.value = true
  })
  return {
    signatureRef,
    penColor,
    penWidth,
    watermark,
    readonly,
    format,
    strokes,
    saved,
    result,
    stale,
    exporting,
    changed,
    save,
    restore,
    clear,
    generate,
    download,
  }
}
