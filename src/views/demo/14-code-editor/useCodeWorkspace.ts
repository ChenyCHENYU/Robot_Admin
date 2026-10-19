/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 多文档代码草稿、语法加载和文本导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { codeExamples, sampleCodes } from './data'
import { useHighlight } from '@/plugins/highlight'
const CODE_FILES = [
  { language: 'javascript', name: 'utils.js' },
  { language: 'typescript', name: 'models.ts' },
  { language: 'json', name: 'config.json' },
  { language: 'cpp', name: 'main.cpp' },
  { language: 'rust', name: 'main.rs' },
  { language: 'swift', name: 'main.swift' },
  { language: 'php', name: 'index.php' },
  { language: 'ruby', name: 'library.rb' },
  { language: 'sql', name: 'schema.sql' },
]
/** 每个文件独立保留本页文本，预览只高亮、不执行代码。 */
export function useCodeWorkspace() {
  const language = ref('javascript')
  const lineNumbers = ref(true)
  const wrap = ref(true)
  const loading = ref(false)
  const status = ref('')
  const highlighter = useHighlight()
  const drafts = ref<Record<string, string>>({
    javascript: codeExamples.javascript,
    typescript: codeExamples.typescript,
    json: codeExamples.json,
    ...sampleCodes,
  })
  const current = computed(() =>
    CODE_FILES.find(file => file.language === language.value)!
  )
  const code = computed({
    get: () => drafts.value[language.value] ?? '',
    set: (value: string) => {
      drafts.value[language.value] = value
    },
  })
  const reset = () => {
    drafts.value[language.value] =
      language.value in sampleCodes
        ? sampleCodes[language.value]
        : codeExamples[language.value as 'javascript' | 'typescript' | 'json']
  }
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([code.value], { type: 'text/plain;charset=utf-8' })
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = current.value.name
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  watch(
    language,
    async value => {
      loading.value = true
      const ready = await highlighter.loadLanguage(value)
      if (language.value !== value) return
      status.value = ready ? '语法高亮已就绪' : '当前使用纯文本预览'
      loading.value = false
    },
    { immediate: true }
  )
  return {
    CODE_FILES,
    language,
    lineNumbers,
    wrap,
    loading,
    status,
    current,
    code,
    reset,
    download,
  }
}
