/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\09-form-search\\useOrderSearchDemo.ts
 * @Description: 订单场景的查询草稿、已提交条件与页签结果
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  createFilterGroup,
  validateFilter,
} from '@robot-admin/naive-ui-components/C_FilterBuilder'
import type { TabsValue } from '@robot-admin/naive-ui-components/C_Tabs'
import { useTabbedQuery } from '@robot-admin/naive-ui-components/workflows'
import {
  ORDER_TABS,
  ORDER_FILTER_FIELDS,
  requestDemoOrders,
  type OrderSearch,
  type OrderQuery,
} from './tabbedQuery'

/** 限于本演示的数字和单选条件，保留可独立编辑的组合条件树。 */
const snapshotFilter = (group: OrderQuery['filter']): OrderQuery['filter'] => ({
  ...group,
  children: group.children.map(node =>
    node.type === 'group' ? snapshotFilter(node) : { ...node }
  ),
})

/** 查询提交时保存快照，客户字段、组合条件和页签翻页各自有明确入口。 */
export function useOrderSearchDemo() {
  const message = useMessage()
  const { record } = useComponentDemoProgress()
  const draft = ref<OrderSearch>({ customerId: null })
  const tab = ref<TabsValue>(ORDER_TABS[0].key)
  const filterDraft = ref<OrderQuery['filter']>(createFilterGroup())
  let appliedFilter: OrderQuery['filter'] = createFilterGroup()
  const initialQuery: OrderQuery = { customerId: null, filter: appliedFilter }
  const query = useTabbedQuery({
    activeTab: tab,
    pageSize: 4,
    initialQuery,
    request: requestDemoOrders,
  })
  const tableConfig = computed(() => ({
    toolbar: { show: false },
    pagination: {
      remote: true,
      ...query.pagination.value,
      showSizePicker: false,
    },
  }))
  const search = async (params: OrderSearch) => {
    const applied = await query.setQuery({
      customerId: params.customerId,
      filter: appliedFilter,
    })
    if (applied) record('query')
    return applied
  }
  const applyFilter = () => {
    if (
      validateFilter(filterDraft.value, ORDER_FILTER_FIELDS, { maxDepth: 2 })
        .length
    ) {
      message.warning('请补全条件，或移除空的条件组。')
      return
    }
    appliedFilter = snapshotFilter(filterDraft.value)
    void search(draft.value)
  }

  return proxyRefs({
    draft,
    tab,
    filterDraft,
    rows: query.data,
    loading: query.loading,
    error: query.error,
    pagination: query.pagination,
    setPage: query.setPage,
    tableConfig,
    search,
    applyFilter,
  })
}
