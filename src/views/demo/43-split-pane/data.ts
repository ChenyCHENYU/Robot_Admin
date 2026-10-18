/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-09 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-09 20:51:05
 * @FilePath: \naive-ui-componentsd:\project\robot\Robot_Admin\src\views\demo\43-split-pane\data.ts
 * @Description: 分割面板演示页数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { proxyRefs } from 'vue'
import type { SplitPaneExpose } from '@robot-admin/naive-ui-components/C_SplitPane'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'

/** 演示面板样式 colorClass 枚举 */
export type PanelColorClass =
  | 'demo-panel--primary'
  | 'demo-panel--info'
  | 'demo-panel--success'
  | 'demo-panel--warning'
  | 'demo-panel--disabled'

/** 演示面板配置 */
export interface PanelConfig {
  icon: string
  label: string
  colorClass: PanelColorClass
}

/** 演示区域元数据 */
export interface SectionMeta {
  titleIcon: string
  title: string
  /** 支持 <code> 等行内 HTML，模板中使用 v-html 渲染 */
  descHtml: string
}

/** 各 section 元数据 */
export const SECTIONS: Record<string, SectionMeta> = {
  basic: {
    titleIcon: 'mdi:arrow-split-vertical',
    title: '基础水平分割',
    descHtml: '最简单的左右分割面板，可拖拽分割线调整面板大小',
  },
  vertical: {
    titleIcon: 'mdi:arrow-split-horizontal',
    title: '垂直分割',
    descHtml: '设置 <code>direction="vertical"</code> 可切换为上下分割',
  },
  limits: {
    titleIcon: 'mdi:arrow-expand-horizontal',
    title: '尺寸限制',
    descHtml:
      '通过 <code>min-size</code> 和 <code>max-size</code> 限制面板的最小/最大比例',
  },
  collapse: {
    titleIcon: 'mdi:unfold-more-vertical',
    title: '折叠 / 展开',
    descHtml: '双击分割线或点击折叠按钮可折叠面板。也可以通过编程方式控制折叠',
  },
  nested: {
    titleIcon: 'mdi:view-column-outline',
    title: '嵌套分割',
    descHtml: 'SplitPane 可互相嵌套，实现复杂的编辑器布局',
  },
  keyboard: {
    titleIcon: 'mdi:keyboard',
    title: '键盘控制',
    descHtml:
      '聚焦分割线后，可用 <code>←</code> <code>→</code> 方向键微调面板大小，<code>Home</code> / <code>End</code> 跳到最小/最大值',
  },
  disabled: {
    titleIcon: 'mdi:lock-outline',
    title: '禁用状态',
    descHtml: '设置 <code>disabled</code> 后分割线不可拖拽',
  },
}

/** 各 section 的面板内容配置 */
export const PANELS: Record<string, PanelConfig> = {
  // 基础水平分割
  basicFirst: {
    icon: 'mdi:dock-left',
    label: '左面板',
    colorClass: 'demo-panel--primary',
  },
  basicSecond: {
    icon: 'mdi:dock-right',
    label: '右面板',
    colorClass: 'demo-panel--info',
  },
  // 垂直分割
  vertFirst: {
    icon: 'mdi:dock-top',
    label: '上面板',
    colorClass: 'demo-panel--success',
  },
  vertSecond: {
    icon: 'mdi:dock-bottom',
    label: '下面板',
    colorClass: 'demo-panel--warning',
  },
  // 尺寸限制
  limitsFirst: {
    icon: 'mdi:arrow-collapse-left',
    label: '最小 20%',
    colorClass: 'demo-panel--primary',
  },
  limitsSecond: {
    icon: 'mdi:arrow-collapse-right',
    label: '最大 80%',
    colorClass: 'demo-panel--info',
  },
  // 折叠/展开
  collapseFirst: {
    icon: 'mdi:page-layout-sidebar-left',
    label: '侧边栏',
    colorClass: 'demo-panel--success',
  },
  collapseSecond: {
    icon: 'mdi:page-layout-body',
    label: '主内容区',
    colorClass: 'demo-panel--warning',
  },
  // 嵌套分割
  nestedFileTree: {
    icon: 'mdi:folder-outline',
    label: '文件树',
    colorClass: 'demo-panel--primary',
  },
  nestedEditor: {
    icon: 'mdi:code-braces',
    label: '代码编辑区',
    colorClass: 'demo-panel--info',
  },
  nestedTerminal: {
    icon: 'mdi:console',
    label: '终端 / 输出',
    colorClass: 'demo-panel--warning',
  },
  // 键盘控制
  keyboardFirst: {
    icon: 'mdi:keyboard-outline',
    label: '点击分割线后按方向键',
    colorClass: 'demo-panel--primary',
  },
  keyboardSecond: {
    icon: 'mdi:arrow-left-right',
    label: '步长 5%',
    colorClass: 'demo-panel--info',
  },
  // 禁用状态
  disabledPanel: {
    icon: 'mdi:lock',
    label: '锁定面板',
    colorClass: 'demo-panel--disabled',
  },
}

