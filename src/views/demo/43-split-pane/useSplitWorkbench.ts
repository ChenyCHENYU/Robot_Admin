/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\43-split-pane\useSplitWorkbench.ts
 * @Description: 工单工作台的面板尺寸、选择和明细
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { proxyRefs } from 'vue'
import type { SplitPaneExpose } from '@robot-admin/naive-ui-components/C_SplitPane'
import { createWorkDetails, WORK_ORDERS, type WorkOrder } from './data'

const DEFAULT_OUTER_SIZE = 40
const DEFAULT_DETAIL_SIZE = 52

/** 管理工作台的业务上下文与受控布局；尺寸变化仅用于响应式布局。 */
export const useSplitWorkbench = () => {
  const workbenchRef = ref<HTMLElement | null>(null)
  const splitRef = ref<SplitPaneExpose>()
  const outerSize = ref(DEFAULT_OUTER_SIZE)
  const detailSize = ref(DEFAULT_DETAIL_SIZE)
  const selectedId = ref(1)
  const stacked = ref(false)
  let observer: ResizeObserver | undefined
  const selected = computed(() =>
    WORK_ORDERS.find(order => order.id === selectedId.value)!
  )
  const materialRows = computed(() =>
    createWorkDetails(selectedId.value, 'material')
  )
  const deliveryRows = computed(() =>
    createWorkDetails(selectedId.value, 'delivery')
  )
  const rowProps = (row: WorkOrder) => ({
    class: row.id === selectedId.value ? 'workbench-selected-row' : undefined,
    tabindex: 0,
    'aria-selected': row.id === selectedId.value,
    onKeydown: (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      selectedId.value = row.id
    },
    onClick: () => {
      selectedId.value = row.id
    },
    style: { cursor: 'pointer' },
  })
  const resetLayout = () => {
    outerSize.value = DEFAULT_OUTER_SIZE
    detailSize.value = DEFAULT_DETAIL_SIZE
  }
  onMounted(() => {
    const element = workbenchRef.value
    if (!element) return
    const measure = () => {
      stacked.value = element.clientWidth < 920
    }
    measure()
    observer = new ResizeObserver(measure)
    observer.observe(element)
  })
  onBeforeUnmount(() => observer?.disconnect())
  return {
    workbenchRef,
    workbenchSplitRef: splitRef,
    workbench: proxyRefs({
      outerSize,
      detailSize,
      selected,
      stacked,
      rowProps,
      resetLayout,
      orders: WORK_ORDERS,
      materialRows,
      deliveryRows,
    }),
  }
}
