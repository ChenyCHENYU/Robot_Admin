/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-02
 * @FilePath: \Robot_Admin\src\composables\useFieldDictionaries.ts
 * @Description: 项目自己的字典与控件组合；两个独立包均不感知对方
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MaybeRefOrGetter } from 'vue'
import {
  createDictionaryParser,
  type DictionaryProvider,
} from '@robot-admin/dictionary'
import { useDictionary, useDictionaries } from '@robot-admin/dictionary/vue'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { SearchFormItem } from '@robot-admin/naive-ui-components/C_FormSearch'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'

/** 字段与字典的业务关系只属于项目，不扩展组件包的字段协议。 */
export function useFieldDictionaries(
  bindings: Readonly<Record<string, string>>,
  config: {
    provider?: DictionaryProvider
    enabled?: MaybeRefOrGetter<boolean>
  } = {}
) {
  const provider = config.provider ?? useDictionaries()
  const sources = new Map<
    string,
    {
      view: ReturnType<typeof useDictionary>
      options: ReturnType<typeof createOptions>
      parse: ReturnType<typeof createDictionaryParser>
    }
  >()
  /** 自有控件快照只在选项变化时复制，loading/error 通知不重建整份选项。 */
  function createOptions(view: ReturnType<typeof useDictionary>) {
    return computed(() =>
      view.options.value.map(option => ({
        value: option.value,
        label: option.label,
        disabled: option.disabled,
      }))
    )
  }
  for (const name of new Set(Object.values(bindings))) {
    const view = useDictionary(
      () => {
        const source = provider.getDictionary(name)
        if (!source) throw new Error(`未配置字典：${name}`)
        return source
      },
      { enabled: config.enabled }
    )
    sources.set(name, {
      view,
      options: createOptions(view),
      parse: createDictionaryParser(() => view.options.value),
    })
  }
  const get = (field: string) => {
    const name = bindings[field]
    return name === undefined ? undefined : sources.get(name)
  }
  const optionState = (view: ReturnType<typeof useDictionary>) => ({
    loading: view.loading.value,
    error: view.error.value,
    retry: view.reload,
  })

  return {
    /** C_Form 获得纯 children/optionsState，不带字典名称、实例或订阅方法。 */
    form<T extends object>(fields: readonly FormOption<T>[]) {
      return computed(() =>
        fields.map(item => {
          const source = get(item.prop)
          if (!source || item.children !== undefined || item.asyncOptions)
            return item
          return {
            ...item,
            children: source.options.value,
            optionsState: optionState(source.view),
          }
        })
      )
    },
    /** 搜索条件仍提交原码，控件只接普通 list 和受控状态。 */
    search<T extends object>(fields: readonly SearchFormItem<T>[]) {
      return computed(() =>
        fields.map(item => {
          const source = get(item.prop)
          if (!source || item.list !== undefined) return item
          return {
            ...item,
            list: source.options.value,
            optionsState: optionState(source.view),
          } as SearchFormItem<T>
        })
      )
    },
    /** C_Table 只接普通 formatter；一个源一个订阅，单元格只做同步查表。 */
    table<T extends object>(columns: readonly TableColumn<T>[]) {
      return computed(() =>
        columns.map(column => {
          const source = 'key' in column ? get(String(column.key)) : undefined
          if (!source || column.formatter || column.render) return column
          // 让选项变化更新列快照，表格自身不订阅字典或依赖任何外部协议。
          void source.options.value
          return {
            ...column,
            formatter: {
              type: 'enum' as const,
              fn: (value: unknown) => source.view.label(value),
            },
          }
        })
      )
    },
    label: (field: string, value: unknown) =>
      get(field)?.view.label(value) ?? String(value ?? ''),
    parse: (field: string, value: unknown) => {
      const source = get(field)
      return source ? source.parse(value) : value
    },
  }
}
