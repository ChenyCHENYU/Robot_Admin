/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 多文档代码草稿、语法加载和文本导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { CODE_FILES } from './data'
type CodeFile = (typeof CODE_FILES)[number]

/** 每份文件独立保存页面内的变更，恢复时回到同一份示例目录。 */
export function useCodeWorkspace() {
  const current = shallowRef<CodeFile>(CODE_FILES[0])
  const lineNumbers = ref(true)
  const wrap = ref(true)
  const drafts = reactive<Partial<Record<CodeFile['language'], string>>>({})
  const code = computed({
    get: () => drafts[current.value.language] ?? current.value.content,
    set: value => {
      drafts[current.value.language] = value
    },
  })
  const reset = () => {
    delete drafts[current.value.language]
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
  return { current, lineNumbers, wrap, code, reset, download }
}