interface WorkOrder {
  id: number
  orderNo: string
  customer: string
  amount: number
  status: string
}

interface WorkDetail {
  id: string
  material: string
  specification: string
  quantity: number
  progress: string
}

const WORK_ORDERS: WorkOrder[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  orderNo: `SO-202610-${String(index + 1).padStart(3, '0')}`,
  customer: ['华东制造', '远航供应链', '星海科技', '新锐装备'][index % 4],
  amount: (index + 1) * 12,
  status: ['待排产', '生产中', '待质检', '已入库'][index % 4],
}))

export const WORKBENCH_TABLE_CONFIG = {
  density: 'compact',
  edit: 'none',
  pagination: false,
  toolbar: { show: false },
  display: { striped: true },
} as const

export const WORK_ORDER_COLUMNS: TableColumn<WorkOrder>[] = [
  { type: 'index', width: 46, fixed: 'left' },
  { key: 'orderNo', title: '订单编号', width: 165 },
  { key: 'customer', title: '客户', width: 120 },
  { key: 'amount', title: '计划数量', width: 90 },
  { key: 'status', title: '状态', width: 90 },
]

export const WORK_DETAIL_COLUMNS: TableColumn<WorkDetail>[] = [
  { type: 'index', width: 46, fixed: 'left' },
  { key: 'material', title: '物料', width: 130 },
  { key: 'specification', title: '规格', width: 100 },
  { key: 'quantity', title: '数量', width: 70 },
  { key: 'progress', title: '进度', width: 100 },
]

/** 根据当前订单生成固定演示明细，拖动布局不会重新请求或改变业务数据。 */
const createWorkDetails = (
  orderId: number,
  kind: 'material' | 'delivery'
): WorkDetail[] =>
  Array.from({ length: kind === 'material' ? 18 : 12 }, (_, index) => ({
    id: `${orderId}-${kind}-${index}`,
    material:
      kind === 'material'
        ? `精密部件 ${orderId}-${index + 1}`
        : `发运批次 ${orderId}-${index + 1}`,
    specification: ['M20 × 120', 'M24 × 160', 'M30 × 180'][index % 3],
    quantity: (orderId + index + 1) * 3,
    progress:
      kind === 'material'
        ? ['已齐套', '采购中', '待确认'][index % 3]
        : ['已发运', '待装车', '运输中'][index % 3],
  }))

/** 管理工作台的业务上下文与受控布局；尺寸变化仅用于响应式布局。 */
export const useSplitWorkbench = () => {
  const workbenchRef = ref<HTMLElement | null>(null)
  const splitRef = ref<SplitPaneExpose>()
  const outerSize = ref(40)
  const detailSize = ref(52)
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
    outerSize.value = 40
    detailSize.value = 52
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
