/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\components\layout-responsive.component.ts
 * @Description: 真实布局桥接的窄屏临时折叠与桌面偏好持久化隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, disposePinia, setActivePinia, type Pinia } from 'pinia'
import { defineComponent, h, nextTick, reactive, ref, type Ref } from 'vue'
import {
  useLayoutContext,
  type LayoutContext,
  type MenuOptions,
} from '@robot-admin/layout/naive'
import { useMediaQuery } from '@vueuse/core'
import { useLayoutBridge } from '@/composables/useLayoutBridge'
import { s_settingsStore } from '@/stores/settings'
import { setupAppearanceSettingsPersistence } from '@/stores/settings/persistence'
import type { DynamicRoute } from '@/router/dynamicRouter'

const state = vi.hoisted(() => ({
  compact: undefined as unknown as Ref<boolean>,
  permission: undefined as unknown as {
    showMenuListGet: MenuOptions[]
    authMenuList: DynamicRoute[]
  },
  theme: undefined as unknown as { isDark: boolean },
}))
vi.mock('@vueuse/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useMediaQuery: vi.fn(() => state.compact),
}))
vi.mock('@/stores/permission', () => ({
  s_permissionStore: () => state.permission,
}))
vi.mock('@/stores/theme', () => ({ s_themeStore: () => state.theme }))

let pinia: Pinia
let stopPersistence: () => void
beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  state.compact = ref(false)
  state.permission = reactive({ showMenuListGet: [], authMenuList: [] })
  state.theme = reactive({ isDark: false })
  stopPersistence = setupAppearanceSettingsPersistence()
})
afterEach(() => {
  stopPersistence()
  disposePinia(pinia)
})

/** 使用真实桥接、上下文创建和注入，再从子组件操作公开折叠 Ref。 */
const mountBridge = () => {
  let provided!: LayoutContext
  let injected!: LayoutContext
  const Probe = defineComponent({
    name: 'ResponsiveLayoutProbe',
    /** 子组件消费真实 provide 的同一上下文，避免用测试桩替代桥接逻辑。 */
    setup() {
      injected = useLayoutContext()
      return () =>
        h('section', [
          h(
            'output',
            { 'data-testid': 'collapsed' },
            String(injected.collapsed!.value)
          ),
          h('output', { 'data-testid': 'dark' }, String(injected.isDark.value)),
          h(
            'button',
            {
              onClick: () => {
                injected.collapsed!.value = !injected.collapsed!.value
              },
            },
            '切换菜单'
          ),
        ])
    },
  })
  const wrapper = mount(
    defineComponent({
      name: 'ResponsiveLayoutHarness',
      /** 被测函数直接调用真实 createLayoutContext 与 provideLayoutContext。 */
      setup() {
        provided = useLayoutBridge()
        return () => h(Probe)
      },
    })
  )
  expect(injected).toBe(provided)
  return { wrapper, context: provided }
}
const persistedSettings = () =>
  Object.keys(localStorage)
    .sort()
    .map(key => [key, localStorage.getItem(key)])

test('桌面上下文双向使用真实设置Store，菜单与主题桥接继续保持响应式', async () => {
  const settings = s_settingsStore()
  settings.collapsed = false
  const { wrapper, context } = mountBridge()
  expect(useMediaQuery).toHaveBeenCalledWith('(max-width: 767px)')
  expect(wrapper.get('[data-testid="collapsed"]').text()).toBe('false')
  await wrapper.get('button').trigger('click')
  expect(settings.collapsed).toBe(true)
  settings.collapsed = false
  state.theme.isDark = true
  settings.sidebarWidth = 256
  state.permission.showMenuListGet = [
    {
      path: '/account/messages',
      name: 'account-messages',
      meta: { title: '消息中心' },
    },
  ]
  await nextTick()
  expect(wrapper.get('[data-testid="collapsed"]').text()).toBe('false')
  expect(wrapper.get('[data-testid="dark"]').text()).toBe('true')
  expect(context.sidebarWidth.value).toBe(256)
  expect(context.menus.value[0]).toMatchObject({
    path: '/account/messages',
    meta: { title: '消息中心' },
  })
})

test.each([false, true])(
  '窄屏折叠和手动展开不写入桌面偏好（桌面偏好=%s），再次进入窄屏重新折叠',
  async desktopCollapsed => {
    const settings = s_settingsStore()
    settings.collapsed = desktopCollapsed
    await nextTick()
    const { wrapper, context } = mountBridge()
    await nextTick()
    const saved = persistedSettings()
    expect(
      localStorage.getItem('robot-admin-appearance-settings')
    ).not.toBeNull()
    expect(context.collapsed!.value).toBe(desktopCollapsed)

    state.compact.value = true
    await nextTick()
    expect(wrapper.get('[data-testid="collapsed"]').text()).toBe('true')
    expect(settings.collapsed).toBe(desktopCollapsed)
    await wrapper.get('button').trigger('click')
    expect(context.collapsed!.value).toBe(false)
    expect(settings.collapsed).toBe(desktopCollapsed)
    expect(persistedSettings()).toEqual(saved)

    state.compact.value = false
    await nextTick()
    expect(context.collapsed!.value).toBe(desktopCollapsed)
    expect(settings.collapsed).toBe(desktopCollapsed)
    expect(persistedSettings()).toEqual(saved)

    state.compact.value = true
    await nextTick()
    expect(context.collapsed!.value).toBe(true)
    expect(settings.collapsed).toBe(desktopCollapsed)
    expect(persistedSettings()).toEqual(saved)
  }
)
