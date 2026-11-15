/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @FilePath: \Robot_Admin\tests\components\demo-component-adoption.component.ts
 * @Description: 组件升级后的键盘事件接入、业务草稿与缓存页模拟生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, KeepAlive, nextTick, ref } from 'vue'
import IconDemo from '@/views/demo/01-icon/index.vue'
import { useProgressDemo } from '@/views/demo/03-progress/data'
import { useCodeWorkspace } from '@/views/demo/14-code-editor/useCodeWorkspace'

const message = vi.hoisted(() => ({
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('naive-ui', async importOriginal => {
  const actual = await importOriginal<typeof import('naive-ui')>()
  return { ...actual, useMessage: () => message }
})
const IconStub = defineComponent({
  name: 'C_Icon',
  props: ['name', 'clickable', 'loading'],
  emits: ['click'],
  /** 保留组件事件边界，不用 DOM 冒泡伪装组件 emit。 */
  setup: () => () => h('span'),
})

test('图标直接消费组件的键盘 click 事件，一次激活只反馈一次', async () => {
  const wrapper = mount(IconDemo, {
    global: {
      stubs: { C_Icon: IconStub, C_Code: true, c_vTitle: true, Icon: true },
    },
  })
  const clickable = wrapper
    .findAllComponents(IconStub)
    .find(icon => icon.props('name') === 'lucide:star')!
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  })
  clickable.vm.$emit('click', event)
  await nextTick()
  expect(message.info).toHaveBeenCalledExactlyOnceWith('图标被点击')
})

test('缓存进度页只启动两组模拟，离开暂停、回来续接，卸载清理', async () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  let progress!: ReturnType<typeof useProgressDemo>
  const Page = defineComponent({
    name: 'ProgressAdoptionHarness',
    /** 使用真实页面控制器与 KeepAlive 生命周期。 */
    setup() {
      progress = useProgressDemo()
      return () => h('span', String(progress.circlePercentages.value[0]))
    },
  })
  const visible = ref(true)
  const Other = defineComponent({
    name: 'OtherAdoptionHarness',
    setup: () => () => h('div'),
  })
  const wrapper = mount(
    defineComponent({
      /** 模拟真实标签页往返，状态由 KeepAlive 保留。 */
      setup: () => () =>
        h(KeepAlive, null, {
          default: () => (visible.value ? h(Page) : h(Other)),
        }),
    })
  )
  expect(vi.getTimerCount()).toBe(2)
  await vi.advanceTimersByTimeAsync(100)
  expect(progress.circlePercentages.value[0]).toBe(1)
  visible.value = false
  await nextTick()
  expect(vi.getTimerCount()).toBe(0)
  await vi.advanceTimersByTimeAsync(5000)
  expect(progress.circlePercentages.value[0]).toBe(1)
  visible.value = true
  await nextTick()
  expect(vi.getTimerCount()).toBe(2)
  await vi.advanceTimersByTimeAsync(100)
  expect(progress.circlePercentages.value[0]).toBe(2)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
})

test('代码页各文件草稿独立保留，恢复示例只影响当前文件', async () => {
  let workspace!: ReturnType<typeof useCodeWorkspace>
  const wrapper = mount(
    defineComponent({
      name: 'CodeWorkspaceAdoptionHarness',
      /** 页面只负责文本草稿，不持有高亮加载状态。 */
      setup() {
        workspace = useCodeWorkspace()
        return () => h('span', workspace.code.value)
      },
    })
  )
  const original = workspace.code.value
  workspace.code.value = 'changed javascript'
  workspace.language.value = 'json'
  await nextTick()
  workspace.code.value = '{"business":true}'
  workspace.language.value = 'javascript'
  await nextTick()
  expect(workspace.code.value).toBe('changed javascript')
  workspace.reset()
  expect(workspace.code.value).toBe(original)
  workspace.language.value = 'json'
  await flushPromises()
  expect(wrapper.text()).toBe('{"business":true}')
})
