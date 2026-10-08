/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\components\cache-lifecycle.component.ts
 * @Description: 真实 KeepAlive 缓存组件身份与销毁请求取消
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, KeepAlive, ref } from 'vue'
import { bindCachedRouteComponent } from '@/utils/d_routeComponent'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { deferred } from './d_deferred'

test('路由缓存保留页面实例状态，根销毁取消在途请求且迟到结果不回写', async () => {
  const pending = deferred<string>()
  let signal!: AbortSignal
  const mounted = vi.fn()
  const state = ref('初始')
  const Original = defineComponent({
    name: 'CacheOriginal',
    /** 挂载真实响应式消费方，保持生命周期和模板事件。 */
    setup() {
      mounted()
      const request = useLatestRequest()
      const count = ref(0)
      const load = async () => {
        const result = await request.run(next => {
          signal = next
          return pending.promise
        })
        if (result !== undefined) state.value = result
      }
      return () =>
        h('section', [
          h('button', { onClick: () => count.value++ }, String(count.value)),
          h('a', { onClick: load }, '加载'),
          h('p', state.value),
        ])
    },
  })
  const loader = bindCachedRouteComponent('cached-page', async () => ({
    default: Original,
  }))
  const Cached = await loader()
  expect(Cached).toBe(await loader())
  const active = ref(true)
  const wrapper = mount(
    defineComponent({
      name: 'CacheHarness',
      setup: () => () =>
        h(
          KeepAlive,
          {},
          { default: () => (active.value ? h(Cached) : h('div', '其他页面')) }
        ),
    })
  )
  await wrapper.get('button').trigger('click')
  active.value = false
  await flushPromises()
  active.value = true
  await flushPromises()
  expect(wrapper.get('button').text()).toBe('1')
  expect(mounted).toHaveBeenCalledTimes(1)
  await wrapper.get('a').trigger('click')
  expect(signal.aborted).toBe(false)
  wrapper.unmount()
  expect(signal.aborted).toBe(true)
  pending.resolve('迟到结果')
  await flushPromises()
  expect(state.value).toBe('初始')
})
