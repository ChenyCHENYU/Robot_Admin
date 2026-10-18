/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\robot-form-015.test.ts
 * @Description: 校验八种表单示例数据、日期值、跨字段规则和实例配置隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import Schema from 'async-validator'
import type {
  FormOption,
  LayoutType,
} from '@robot-admin/naive-ui-components/C_Form'
import { testDataConfig } from '../src/views/demo/07-form/data'
import { formOptions as defaultFields } from '../src/views/demo/07-form/layouts/DefaultLayout/data'
import { formOptions as inlineFields } from '../src/views/demo/07-form/layouts/InlineLayout/data'
import { formOptions as gridFields } from '../src/views/demo/07-form/layouts/GridLayout/data'
import {
  FORM_OPTIONS,
  DEMO_FORM_DATA,
} from '../src/views/demo/07-form/layouts/CardLayout/data'
import {
  createFormOptions,
  getLayoutConfig,
} from '../src/views/demo/07-form/layouts/TabsLayout/data'
import { getFormOptions } from '../src/views/demo/07-form/layouts/StepsLayout/data'
import { BASE_FORM_OPTIONS } from '../src/views/demo/07-form/layouts/DynamicLayout/data'
import { employeeFormOptions } from '../src/views/demo/07-form/layouts/CustomLayout/data'

const layouts: { layout: LayoutType; fields: readonly FormOption[] }[] = [
  { layout: 'default', fields: defaultFields },
  { layout: 'inline', fields: inlineFields },
  { layout: 'grid', fields: gridFields },
  { layout: 'card', fields: FORM_OPTIONS },
  { layout: 'tabs', fields: createFormOptions() },
  { layout: 'steps', fields: getFormOptions() },
  { layout: 'dynamic', fields: BASE_FORM_OPTIONS },
  { layout: 'custom', fields: employeeFormOptions },
]

describe('正式包 0.15 表单页面接入', () => {
  test.each(layouts)(
    '$layout 填充数据只含真实字段，并通过该布局全部规则',
    async ({ layout, fields }) => {
      const model = testDataConfig.getTestData(layout)
      const fieldNames = new Set(fields.map(field => field.prop))
      expect(Object.keys(model).every(key => fieldNames.has(key))).toBe(true)
      const descriptor = Object.fromEntries(
        fields
          .filter(field => field.rules?.length)
          .map(field => [field.prop, field.rules])
      )
      await expect(new Schema(descriptor).validate(model)).resolves.toEqual(
        model
      )

      for (const field of fields) {
        if (field.type === 'datePicker') {
          expect(typeof model[field.prop]).toBe('number')
          expect(Number.isFinite(model[field.prop])).toBe(true)
        }
        if (field.type === 'checkbox')
          expect(Array.isArray(model[field.prop])).toBe(true)
      }
      await Promise.all(
        fields
          .filter(field => field.crossFieldValidator)
          .map(async field => {
            expect(await field.crossFieldValidator?.(model)).toBeNull()
          })
      )
    }
  )

  test.each(['tabs', 'steps'] as const)(
    '%s 密码变更后再次检查确认密码',
    async layout => {
      const fields = layout === 'tabs' ? createFormOptions() : getFormOptions()
      const confirm = fields.find(field => field.prop === 'confirmPassword')
      expect(confirm?.dependsOn).toEqual(['password'])
      const model = testDataConfig.getTestData(layout)
      expect(await confirm?.crossFieldValidator?.(model)).toBeNull()
      model.password = 'Changed123456'
      expect(await confirm?.crossFieldValidator?.(model)).toBe(
        '两次输入密码不一致'
      )
      model.confirmPassword = model.password
      expect(await confirm?.crossFieldValidator?.(model)).toBeNull()
    }
  )

  test('重复填充不会复用数组，卡片示例的日期也使用时间戳', () => {
    const first = testDataConfig.getTestData('card')
    const second = testDataConfig.getTestData('card')
    expect(first.hobbies).not.toBe(second.hobbies)
    if (Array.isArray(first.hobbies)) first.hobbies.push('sports')
    expect(second.hobbies).toEqual(['reading', 'music'])
    expect(typeof DEMO_FORM_DATA.birthday).toBe('number')
  })

  test('标签页配置按挂载实例隔离，修改一个实例不会改变另一个', () => {
    const first = getLayoutConfig()
    const second = getLayoutConfig()
    first.tabs.validateBeforeSwitch = true
    first.tabs.tabs[0].title = '当前实例标题'
    expect(second.tabs.validateBeforeSwitch).toBe(false)
    expect(second.tabs.tabs[0].title).toBe('基本信息')
  })
})
