/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\tests\components\menu-brand.component.ts
 * @Description: 品牌区直接跟随布局状态，宽度变化不再产生另一份折叠判定
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import MenuBrand from '@/components/global/C_MenuTop/index.vue'

const theme = reactive({ menuTheme: 'signature' })
vi.mock('@/stores/theme', () => ({ s_themeStore: () => theme }))

afterEach(() => {
  theme.menuTheme = 'signature'
})

test('同一品牌实例随布局展开和收起，不受模拟容器宽度影响', async () => {
  const wrapper = mount(MenuBrand, { props: { collapsed: false } })
  expect(wrapper.get('.menu-top__title').text()).toBe('Robot Admin')
  // 自定义 96px 收起宽度仍应服从 collapsed，避免历史 <=80px 的测宽判定。
  await wrapper.setProps({ collapsed: true, style: 'width:96px' })
  expect(wrapper.find('.menu-top__copy').exists()).toBe(false)
  expect(wrapper.get('video').element.tagName).toBe('VIDEO')
  expect(wrapper.classes()).toContain('menu-top--collapsed')
  await wrapper.setProps({ collapsed: false, style: 'width:64px' })
  expect(wrapper.get('.menu-top__title').text()).toBe('Robot Admin')
  expect(wrapper.classes()).not.toContain('menu-top--collapsed')
  wrapper.unmount()
})

test('品牌明暗外观跟随唯一菜单主题状态', async () => {
  const wrapper = mount(MenuBrand)
  expect(wrapper.classes()).not.toContain('menu-top--standard')
  theme.menuTheme = 'standard'
  await wrapper.vm.$nextTick()
  expect(wrapper.classes()).toContain('menu-top--standard')
  expect(wrapper.get('video').attributes('aria-hidden')).toBe('true')
  wrapper.unmount()
})
