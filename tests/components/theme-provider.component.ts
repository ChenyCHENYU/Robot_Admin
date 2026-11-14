/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\tests\components\theme-provider.component.ts
 * @Description: 项目主题 Store 与正式组件包在同一 Provider 下的颜色和兼容回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { afterEach, expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, disposePinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import {
  NButton,
  NCheckbox,
  NConfigProvider,
  NDataTable,
  NDialog,
  NInput,
  NSelect,
  NSkeleton,
} from 'naive-ui'
import { C_Skeleton } from '@robot-admin/naive-ui-components/C_Skeleton'
import { s_settingsStore } from '../../src/stores/settings'
import { s_themeStore } from '../../src/stores/theme'

// 替换唯一的项目配色文件，验证接入真实自定义项目时无需改 Store 或业务组件。
vi.mock('../../src/config/theme/component-colors', () => ({
  PROJECT_COMPONENT_COLORS: {
    light: {
      primary: '#000000',
      bgBody: '#f4ede4',
      bgCard: '#fff9ee',
      bgSurface: '#fff6e4',
      bgMuted: '#ebe1d2',
      bgHover: '#e5d8c6',
      border: '#c3ab8c',
      text1: '#352719',
      skeletonBg: '#e0d2bf',
    },
    dark: {
      primary: '#000000',
      bgBody: '#201911',
      bgCard: '#30261c',
      bgSurface: '#3b2e20',
      bgMuted: '#443526',
      bgHover: '#51402d',
      border: '#8c7355',
      text1: '#fff3df',
      skeletonBg: '#65513a',
    },
  },
}))

const pinia = createPinia()
setActivePinia(pinia)
afterEach(() => {
  s_themeStore().destroy()
  disposePinia(pinia)
})

/** 从真实组件 DOM 读取 Naive 实际消费的主题变量。 */
function variable(root: Element, selector: string, name: string): string {
  const target = root.querySelector<HTMLElement>(selector)
  expect(target, selector).not.toBeNull()
  return target!.style.getPropertyValue(name)
}

test('单一 Provider 接入项目配色；设置和明暗原地生效，Dialog small 与菜单保持独立', async () => {
  const theme = s_themeStore()
  const settings = s_settingsStore()
  theme.init()
  await theme.setMode('light')
  settings.primaryColor = '#ffff00'
  settings.borderRadius = 'large'

  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          NConfigProvider,
          { theme: theme.currentTheme, themeOverrides: theme.themeOverrides },
          () => [
            h(NInput, { class: 'field', defaultValue: '保留未提交草稿' }),
            h(NSelect, {
              class: 'selection',
              options: [{ label: '组织', value: 'organization' }],
              defaultValue: 'organization',
            }),
            h(
              NButton,
              { class: 'brand', type: 'primary' },
              {
                default: () => '保存',
                icon: () =>
                  h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
                    h('path', {
                      fill: 'currentColor',
                      d: 'M4 4h16v16H4z',
                    }),
                  ]),
              }
            ),
            h(NCheckbox, { class: 'checked', checked: true }),
            h(NDataTable, {
              columns: [{ key: 'name', title: '项目' }],
              data: [{ key: 1, name: '组件主题' }],
            }),
            h(NSkeleton, { class: 'native-skeleton', animated: false }),
            h(C_Skeleton, { class: 'custom-skeleton', animation: false }),
            h(NDialog, {
              title: '确认操作',
              negativeText: '取消',
              positiveText: '确认',
            }),
          ]
        ),
    }),
    { attachTo: document.body, global: { plugins: [pinia] } }
  )
  await flushPromises()
  const input = wrapper.get<HTMLInputElement>('.field input').element
  const nativeInput = wrapper.get('.field').element
  expect(wrapper.findAllComponents(NConfigProvider)).toHaveLength(1)
  expect(variable(wrapper.element, '.field', '--n-color')).toBe('#fff9ee')
  expect(variable(wrapper.element, '.field', '--n-border')).toBe(
    '1px solid #c3ab8c'
  )
  expect(variable(wrapper.element, '.field', '--n-border-radius')).toBe('8px')
  expect(
    variable(wrapper.element, '.selection .n-base-selection', '--n-border')
  ).toBe('1px solid #c3ab8c')
  expect(variable(wrapper.element, '.brand', '--n-color')).toBe('#ffff00')
  expect(variable(wrapper.element, '.brand', '--n-text-color')).toBe('#ffffff')
  expect(
    getComputedStyle(wrapper.get('.brand .n-button__icon').element).color
  ).toBe('#ffffff')
  expect(wrapper.get('.brand svg path').attributes('fill')).toBe('currentColor')
  expect(variable(wrapper.element, '.checked', '--n-check-mark-color')).toBe(
    '#ffffff'
  )
  expect(
    getComputedStyle(wrapper.get('.checked .check-icon').element).fill
  ).toBe('#ffffff')
  expect(variable(wrapper.element, '.brand', '--n-border-radius')).toBe('8px')
  expect(variable(wrapper.element, '.n-data-table', '--n-th-color')).toBe(
    'rgba(235, 225, 210, 1)'
  )
  expect(variable(wrapper.element, '.native-skeleton', '--n-color-start')).toBe(
    '#e0d2bf'
  )
  expect(
    variable(wrapper.element, '.custom-skeleton', '--c-theme-skeleton-bg')
  ).toBe('#e0d2bf')
  expect(
    variable(wrapper.element, '.n-dialog__action button', '--n-height')
  ).toBe('22px')
  expect(
    variable(wrapper.element, '.n-dialog__action button', '--n-border-radius')
  ).toBe('6px')
  expect(theme.themeOverrides.Card?.borderRadius).toBe('8px')
  expect(theme.themeOverrides.Menu?.color).toBe('#0d1425')

  await theme.setMode('dark')
  settings.primaryColor = '#7c3aed'
  settings.borderRadius = 'small'
  await flushPromises()
  expect(wrapper.get('.field').element).toBe(nativeInput)
  expect(wrapper.get<HTMLInputElement>('.field input').element).toBe(input)
  expect(input.value).toBe('保留未提交草稿')
  expect(variable(wrapper.element, '.field', '--n-color')).toBe('#30261c')
  expect(variable(wrapper.element, '.field', '--n-border')).toBe(
    '1px solid #8c7355'
  )
  expect(variable(wrapper.element, '.field', '--n-border-radius')).toBe('4px')
  expect(
    variable(wrapper.element, '.selection .n-base-selection', '--n-border')
  ).toBe('1px solid #8c7355')
  expect(variable(wrapper.element, '.brand', '--n-color')).toBe('#7c3aed')
  expect(variable(wrapper.element, '.brand', '--n-text-color')).toBe('#ffffff')
  expect(
    getComputedStyle(wrapper.get('.brand .n-button__icon').element).color
  ).toBe('#ffffff')
  expect(variable(wrapper.element, '.checked', '--n-check-mark-color')).toBe(
    '#ffffff'
  )
  expect(
    getComputedStyle(wrapper.get('.checked .check-icon').element).fill
  ).toBe('#ffffff')
  expect(variable(wrapper.element, '.brand', '--n-border-radius')).toBe('4px')
  expect(variable(wrapper.element, '.n-data-table', '--n-th-color')).toBe(
    'rgba(68, 53, 38, 1)'
  )
  expect(variable(wrapper.element, '.native-skeleton', '--n-color-start')).toBe(
    '#65513a'
  )
  expect(
    variable(wrapper.element, '.custom-skeleton', '--c-theme-skeleton-bg')
  ).toBe('#65513a')
  expect(
    variable(wrapper.element, '.n-dialog__action button', '--n-height')
  ).toBe('22px')

  theme.setMenuTheme('standard')
  await theme.setDesignStyle('dark-tech')
  await theme.setMode('light')
  await flushPromises()
  expect(theme.mode).toBe('dark')
  expect(theme.designStyle).toBe('dark-tech')
  expect(theme.themeOverrides.Menu?.color).toBeUndefined()
  expect(theme.themeOverrides.Menu?.itemHeight).toBe('44px')
  expect(input.value).toBe('保留未提交草稿')
})
