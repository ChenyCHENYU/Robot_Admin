/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\components\login-workspace.component.ts
 * @Description: 挂载账号公司选择，验证防抖、竞态、非法主公司和卸载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, type ShallowUnwrapRef } from 'vue'
import { useLoginWorkspace } from '@/composables/useLoginWorkspace'
import { getLoginCompaniesApi } from '@/api/auth'
import type { LoginCompaniesResponse } from '@/api/auth.contract'
import { deferred } from './d_deferred'

vi.mock('@/api/auth', () => ({ getLoginCompaniesApi: vi.fn() }))
const companies = (name: string): LoginCompaniesResponse => ({
  code: '0',
  data: {
    companies: [
      {
        id: name + '-primary',
        tenantName: '租户',
        companyName: name + '主公司',
        isPrimary: true,
      },
      {
        id: name + '-second',
        tenantName: '租户',
        companyName: name + '兼任公司',
        isPrimary: false,
      },
    ],
  },
})
const Harness = defineComponent({
  name: 'LoginWorkspaceHarness',
  /** 挂载真实响应式消费方，保持生命周期和模板事件。 */
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
        h('button', { disabled: !workspace.companyReady.value }, '登录'),
        h('p', workspace.companyHint.value),
      ])
  },
})

describe('账号公司选择', () => {
  test('防抖合并输入，默认主公司并允许选择兼任公司', async () => {
    vi.useFakeTimers()
    vi.mocked(getLoginCompaniesApi).mockResolvedValue(companies('A'))
    const wrapper = mount(Harness)
    await wrapper.get('input').setValue(' A ')
    await vi.advanceTimersByTimeAsync(299)
    expect(getLoginCompaniesApi).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()
    expect(getLoginCompaniesApi).toHaveBeenCalledExactlyOnceWith('A')
    expect(wrapper.get('select').element.value).toBe('A-primary')
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
    await wrapper.get('select').setValue('A-second')
    expect(
      (
        wrapper.vm as unknown as ShallowUnwrapRef<
          ReturnType<typeof useLoginWorkspace>
        >
      ).requireSelectedCompany(' A ')
    ).toBe('A-second')
  })
  test('改账号立即清除旧选择，迟到的旧响应不能覆盖新账号', async () => {
    vi.useFakeTimers()
    const first = deferred<LoginCompaniesResponse>()
    const second = deferred<LoginCompaniesResponse>()
    vi.mocked(getLoginCompaniesApi)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const wrapper = mount(Harness)
    await wrapper.get('input').setValue('A')
    await vi.advanceTimersByTimeAsync(300)
    await wrapper.get('input').setValue('B')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(() =>
      (
        wrapper.vm as unknown as ShallowUnwrapRef<
          ReturnType<typeof useLoginWorkspace>
        >
      ).requireSelectedCompany('A')
    ).toThrow()
    await vi.advanceTimersByTimeAsync(300)
    second.resolve(companies('B'))
    await flushPromises()
    first.resolve(companies('A'))
    await flushPromises()
    expect(wrapper.get('select').element.value).toBe('B-primary')
    expect(wrapper.text()).not.toContain('A主公司')
  })
  test('多主公司及无公司都不能绕过就绪校验', async () => {
    vi.useFakeTimers()
    const invalid = companies('A')
    invalid.data.companies[1].isPrimary = true
    vi.mocked(getLoginCompaniesApi)
      .mockResolvedValueOnce(invalid)
      .mockResolvedValueOnce({ code: '0', data: { companies: [] } })
    const wrapper = mount(Harness)
    await wrapper.get('input').setValue('A')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
    expect(wrapper.text()).toContain('主公司配置异常')
    expect(() =>
      (
        wrapper.vm as unknown as ShallowUnwrapRef<
          ReturnType<typeof useLoginWorkspace>
        >
      ).requireSelectedCompany('A')
    ).toThrow('主公司配置异常')
    await wrapper.get('input').setValue('B')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
    expect(wrapper.text()).toContain('未关联公司')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
  test('卸载取消待触发查询，在途响应不能回写已销毁实例', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Harness)
    await wrapper.get('input').setValue('A')
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(300)
    expect(getLoginCompaniesApi).not.toHaveBeenCalled()
    const response = deferred<LoginCompaniesResponse>()
    vi.mocked(getLoginCompaniesApi).mockReturnValue(response.promise)
    const next = mount(Harness)
    await next.get('input').setValue('B')
    await vi.advanceTimersByTimeAsync(300)
    const state = (
      next.vm as unknown as ShallowUnwrapRef<
        ReturnType<typeof useLoginWorkspace>
      >
    ).companies
    next.unmount()
    response.resolve(companies('B'))
    await flushPromises()
    expect(state).toEqual([])
  })
})
