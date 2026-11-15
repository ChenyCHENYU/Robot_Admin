/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 多文档代码草稿、语法加载和文本导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { codeExamples, sampleCodes } from './data'
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
  const initialCodes: Record<string, string> = {
    javascript: codeExamples.javascript,
    typescript: codeExamples.typescript,
    json: codeExamples.json,
    ...sampleCodes,
  }
  const drafts = ref({ ...initialCodes })
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
    drafts.value[language.value] = initialCodes[language.value] ?? ''
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
  return {
    CODE_FILES,
    language,
    lineNumbers,
    wrap,
    current,
    code,
    reset,
    download,
  }
}
