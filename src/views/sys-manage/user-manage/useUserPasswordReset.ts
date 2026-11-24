/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\sys-manage\user-manage\useUserPasswordReset.ts
 * @Description: 密码重置弹窗的目标、草稿与公司边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  PRESET_RULES,
  type FormConfig,
  type FormInstance,
  type FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type { ResetPasswordForm, UserData } from '@/api/user-manage.contract'
import { resetUserPasswordApi } from '@/api/user-manage'
import { USER_FORM_RULES, DEFAULT_RESET_PASSWORD_FORM } from './data'

interface PasswordTarget {
  id: string
  revision: UserData['revision']
  membershipRevision: UserData['membershipRevision']
  contextId: string | undefined
}

/** 提交只使用打开弹窗时绑定的公司和人员版本；关闭立即丢弃密码。 */
export function useUserPasswordReset(
  getContextId: () => string | undefined,
  refresh: () => Promise<void>
) {
  const message = useMessage()
  const form = ref<FormInstance<ResetPasswordForm> | null>(null)
  const visible = ref(false)
  const model = reactive<ResetPasswordForm>({ ...DEFAULT_RESET_PASSWORD_FORM })
  let target: PasswordTarget | undefined
  const clear = () => {
    target = undefined
    Object.assign(model, DEFAULT_RESET_PASSWORD_FORM)
  }
  watch(
    visible,
    shown => {
      if (!shown) clear()
    },
    { flush: 'sync' }
  )
  onDeactivated(() => {
    visible.value = false
  })
  onScopeDispose(clear)

  const open = (
    user: Pick<UserData, 'id' | 'status' | 'revision' | 'membershipRevision'>
  ) => {
    if (user.status === 0) {
      message.warning('禁用用户无法重置密码')
      return
    }
    if (form.value?.isSubmitting) return
    clear()
    target = {
      id: user.id,
      revision: user.revision,
      membershipRevision: user.membershipRevision,
      contextId: getContextId(),
    }
    visible.value = true
  }

  const options: FormOption<ResetPasswordForm>[] = [
    {
      prop: 'newPassword',
      disabled: () => !!form.value?.isSubmitting,
      label: '新密码',
      type: 'input',
      placeholder: '请输入新密码',
      attrs: { type: 'password', showPasswordOn: 'click' },
      rules: USER_FORM_RULES.password,
    },
    {
      prop: 'confirmPassword',
      disabled: () => !!form.value?.isSubmitting,
      label: '确认密码',
      type: 'input',
      placeholder: '请再次输入新密码',
      attrs: { type: 'password', showPasswordOn: 'click' },
      rules: [PRESET_RULES.required('确认密码')],
      dependsOn: ['newPassword'],
      crossFieldValidator: model =>
        model.confirmPassword !== model.newPassword
          ? '两次密码输入不一致'
          : null,
    },
  ]
  const config: FormConfig<ResetPasswordForm> = {
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    onSubmit: async ({ model }) => {
      const selected = target
      if (!selected) throw new Error('未选择需要重置的用户')
      if (selected.contextId !== getContextId())
        throw new Error('当前公司已切换，请重新选择需要重置的用户')
      try {
        await resetUserPasswordApi(
          selected.id,
          model.newPassword,
          selected.revision,
          selected.membershipRevision,
          selected.contextId
        )
      } catch (error) {
        throw error instanceof Error ? error : new Error('密码重置失败')
      }
      if (target !== selected || selected.contextId !== getContextId()) return
      message.success('密码重置成功')
      await refresh()
    },
  }
  return { form, open, panel: proxyRefs({ visible, model, options, config }) }
}
