/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\views\production-sales\components\c_dictionaryExperience\data.ts
 * @Description: 字典共享与恢复体验，局部模拟不修改应用公司或真实业务数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  createDictionaryStore,
  createDictionaryProvider,
  defineEnum,
} from '@robot-admin/dictionary'
import {
  useDictionary,
  useDictionaryRefresh,
  useDictionaries,
  DICTIONARY_PROVIDER_KEY,
} from '@robot-admin/dictionary/vue'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
import type { SearchFormItem } from '@robot-admin/naive-ui-components/C_FormSearch'
import {
  defineTableColumns,
  defineTableConfig,
} from '@robot-admin/naive-ui-components/C_Table'
import {
  defineVueColumns,
  indexColumn,
  useMachTable,
} from '@agile-team/mach-table-vue'
import { createDictionaryColumn } from '@agile-team/mach-table-vue/business'
import { delayWithSignal } from '@/utils/abort'

interface ExampleRow {
  id: string
  warehouse: string
  delivery: string[]
  urgent: boolean
}
interface ExampleForm {
  warehouse: string
  delivery: string[]
  urgent: boolean
  account: string
}
interface ExampleQuery {
  warehouse: string | null
}

export const FORM_FIELDS: FormOption<ExampleForm>[] = [
  {
    prop: 'warehouse',
    label: '交付仓库',
    type: 'select',
    dictionary: 'example-warehouse',
    attrs: { 'aria-label': '表单交付仓库' },
  },
  {
    prop: 'delivery',
    label: '运输方式',
    type: 'select',
    dictionary: 'example-delivery',
    attrs: { multiple: true, 'aria-label': '运输方式' },
  },
  {
    prop: 'urgent',
    label: '加急要求',
    type: 'select',
    dictionary: 'example-urgent',
    attrs: { 'aria-label': '加急要求', clearable: false },
  },
  {
    prop: 'account',
    label: '账户状态',
    type: 'select',
    dictionary: 'user_status',
    attrs: { 'aria-label': '账户状态' },
  },
]
export const SEARCH_FIELDS: SearchFormItem<ExampleQuery>[] = [
  {
    prop: 'warehouse',
    label: '交付仓库',
    type: 'select',
    dictionary: 'example-warehouse',
    attrs: { 'aria-label': '搜索交付仓库' },
  },
]
export const TABLE_CONFIG = defineTableConfig<ExampleRow>({
  density: 'compact',
  pagination: false,
  toolbar: { show: false },
  display: {
    size: 'small',
    striped: true,
    bordered: true,
    singleLine: false,
    maxHeight: 180,
  },
})
export const TABLE_COLUMNS = defineTableColumns<ExampleRow>([
  { type: 'index', title: '序号', width: 48 },
  { key: 'warehouse', title: '交付仓库', dictionary: 'example-warehouse' },
  { key: 'delivery', title: '运输方式', dictionary: 'example-delivery' },
  { key: 'urgent', title: '加急要求', dictionary: 'example-urgent' },
])

/** 同一选项源供表单、搜索、详情、两种表格消费，所有按钮仅操作本次体验实例。 */
export function useDictionaryExperience() {
  const app = useDictionaries()
  const organization = ref('南京工厂')
  const requests = ref(0)
  let nextResult: 'error' | 'empty' | undefined
  const dictionaries = createDictionaryStore(
    {
      'example-delivery': defineEnum([
        { value: 'ROAD', label: '公路' },
        { value: 'RAIL', label: '铁路' },
        { value: 'SEA', label: '水运' },
      ]),
      'example-urgent': defineEnum([
        { value: false, label: '普通交付' },
        { value: true, label: '加急交付' },
      ]),
      'example-warehouse': {
        load: async ({
          signal,
          scope,
        }: {
          signal: AbortSignal
          scope: string
        }) => {
          requests.value++
          const result = nextResult
          nextResult = undefined
          await delayWithSignal(350, signal)
          if (result === 'error') throw new Error('体验用的单次加载失败')
          if (result === 'empty') return []
          return [
            { value: '001', label: `${scope} · 成品仓` },
            { value: '002', label: `${scope} · 周转仓` },
            { value: 'OLD', label: '历史仓库（已停用）', disabled: true },
          ]
        },
      },
    },
    { scope: organization.value }
  )
  const provider = createDictionaryProvider(dictionaries, app)
  provide(DICTIONARY_PROVIDER_KEY, provider)
  onScopeDispose(() => dictionaries.destroy())
  const warehouse = dictionaries.getDictionary('example-warehouse')
  const delivery = dictionaries.getDictionary('example-delivery')
  const urgent = dictionaries.getDictionary('example-urgent')
  const state = useDictionary(warehouse)
  const form = ref<ExampleForm>({
    warehouse: '001',
    delivery: ['ROAD', 'RAIL'],
    urgent: false,
    account: '0',
  })
  const { labels } = useDictLabels(form, FORM_FIELDS, { provider })
  const query = ref<ExampleQuery>({ warehouse: null })
  const applied = ref<ExampleQuery>({ warehouse: null })
  const rows: ExampleRow[] = [
    { id: '1', warehouse: '001', delivery: ['ROAD', 'RAIL'], urgent: false },
    { id: '2', warehouse: 'OLD', delivery: ['SEA'], urgent: true },
    { id: '3', warehouse: 'UNKNOWN', delivery: ['ROAD'], urgent: false },
  ]
  const visibleRows = computed(() =>
    rows.filter(
      row =>
        !applied.value.warehouse || row.warehouse === applied.value.warehouse
    )
  )
  const table = useMachTable<ExampleRow>()
  useDictionaryRefresh([warehouse, delivery, urgent], () =>
    table.api.value?.view.refreshCells()
  )
  const columns = defineVueColumns<ExampleRow>([
    indexColumn({ headerName: '序号', width: 48 }),
    {
      field: 'warehouse',
      headerName: '交付仓库',
      ...createDictionaryColumn(warehouse, { options: warehouse.getOptions }),
    },
    {
      field: 'delivery',
      headerName: '运输方式',
      ...createDictionaryColumn(delivery, { options: delivery.getOptions }),
    },
    {
      field: 'urgent',
      headerName: '加急要求',
      ...createDictionaryColumn(urgent, { options: urgent.getOptions }),
    },
  ])
  const reload = () => {
    void state.reload().catch(() => undefined)
  }
  const simulate = (result: 'error' | 'empty') => {
    if (state.loading.value) return
    nextResult = result
    reload()
  }
  const switchOrganization = () => {
    organization.value =
      organization.value === '南京工厂' ? '上海工厂' : '南京工厂'
    dictionaries.setScope(organization.value)
  }
  return {
    state,
    form,
    query,
    visibleRows,
    table,
    columns,
    requests,
    organization,
    searchConfig: {
      density: 'compact' as const,
      columns: 1,
      labelWidth: 88,
      onSearch: (values: ExampleQuery) => {
        applied.value = { ...values }
      },
    },
    labels,
    modelText: computed(() => JSON.stringify(form.value)),
    reload,
    simulate,
    switchOrganization,
  }
}
