/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\composables\useDictLabels.ts
 * @Description: 详情字典绑定，仅衔接应用注入实例，响应式与加载策略由包负责
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MaybeRefOrGetter } from 'vue'
import { useDictionaryLabels } from '@robot-admin/dictionary/vue'
import type { APP_DICTIONARIES } from '@/config/dictionaries'
import { useAppDictionaries } from '@/utils/d_dictionaryContext'

/** 绑定一次字段与字典，模板直接读取 labels.field，不改写接口原码。 */
export function useDictLabels<
  TModel extends object,
  TKey extends Extract<keyof TModel, string>,
>(
  model: MaybeRefOrGetter<TModel | null | undefined>,
  fields: Readonly<Record<TKey, keyof typeof APP_DICTIONARIES>>
) {
  return useDictionaryLabels(useAppDictionaries(), model, fields)
}
