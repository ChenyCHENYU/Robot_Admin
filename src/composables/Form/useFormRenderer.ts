/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: C_Form 渲染引擎 Composable — 统一组件注册表 + formItems 生成
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { VNode, ComputedRef, Component } from 'vue'

import type { FormOption, FormModel, OptionItem } from '@/types/modules/form'
import type { ResolvedFormConfig } from './useFormConfig'

// =================== 组件映射类型 ===================

/** 组件映射表 — 由调用方（C_Form）注入已解析的组件引用 */
export type ComponentMap = Record<string, Component>

// =================== 渲染器类型 ===================

/** 单个控件的渲染函数签名 */
export type FormRenderer = (
  baseProps: Record<string, any>,
  item: FormOption,
  config: ResolvedFormConfig,
  ctx?: { slots?: Record<string, any>; components?: ComponentMap }
) => VNode | null

// =================== 渲染器工厂 ===================

/**
 * 构建渲染器注册表
 * @param C - 组件映射表（由 C_Form 的 <script setup> 解析并注入）
 *
 * 为什么不在 .ts 文件中直接 resolveComponent？
 * unplugin-vue-components 只转换 .vue SFC 中的 resolveComponent 调用，
 * .ts 文件中的 resolveComponent 不会被转换，运行时无法找到组件。
 */
function buildRenderers(C: ComponentMap): Record<string, FormRenderer> {
  return {
    // ===== 基础控件 =====
    input: props => h(C.NInput, { ...props }),
    textarea: props => h(C.NInput, { ...props, type: 'textarea' }),
    inputNumber: props => h(C.NInputNumber, { ...props }),
    switch: props => h(C.NSwitch, { ...props }),
    slider: props => h(C.NSlider, { ...props }),
    rate: props => h(C.NRate, { ...props }),
    datePicker: props => h(C.NDatePicker, { ...props }),
    daterange: props => h(C.NDatePicker, { ...props, type: 'daterange' }),
    timePicker: props => h(C.NTimePicker, { ...props }),
    cascader: props => h(C.NCascader, { ...props }),
    colorPicker: props => h(C.NColorPicker, { ...props }),

    // ===== 复杂控件 — 带子元素/插槽 =====
    select: (baseProps, item) =>
      h(C.NSelect, {
        ...baseProps,
        options:
          item.children?.map((child: OptionItem) => ({
            value: child.value,
            label: child.label,
            disabled: child.disabled,
          })) || [],
      }),

    checkbox: (baseProps, item) =>
      h(
        C.NCheckboxGroup,
        { ...baseProps },
        {
          default: () =>
            h(
              C.NSpace,
              {},
              {
                default: () =>
                  item.children?.map((child: OptionItem) =>
                    h(C.NCheckbox, {
                      value: child.value,
                      label: child.label,
                      disabled: child.disabled,
                      key: String(child.value),
                    })
                  ) || [],
              }
            ),
        }
      ),

    radio: (baseProps, item) =>
      h(
        C.NRadioGroup,
        { ...baseProps },
        {
          default: () =>
            h(
              C.NSpace,
              {},
              {
                default: () =>
                  item.children?.map((child: OptionItem) =>
                    h(
                      C.NRadio,
                      {
                        value: child.value,
                        disabled: child.disabled,
                        key: String(child.value),
                      },
                      { default: () => child.label }
                    )
                  ) || [],
              }
            ),
        }
      ),

    upload: (baseProps, item, _config, ctx) =>
      h(
        C.NUpload,
        {
          fileList: baseProps.value || [],
          'onUpdate:fileList': (fileList: any[]) => {
            baseProps['onUpdate:value']?.(fileList)
          },
          ...item.attrs,
        },
        {
          trigger: () =>
            ctx?.slots?.['uploadClick']?.() ||
            h(C.NButton, { type: 'primary' }, { default: () => '选择文件' }),
          tip: () => ctx?.slots?.['uploadTip']?.() || null,
        }
      ),

    editor: (baseProps, item, config) =>
      h(C.C_Editor, {
        editorId: `editor-${item.prop}`,
        modelValue: baseProps.value || '',
        placeholder: item.placeholder,
        disabled: config.disabled,
        readonly: config.readonly,
        'onUpdate:modelValue': (value: string) => {
          baseProps['onUpdate:value']?.(value)
        },
        ...item.attrs,
      }),
  }
}

/** 自定义渲染器扩展存储 */
const customRenderers: Record<string, FormRenderer> = {}

/**
 * 运行时注册自定义渲染器 — 开闭原则
 * @param type - 控件类型名
 * @param renderer - 渲染函数
 */
export function registerRenderer(type: string, renderer: FormRenderer) {
  customRenderers[type] = renderer
}

// =================== Composable ===================

/**
 * 渲染引擎 Composable — 生成 formItems VNode 数组
 * @param componentMap - 已解析的组件映射表（由 C_Form 的 <script setup> 提供）
 */
export function useFormRenderer(
  formModel: FormModel,
  visibleOptions: ComputedRef<FormOption[]>,
  config: ComputedRef<ResolvedFormConfig>,
  handleFieldChange: (field: string) => void,
  componentMap: ComponentMap,
  instanceSlots?: Record<string, any>
) {
  // 构建渲染器注册表（注入已解析的组件引用）
  const renderers = { ...buildRenderers(componentMap), ...customRenderers }

  /**
   * 为指定表单项生成基础 props（双向绑定 + 占位符）
   */
  const getBaseProps = (item: FormOption): Record<string, any> => {
    const baseProps: Record<string, any> = {
      value: formModel[item.prop],
      'onUpdate:value': (value: any) => {
        formModel[item.prop] = value
        handleFieldChange(item.prop)
      },
    }

    if (item.type === 'textarea') {
      baseProps.type = 'textarea'
    }

    if (item.placeholder) {
      baseProps.placeholder = item.placeholder
    }

    return baseProps
  }

  /**
   * 渲染单个表单项控件
   */
  const renderFormItem = (item: FormOption): VNode | null => {
    try {
      const renderer = renderers[item.type]
      if (!renderer) {
        console.warn(`[C_Form] 未支持的组件类型: ${item.type}`)
        return null
      }

      const baseProps = getBaseProps(item)
      return renderer({ ...baseProps, ...item.attrs }, item, config.value, {
        slots: instanceSlots,
        components: componentMap,
      })
    } catch (error) {
      console.error(`[C_Form] 渲染表单项失败:`, error, item)
      return null
    }
  }

  /**
   * formItems: 各布局组件接收的 VNode[] ，每个 VNode 是一个 NFormItem
   */
  const formItems = computed(() =>
    visibleOptions.value.map(item =>
      h(
        componentMap.NFormItem,
        {
          label: item.label,
          path: item.prop,
          key: item.prop,
          required: !!item.rules?.length,
        },
        {
          default: () => renderFormItem(item),
        }
      )
    )
  )

  return { renderFormItem, formItems, getBaseProps }
}
