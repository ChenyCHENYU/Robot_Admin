/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 文档草稿、本机自动保存与准确导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { WORKSPACE_DOCUMENTS } from './data'
const STORAGE_KEY = 'robot-admin:markdown-workspace:v1'
/** 三份文档分别保留草稿，存储失败明确反馈，不把提示当作保存。 */
export function useMarkdownWorkspace() {
  const message = useMessage()
  const dialog = useDialog()
  const selectedId = ref('notes')
  const mode = ref<'edit' | 'editable' | 'preview'>('editable')
  const autoSave = ref(true)
  const fileRef = ref<HTMLInputElement | null>(null)
  const savedState = ref('内置示例')
  const savedSnapshot = ref('')
  const drafts = ref<Record<string, string>>(
    Object.fromEntries(WORKSPACE_DOCUMENTS.map(item => [item.id, item.content]))
  )
  let timer: ReturnType<typeof setTimeout> | undefined
  let active = true
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (stored?.version === 1 && stored.drafts) {
      WORKSPACE_DOCUMENTS.forEach(item => {
        if (
          typeof stored.drafts[item.id] === 'string' &&
          stored.drafts[item.id].length <= 100000
        )
          drafts.value[item.id] = stored.drafts[item.id]
      })
      savedState.value = '已恢复本机草稿'
    }
  } catch {
    savedState.value = '本机存储不可用'
    autoSave.value = false
  }
  savedSnapshot.value = JSON.stringify(drafts.value)
  const current = computed(() =>
    WORKSPACE_DOCUMENTS.find(item => item.id === selectedId.value)!
  )
  const content = computed({
    get: () => drafts.value[selectedId.value],
    set: (value: string) => {
      drafts.value[selectedId.value] = value
    },
  })
  const dirty = computed(
    () => JSON.stringify(drafts.value) !== savedSnapshot.value
  )
  const save = (notify = false) => {
    if (timer) clearTimeout(timer)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, drafts: drafts.value })
      )
      savedSnapshot.value = JSON.stringify(drafts.value)
      savedState.value = `已保存 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
      if (notify) message.success('全部文档草稿已保存到本机')
    } catch {
      savedState.value = '本机保存失败'
      autoSave.value = false
      message.error('本机保存失败，请导出文件留存')
    }
  }
  const exportFile = () => {
    const url = URL.createObjectURL(
      new Blob([content.value], { type: 'text/markdown;charset=utf-8' })
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = current.value.name
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importFile = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (!/\.(md|markdown|txt)$/i.test(file.name) || file.size > 1024 * 1024) {
      message.warning('请选择 1 MB 以内的 Markdown 或文本文件')
      return
    }
    const id = selectedId.value
    const { name } = current.value
    try {
      const text = await file.text()
      if (!active) return
      if (text.length > 100000) {
        message.warning('文档不能超过 100000 个字符')
        return
      }
      dialog.warning({
        title: '导入到当前文档',
        content: `将用「${file.name}」替换「${name}」的内容，其他文档保留。`,
        positiveText: '确认导入',
        negativeText: '取消',
        onPositiveClick: () => {
          if (active) {
            drafts.value[id] = text
            selectedId.value = id
          }
        },
      })
    } catch {
      if (active) message.error('文件读取失败，请重试')
    }
  }
  const restore = () =>
    dialog.warning({
      title: '恢复当前文档示例',
      content: '当前文档的修改将被示例替换，其他文档草稿保留。',
      positiveText: '恢复示例',
      negativeText: '保留修改',
      onPositiveClick: () => {
        content.value = current.value.content
      },
    })
  watch(
    drafts,
    () => {
      if (timer) clearTimeout(timer)
      if (autoSave.value) timer = setTimeout(() => save(), 700)
    },
    { deep: true }
  )
  watch(autoSave, enabled => {
    if (timer) clearTimeout(timer)
    if (enabled && dirty.value) save()
  })
  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
    if (autoSave.value && dirty.value) save()
    active = false
  })
  return {
    WORKSPACE_DOCUMENTS,
    drafts,
    selectedId,
    mode,
    autoSave,
    fileRef,
    savedState,
    current,
    content,
    dirty,
    save,
    exportFile,
    importFile,
    restore,
  }
}
