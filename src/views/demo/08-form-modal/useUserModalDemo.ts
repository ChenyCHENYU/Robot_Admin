/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\08-form-modal\\useUserModalDemo.ts
 * @Description: 用户弹窗的演示记录编辑与草稿确认
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { FormRenderer } from '@robot-admin/naive-ui-components/C_Form'
import type {
  FormModalBeforeCloseContext,
  FormModalEditor,
  FormModalInstance,
} from '@robot-admin/naive-ui-components/C_FormModal'
import { modalUsers, type ModalUser } from './data'

/** 以两份本地用户资料展示同一弹窗的独立编辑会话。 */
export function useUserModalDemo() {
  const dialog = useDialog()
  const { record } = useComponentDemoProgress()
  const users = ref(modalUsers.map(user => ({ ...user })))
  const modalRef = ref<FormModalInstance>()
  const activeIndex = ref(0)
  const visible = ref(false)
  const model = ref<ModalUser | null>(null)
  const editor: FormModalEditor<ModalUser> = {
    visible,
    model,
    mode: ref('edit'),
    title: computed(() => `用户信息管理 · 记录 ${activeIndex.value + 1}`),
    loading: ref(false),
    setModel: draft => (model.value = draft),
    close: () => (visible.value = false),
    /** 在当前页面保存副本，后续重开可验证结果。 */
    async submit(draft) {
      if (!draft) return false
      users.value[activeIndex.value] = { ...draft }
      visible.value = false
      record('edit')
      return true
    },
  }

  /** 同一更新中替换记录标识和草稿，供弹窗重建比较基线。 */
  function activate(index: number) {
    const user = users.value[index]
    if (!user) return
    activeIndex.value = index
    editor.setModel({ ...user })
  }

  /** 每次打开都从最后保存的资料初始化。 */
  function openUserModal() {
    activate(activeIndex.value)
    visible.value = true
  }

  /** 沿用弹窗的未保存保护执行切换。 */
  function switchUser() {
    const nextIndex = (activeIndex.value + 1) % users.value.length
    return modalRef.value?.requestDiscard(() => activate(nextIndex))
  }

  /** 由宿主展示确认，旧会话取消时同时收起确认框。 */
  function confirmDiscard({ signal }: FormModalBeforeCloseContext) {
    return new Promise<boolean>(resolve => {
      const settle = (discard: boolean) => {
        signal.removeEventListener('abort', abort)
        resolve(discard)
      }
      const abort = () => {
        confirmation.destroy()
        settle(false)
      }
      const confirmation = dialog.warning({
        title: '放弃未保存的修改？',
        content: '继续编辑会保留当前草稿，放弃后将恢复最近保存的资料。',
        positiveText: '放弃修改',
        negativeText: '继续编辑',
        onPositiveClick: () => settle(true),
        onAfterLeave: () => settle(false),
      })
      signal.addEventListener('abort', abort, { once: true })
    })
  }

  const renderers: Record<string, FormRenderer> = {
    demoUserSwitcher: () =>
      h(
        NButton,
        { size: 'small', onClick: switchUser },
        {
          icon: () =>
            h('span', {
              class: 'i-mdi:swap-horizontal',
              'aria-hidden': 'true',
            }),
          default: () => '切换到另一条记录',
        }
      ),
  }

  return {
    editor,
    modalRef,
    activeIndex,
    renderers,
    openUserModal,
    confirmDiscard,
  }
}
