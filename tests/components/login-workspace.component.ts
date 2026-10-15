/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\tests\components\login-workspace.component.ts
 * @Description: 真实页面生命周期中的已验证公司选择、票据失效与激活重试
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { describe, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, type ShallowUnwrapRef } from 'vue'
import { useLoginWorkspace } from '@/composables/useLoginWorkspace'
import { getLoginCompaniesApi } from '@/api/auth'
import type { LoginResponse } from '@/api/auth.contract'

vi.mock('@/api/auth', () => ({ getLoginCompaniesApi: vi.fn() }))
const pending = (name: string): LoginResponse => ({
  code: '0',
  msg: 'success',
  data: {
    token: '',
    refreshToken: '',
    expiresIn: 0,
    loginTicket: 'ticket-' + name,
    user: { id: name, username: name, displayName: name },
    availableContexts: [
      {
        id: name + '-primary',
        tenantId: 'tenant',
        companyId: name + '-primary',
        tenantName: '租户',
        companyName: name + '主公司',
        isPrimary: true,
        roles: [],
      },
      {
        id: name + '-second',
        tenantId: 'tenant',
        companyId: name + '-second',
        tenantName: '租户',
        companyName: name + '兼任公司',
        isPrimary: false,
        roles: [],
      },
    ],
  },
})
const Harness = defineComponent({
  name: 'LoginWorkspaceHarness',
  /** 挂载真实生命周期与表单消费方。 */
  setup(_, { expose }) {
    const workspace = useLoginWorkspace()
    expose(workspace)
    return () =>
      h('div', [
        h('input', {
          value: workspace.username.value,
          onInput: (event: Event) => {
            workspace.username.value = (event.target as HTMLInputElement).value
          },
        }),
        h(
          'select',
          {
            value: workspace.selectedCompanyId.value,
            onChange: (event: Event) => {
              workspace.selectedCompanyId.value = (
                event.target as HTMLSelectElement
              ).value
            },
          },
          workspace.companyOptions.value.map(option =>
            h('option', { value: option.value }, option.label)
          )
        ),
        h('button', { disabled: !workspace.companyReady.value }, '确认公司'),
        h('p', workspace.companyHint.value),
      ])
  },
})
type Workspace = ShallowUnwrapRef<ReturnType<typeof useLoginWorkspace>>
const state = (wrapper: ReturnType<typeof mount>): Workspace =>
  wrapper.vm as unknown as Workspace

describe('验证后的公司选择', () => {
  test('只输入账号不会查询公司，验证成功后才允许选兼任公司并仅发送票据', async () => {
    const wrapper = mount(Harness)
    await wrapper.get('input').setValue(' A ')
    expect(getLoginCompaniesApi).not.toHaveBeenCalled()
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    const workspace = state(wrapper)
    const requestId = workspace.beginLogin(' A ')
    workspace.acceptPendingLogin(pending('A'), 'A', requestId)
    await wrapper.vm.$nextTick()
    expect(wrapper.get('select').element.value).toBe('A-primary')
    await wrapper.get('select').setValue('A-second')
    expect(workspace.beginActivation()).toEqual({
      requestId,
      username: 'A',
      request: { loginTicket: 'ticket-A', contextId: 'A-second' },
    })
    expect(JSON.stringify(workspace)).not.toContain('password')
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
  test('改账号或重新验证立即使旧请求和票据失效', async () => {
    const wrapper = mount(Harness)
    const workspace = state(wrapper)
    const first = workspace.beginLogin('A')
    workspace.acceptPendingLogin(pending('A'), 'A', first)
    await wrapper.get('input').setValue('B')
    expect(workspace.hasPendingActivation).toBe(false)
    expect(workspace.companies).toEqual([])
    expect(() => workspace.beginActivation()).toThrow('请先验证')
    expect(() =>
      workspace.acceptPendingLogin(pending('A'), 'A', first)
    ).toThrow('账号已变化')
    const second = workspace.beginLogin('B')
    workspace.acceptPendingLogin(pending('B'), 'B', second)
    workspace.failLogin(first)
    expect(workspace.hasPendingActivation).toBe(true)
    workspace.resetCompanySelection()
    expect(workspace.isCurrentLogin(second, 'B')).toBe(false)
  })
  test('不完整票据、提前令牌、无公司及多主公司都拒绝发布选择', () => {
    const workspace = state(mount(Harness))
    const requestId = workspace.beginLogin('A')
    const noTicket = pending('A')
    noTicket.data.loginTicket = ''
    expect(() =>
      workspace.acceptPendingLogin(noTicket, 'A', requestId)
    ).toThrow('凭据异常')
    const token = pending('A')
    token.data.token = 'premature-token'
    expect(() => workspace.acceptPendingLogin(token, 'A', requestId)).toThrow(
      '凭据异常'
    )
    const empty = pending('A')
    empty.data.availableContexts = []
    expect(() => workspace.acceptPendingLogin(empty, 'A', requestId)).toThrow(
      '配置异常'
    )
    const multi = pending('A')
    multi.data.availableContexts![1].isPrimary = true
    expect(() => workspace.acceptPendingLogin(multi, 'A', requestId)).toThrow(
      '配置异常'
    )
    expect(workspace.hasPendingActivation).toBe(false)
  })
  test('激活失败可重试原票据，卸载后不能恢复任何待激活状态', () => {
    const wrapper = mount(Harness)
    const workspace = state(wrapper)
    const requestId = workspace.beginLogin('A')
    workspace.acceptPendingLogin(pending('A'), 'A', requestId)
    const first = workspace.beginActivation()
    workspace.activationFailed(first.requestId)
    expect(workspace.companyReady).toBe(true)
    expect(workspace.companyError).toContain('重试')
    expect(workspace.beginActivation().request).toEqual(first.request)
    wrapper.unmount()
    expect(workspace.hasPendingActivation).toBe(false)
    expect(workspace.companies).toEqual([])
    expect(() =>
      workspace.acceptPendingLogin(pending('A'), 'A', requestId)
    ).toThrow('账号已变化')
  })
})
