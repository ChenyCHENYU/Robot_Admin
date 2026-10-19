/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\components\highlight-adapter.component.ts
 * @Description: 应用高亮适配与真实 C_Code 共享上下文和隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, reactive, type App } from 'vue'
import { NCode } from 'naive-ui'
import { C_Code } from '@robot-admin/naive-ui-components/C_Code'
import {
  initializeHighlight,
  setupHighlight,
  useHighlight,
  type HighlightAPI,
} from '@/plugins/highlight'

/** 使用应用真实插件安装路径挂载消费组件。 */
function mountCodeApp() {
  let manager!: HighlightAPI
  let app!: App
  const hostHighlight = { owner: 'host' }
  const source = reactive({ code: 'const value = 1', language: 'javascript' })
  const wrapper = mount(
    defineComponent({
      name: 'HighlightAdapterHarness',
      /** 控件与代码组件应共享当前应用管理器。 */
      setup() {
        manager = useHighlight()
        return () => h(C_Code, source)
      },
    }),
    {
      global: {
        stubs: { C_Icon: true },
        plugins: [
          target => {
            app = target
            target.config.globalProperties.$highlight = hostHighlight
            setupHighlight(target)
          },
        ],
      },
    }
  )
  return { wrapper, manager, app, hostHighlight, source }
}

test('页面控件和 C_Code 使用同一管理器，不同应用语言注册互不影响', async () => {
  const beforeWindow = Object.getOwnPropertyDescriptor(window, 'hljs')
  const left = mountCodeApp()
  const right = mountCodeApp()

  const leftAdapter = left.wrapper.findComponent(NCode).props('hljs')!
  const rightAdapter = right.wrapper.findComponent(NCode).props('hljs')!
  // C_Code 传入可刷新身份的薄适配对象；通过注册表与真实渲染验证实际所属引擎。
  expect(leftAdapter.getLanguage('javascript')).toBe(
    left.manager.getHljs().getLanguage('javascript')
  )
  expect(rightAdapter.getLanguage('javascript')).toBe(
    right.manager.getHljs().getLanguage('javascript')
  )
  expect(left.wrapper.get('pre.__code__').element.innerHTML).toBe(
    left.manager
      .getHljs()
      .highlight(left.source.code, { language: 'javascript' }).value
  )
  expect(right.wrapper.get('pre.__code__').element.innerHTML).toBe(
    right.manager
      .getHljs()
      .highlight(right.source.code, { language: 'javascript' }).value
  )
  expect(left.manager.getHljs()).not.toBe(right.manager.getHljs())
  expect(await left.manager.loadLanguage('cpp')).toBe(true)
  expect(left.manager.getHljs().getLanguage('cpp')).toBeTruthy()
  expect(right.manager.getHljs().getLanguage('cpp')).toBeUndefined()
  expect(leftAdapter.getLanguage('cpp')).toBe(
    left.manager.getHljs().getLanguage('cpp')
  )
  expect(rightAdapter.getLanguage('cpp')).toBeUndefined()
  left.source.code = 'int main() { return 0; }'
  left.source.language = 'cpp'
  await flushPromises()
  expect(left.wrapper.get('pre.__code__').element.innerHTML).toBe(
    left.manager.getHljs().highlight(left.source.code, { language: 'cpp' })
      .value
  )
  expect(
    left.wrapper.findAll('pre.__code__ [class^="hljs-"]').length
  ).toBeGreaterThan(0)
  expect(right.manager.getHljs().getLanguage('cpp')).toBeUndefined()
  expect(right.wrapper.get('pre.__code__').text()).toBe('const value = 1')
  expect(Object.getOwnPropertyDescriptor(window, 'hljs')).toEqual(beforeWindow)

  left.wrapper.unmount()
  expect(left.app.config.globalProperties.$highlight).toBe(left.hostHighlight)
  expect(right.app.config.globalProperties.$highlight).toBe(right.manager)
})

test('独立初始化保持隔离，加载失败不伪报成功', async () => {
  const first = initializeHighlight()
  const second = initializeHighlight()
  expect(first.getHljs()).not.toBe(second.getHljs())
  expect(await first.loadLanguage('unsupported-robot-language')).toBe(false)
  expect(first.getLoadedLanguages()).not.toContain('unsupported-robot-language')
})
