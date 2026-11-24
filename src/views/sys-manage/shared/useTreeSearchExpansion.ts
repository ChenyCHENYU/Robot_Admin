/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\sys-manage\shared\useTreeSearchExpansion.ts
 * @Description: 系统管理树搜索期间的展开和恢复
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Ref } from 'vue'
import type {
  TreeExpose,
  TreeKey,
} from '@robot-admin/naive-ui-components/C_Tree'

/** 退出搜索时恢复搜索前的展开状态，数据刷新保留当前搜索。 */
export const useTreeSearchExpansion = (
  pattern: Ref<string>,
  rows: () => readonly unknown[],
  getTree: () => Pick<TreeExpose, 'expandedKeys' | 'expandAll'> | null,
  afterRestore?: () => void
) => {
  let savedKeys: TreeKey[] | undefined
  watch([pattern, rows], async ([keyword], [previous], onCleanup) => {
    if (!previous.trim() && keyword.trim())
      savedKeys = [...(getTree()?.expandedKeys ?? [])]
    let stale = false
    onCleanup(() => {
      stale = true
    })
    await nextTick()
    const tree = getTree()
    if (stale || !tree) return
    if (keyword.trim()) {
      tree.expandAll()
    } else if (savedKeys) {
      tree.expandedKeys = savedKeys
      savedKeys = undefined
      afterRestore?.()
    }
  })
}
