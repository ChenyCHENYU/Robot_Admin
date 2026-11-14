/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\tests\components\component-theme-app.component.ts
 * @Description: 正式主题配置驱动原生控件、组件与应用变量，并在卸载后释放投影
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { createPinia, disposePinia } from 'pinia'
import { NConfigProvider, NInput } from 'naive-ui'
import { C_Skeleton } from '@robot-admin/naive-ui-components/C_Skeleton'
import { createComponentTheme } from '@robot-admin/naive-ui-components/config'
import { setupThemeSystem } from '@/plugins/theme'
import { s_themeStore } from '@/stores/theme'
import { s_settingsStore } from '@/stores/settings'

test('原生与自绘主题响应设置，嵌套 Provider 保留独立颜色和草稿', async () => {
  const previousPrimary =
    document.documentElement.style.getPropertyValue('--app-primary')
  document.documentElement.style.setProperty(
    '--app-primary',
    '#123456',
    'important'
  )
  const pinia = createPinia()
  const draft = ref('保留未提交草稿')
  const nested = createComponentTheme({
    bgCard: '#fffabc',
    skeletonBg: '#abc123',
  })
  const app = createApp(
    defineComponent({
      name: 'ComponentThemeAppTest',
      /** 使用应用正式 Store 绑定同一个 Provider。 */
      setup() {
        const theme = s_themeStore()
        return () =>
          h(
            NConfigProvider,
            {
              theme: theme.currentTheme,
              themeOverrides: theme.themeOverrides,
            },
            {
              default: () => [
                h(NInput, { class: 'theme-input', value: draft.value }),
                h(C_Skeleton, { class: 'theme-skeleton', animation: false }),
                h(NConfigProvider, nested, {
                  default: () => h(C_Skeleton, { class: 'nested-skeleton' }),
                }),
              ],
            }
          )
      },
    })
  )
  app.use(pinia)
  const container = document.createElement('div')
  document.body.append(container)
  setupThemeSystem(app)
  app.mount(container)
  try {
    const theme = s_themeStore(pinia)
    const settings = s_settingsStore(pinia)
    const input = container.querySelector('.theme-input')!
    const field = input.querySelector('input')!
    const skeleton = container.querySelector<HTMLElement>('.theme-skeleton')!
    const nestedSkeleton =
      container.querySelector<HTMLElement>('.nested-skeleton')!
    expect(
      document.documentElement.style.getPropertyValue('--app-bg-content')
    ).toBe('#ffffff')
    expect(nestedSkeleton.style.getPropertyValue('--c-theme-bg-card')).toBe(
      '#fffabc'
    )
    settings.primaryColor = '#ffff00'
    await theme.setMode('dark')
    await nextTick()
    expect(
      document.documentElement.style.getPropertyValue('--app-primary')
    ).toBe('#ffff00')
    expect(
      document.documentElement.style.getPropertyValue('--app-bg-content')
    ).toBe('#1f2937')
    expect(getComputedStyle(input).getPropertyValue('--n-color')).toBe(
      '#1f2937'
    )
    expect(skeleton.style.getPropertyValue('--c-theme-bg-card')).toBe('#1f2937')
    expect(nestedSkeleton.style.getPropertyValue('--c-theme-bg-card')).toBe(
      '#fffabc'
    )
    expect(container.querySelector('.theme-input input')).toBe(field)
    expect(field.value).toBe('保留未提交草稿')
    expect(document.documentElement.style.getPropertyValue('--c-primary')).toBe(
      ''
    )
  } finally {
    app.unmount()
    disposePinia(pinia)
  }
  expect(document.documentElement.style.getPropertyValue('--app-primary')).toBe(
    '#123456'
  )
  expect(
    document.documentElement.style.getPropertyPriority('--app-primary')
  ).toBe('important')
  expect(
    document.documentElement.style.getPropertyValue('--app-bg-content')
  ).toBe('')
  if (previousPrimary)
    document.documentElement.style.setProperty('--app-primary', previousPrimary)
  else document.documentElement.style.removeProperty('--app-primary')
  container.remove()
})
