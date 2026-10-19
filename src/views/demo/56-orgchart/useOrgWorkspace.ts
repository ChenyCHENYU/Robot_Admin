/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 组织搜索、层级导航与节点详情
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  OrgChartNode,
  OrgChartDirection,
  OrgChartLineStyle,
} from '@robot-admin/naive-ui-components/C_OrgChart'
import { orgData } from './data'
interface OrgEntry {
  node: OrgChartNode
  path: OrgChartNode[]
  department: string
}
/** 创建带路径的组织索引，保留完整组织，展示范围与详情选择独立。 */
export function useOrgWorkspace() {
  const entries: OrgEntry[] = []
  const visit = (node: OrgChartNode, path: OrgChartNode[], dept: string) => {
    const department = String(node.data?.dept ?? dept)
    entries.push({ node, path: [...path, node], department })
    node.children?.forEach(child => visit(child, [...path, node], department))
  }
  visit(orgData, [], '总裁办')
  const search = ref('')
  const focusId = ref(orgData.id)
  const selectedId = ref(orgData.id)
  const direction = ref<OrgChartDirection>('vertical')
  const lineStyle = ref<OrgChartLineStyle>('rounded')
  const chartRef = ref<{ fitView: () => Promise<void> } | null>(null)
  const focused = computed(
    () => entries.find(item => item.node.id === focusId.value) ?? entries[0]
  )
  const selected = computed(
    () => entries.find(item => item.node.id === selectedId.value) ?? entries[0]
  )
  const matches = computed(() =>
    entries.filter(item =>
      `${item.node.label} ${item.node.subtitle} ${item.department}`
        .toLowerCase()
        .includes(search.value.trim().toLowerCase())
    )
  )
  const decorate = (node: OrgChartNode, depth = 0): OrgChartNode => ({
    ...node,
    collapsed: depth >= 2,
    children: node.children?.map(child => decorate(child, depth + 1)),
  })
  const tree = computed(() => decorate(focused.value.node))
  const choose = (id: string | number, focus = false) => {
    selectedId.value = id
    if (focus) focusId.value = id
  }
  const reset = () => {
    focusId.value = orgData.id
    selectedId.value = orgData.id
    search.value = ''
    void nextTick(() => chartRef.value?.fitView())
  }
  return {
    entries,
    search,
    focusId,
    selectedId,
    direction,
    lineStyle,
    chartRef,
    focused,
    selected,
    matches,
    tree,
    choose,
    reset,
  }
}
