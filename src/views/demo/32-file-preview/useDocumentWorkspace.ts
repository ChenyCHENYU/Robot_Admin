/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 文档选择、批量加载与本地文件生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { resolveExternalLink } from '@/utils/d_externalLink'
import {
  SAMPLE_DOCUMENTS,
  documentKind,
  supportedDocument,
  type PreviewDocument,
} from './data'
const filenameFromUrl = (url: string) => {
  const name = new URL(url).pathname.split('/').pop() || ''
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}
/** 保持文件库和预览选择同步，文件只在当前会话保留。 */
export function useDocumentWorkspace() {
  const message = useMessage()
  const documents = shallowRef<PreviewDocument[]>([...SAMPLE_DOCUMENTS])
  const selectedId = ref('brief')
  const search = ref('')
  const fileRef = ref<HTMLInputElement | null>(null)
  const showLink = ref(false)
  const link = ref('')
  const revision = ref(0)
  const selected = computed(() =>
    documents.value.find(item => item.id === selectedId.value)
  )
  const filtered = computed(() =>
    documents.value.filter(item =>
      item.name.toLowerCase().includes(search.value.trim().toLowerCase())
    )
  )
  const addFiles = (files: File[]) => {
    const accepted = files.filter(
      file => supportedDocument(file.name) && file.size <= 30 * 1024 * 1024
    )
    const items = accepted.slice(0, 30 - documents.value.length).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      kind: documentKind(file.name),
      note: `本地文件 · ${(file.size / 1024).toFixed(1)} KB`,
      file,
    }))
    documents.value = [...documents.value, ...items]
    if (items.length) selectedId.value = items[0].id
    if (items.length !== files.length)
      message.warning(
        '支持 PDF、DOCX、XLSX、XLS，单个不超过 30 MB，文件库最多 30 项'
      )
  }
  const onFiles = (event: Event) => {
    const input = event.target as HTMLInputElement
    addFiles(Array.from(input.files ?? []))
    input.value = ''
  }
  const addLink = () => {
    const url = resolveExternalLink(link.value, location.origin)
    if (!url) {
      message.warning('请输入 HTTPS 地址或站内文件路径')
      return
    }
    const name = filenameFromUrl(url)
    if (!supportedDocument(name)) {
      message.warning('链接需要以支持的文件扩展名结尾')
      return
    }
    if (documents.value.length >= 30) {
      message.warning('文件库最多 30 项')
      return
    }
    const item = {
      id: crypto.randomUUID(),
      url,
      name,
      kind: documentKind(name),
      note: '链接文件 · 加载状态见预览区',
    }
    documents.value = [...documents.value, item]
    selectedId.value = item.id
    showLink.value = false
    link.value = ''
  }
  const removeSelected = () => {
    const id = selectedId.value
    documents.value = documents.value.filter(item => item.id !== id)
    selectedId.value = documents.value[0]?.id ?? ''
  }
  /** 保留预览组件实例，空源由组件负责取消任务并释放文档资源。 */
  const clearDocuments = () => {
    documents.value = []
    selectedId.value = ''
  }
  /** 会话内恢复随项目提供的离线文件，无需刷新或重新进入页面。 */
  const restoreSamples = () => {
    documents.value = [...SAMPLE_DOCUMENTS]
    selectedId.value = SAMPLE_DOCUMENTS[0]?.id ?? ''
  }
  const download = () => {
    const item = selected.value
    if (!item) return
    const url = item.file ? URL.createObjectURL(item.file) : item.url
    if (!url) return
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = item.name
    anchor.rel = 'noopener'
    anchor.target = '_blank'
    anchor.click()
    if (item.file) setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return {
    documents,
    selectedId,
    search,
    fileRef,
    showLink,
    link,
    revision,
    selected,
    filtered,
    onFiles,
    addLink,
    removeSelected,
    clearDocuments,
    restoreSamples,
    download,
    addFiles,
  }
}
