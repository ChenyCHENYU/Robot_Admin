/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\composables\useDictLabels.ts
 * @Description: 详情字典绑定，仅衔接应用注入实例，响应式与加载策略由包负责
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MaybeRefOrGetter } from 'vue'
import {
  useDictionaryLabels,
  type DictionaryLabelFields,
  type DictionaryFieldInput,
  type DictionaryUseOptions,
} from '@robot-admin/dictionary/vue'
import type { DictionaryProvider } from '@robot-admin/dictionary'
import { DICTIONARY_PROVIDER_KEY } from '@robot-admin/naive-ui-components/config'
import { useAppDictionaries } from '@/utils/d_dictionaryContext'

/** 绑定一次字段与字典，模板直接读取 labels.field，不改写接口原码。 */
export function useDictLabels<
  TModel extends object,
  const TFields extends DictionaryLabelFields<NoInfer<TModel>>,
>(
  model: MaybeRefOrGetter<TModel | null | undefined>,
  fields: DictionaryFieldInput<TModel, TFields>,
  options: DictionaryUseOptions & { provider?: DictionaryProvider } = {}
) {
  const app = useAppDictionaries()
  // 与表单/搜索/表格读取同一个最近 Provider，避免各自建立不同兜底链。
  const provider = options.provider ?? inject(DICTIONARY_PROVIDER_KEY, app)
  return useDictionaryLabels<TModel, DictionaryProvider, TFields>(
    provider,
    model,
    fields,
    options
  )
}
