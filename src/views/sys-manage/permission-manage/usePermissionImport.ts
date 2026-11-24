/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\sys-manage\permission-manage\usePermissionImport.ts
 * @Description: 权限导入文件预览、确认与生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { PermissionDraft } from '@/api/permission-manage.contract'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { parsePermissionImport } from './d_permissionImport'

interface PermissionImportOptions {
  enabled: boolean
  codes: () => string[]
  commit: (drafts: PermissionDraft[]) => Promise<void>
}

/** 读取失败时提示 JSON 格式，其余错误沿用领域校验原因。 */
function importErrorMessage(error: unknown) {
  if (error instanceof SyntaxError) return '文件解析失败，请检查 JSON 格式'
  return error instanceof Error ? error.message : '导入失败'
}

/** 只让最后选择的有效文件进入确认，写入前再核对当前权限编码。 */
export function usePermissionImport({
  enabled,
  codes,
  commit,
}: PermissionImportOptions) {
  const message = useMessage()
  const dialog = useDialog()
  const inputRef = ref<HTMLInputElement | null>(null)
  const { run, cancel } = useLatestRequest()
  let preview: ReturnType<typeof dialog.warning> | undefined

  const closePreview = () => {
    const previous = preview
    preview = undefined
    previous?.destroy()
  }
  const invalidate = () => {
    cancel()
    closePreview()
  }
  onDeactivated(invalidate)
  onScopeDispose(invalidate)

  const choose = () => {
    if (enabled) inputRef.value?.click()
  }

  const confirm = async (
    drafts: PermissionDraft[],
    current: ReturnType<typeof dialog.warning>
  ) => {
    if (preview !== current) return
    try {
      const checked = parsePermissionImport(drafts, codes())
      // 确认仅可提交一次。快速再次选择文件时，新预览不受旧确认影响。
      preview = undefined
      await commit(checked)
      message.success(`已导入 ${checked.length} 条权限`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '导入失败')
      if (preview === current) return false
    }
  }

  const read = async () => {
    const input = inputRef.value
    const file = input?.files?.[0]
    if (input) input.value = ''
    if (!enabled || !file) return
    invalidate()
    try {
      if (file.size > 1024 * 1024) throw new Error('导入文件不能超过 1 MB')
      const drafts = await run(async () =>
        parsePermissionImport(JSON.parse(await file.text()), codes())
      )
      if (!drafts) return
      const names = drafts
        .slice(0, 3)
        .map(row => row.name)
        .join('、')
      const tail = drafts.length > 3 ? '等' : ''
      const dismiss = () => {
        if (preview === current) preview = undefined
      }
      const current = dialog.warning({
        title: '确认导入权限',
        content: `已校验 ${drafts.length} 条权限：${names}${tail}。确认后添加到当前演示列表。`,
        positiveText: '确认导入',
        negativeText: '取消',
        onPositiveClick: () => confirm(drafts, current),
        onNegativeClick: dismiss,
        onClose: dismiss,
        onMaskClick: dismiss,
        onEsc: dismiss,
        onAfterLeave: dismiss,
      })
      preview = current
    } catch (error) {
      message.error(importErrorMessage(error))
    }
  }

  return { inputRef, choose, read }
}
