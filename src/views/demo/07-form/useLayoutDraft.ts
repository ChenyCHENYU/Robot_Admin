/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\07-form\useLayoutDraft.ts
 * @Description: 标签与步骤布局的页面内草稿快照
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormModel } from '@robot-admin/naive-ui-components/C_Form'

/** 每次恢复都生成新的对象，修改恢复后的模型不会污染快照。 */
export function useLayoutDraft(model: Ref<FormModel>) {
  const message = useMessage()
  let snapshot: string | undefined
  const saveDraft = () => {
    try {
      snapshot = JSON.stringify(model.value)
      message.success('草稿已保存到当前页面')
    } catch {
      message.error('草稿保存失败')
    }
  }
  const loadDraft = () => {
    if (snapshot === undefined) {
      message.warning('请先保存草稿')
      return
    }
    model.value = JSON.parse(snapshot)
    message.success('草稿已加载')
  }
  return { saveDraft, loadDraft }
}
