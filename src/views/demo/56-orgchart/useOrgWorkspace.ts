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
  OrgChartExpose,
} from '@robot-admin/naive-ui-components/C_OrgChart'
import {
  createUserPickerSource,
  type UserPickerFields,
  type UserPickerOrganization,
} from '@robot-admin/naive-ui-components/C_UserPicker'
import type { DataPickerRequest } from '@robot-admin/naive-ui-components/C_DataPicker'
import { orgData } from './data'
interface OrgEntry {
  node: OrgChartNode
  path: OrgChartNode[]
  department: string
}
interface OrganizationOption {
  key: string
  label: string
  children?: OrganizationOption[]
}
interface OrganizationMember {
  id: string
  name: string
  department: string
  job: string
  code: string
  organizationIds: string[]
}
interface MemberFilters {
  organizationId?: string | number
}

/** 只把数据中明确的部门放入导航，不把人员汇报关系伪装成部门。 */
function organizationBranch(node: OrgChartNode): OrganizationOption[] {
  const children = node.children?.flatMap(organizationBranch) ?? []
  return node.data?.dept
    ? [{ key: String(node.id), label: String(node.data.dept), children }]
    : children
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
  const members: OrganizationMember[] = entries.map(
    ({ node, path, department }) => ({
      id: String(node.id),
      name: node.label,
      department,
      job: node.subtitle ?? '未填写职位',
      code: `R-${String(node.id).padStart(3, '0')}`,
      organizationIds: path
        .filter(parent => parent.data?.dept)
        .map(parent => String(parent.id)),
    })
  )
  const memberSource = createUserPickerSource({
    rowKey: 'id',
    label: (member: OrganizationMember) => member.name,
    /** 本地数据遵守正式分页协议；组织条件覆盖整个子部门范围。 */
    request: async ({
      search,
      page,
      pageSize,
      signal,
      filters,
    }: DataPickerRequest<MemberFilters>) => {
      signal.throwIfAborted()
      const keyword = search.trim().toLowerCase()
      const rows = members.filter(
        member =>
          (filters?.organizationId === undefined ||
            member.organizationIds.includes(String(filters.organizationId))) &&
          `${member.name} ${member.department} ${member.job} ${member.code}`
            .toLowerCase()
            .includes(keyword)
      )
      return {
        rows: rows.slice((page - 1) * pageSize, page * pageSize),
        total: rows.length,
      }
    },
    /** 确认、重新打开和跨部门选择均从同一目录回显，避免丢失已选人员。 */
    resolve: async (values, signal) => {
      signal.throwIfAborted()
      return members.filter(member => values.includes(member.id))
    },
  })
  const memberOrganization: UserPickerOrganization<
    OrganizationOption,
    MemberFilters
  > = {
    data: organizationBranch(orgData),
    keyField: 'key',
    labelField: 'label',
    field: 'organizationId',
    title: '组织范围',
    defaultExpandAll: true,
    showToolbar: false,
    treeProps: {
      renderPrefix: () =>
        h('span', {
          class: 'i-mdi-office-building-outline',
          'aria-hidden': 'true',
        }),
    },
  }
  const memberFields: UserPickerFields<OrganizationMember> = {
    department: 'department',
    job: 'job',
    code: 'code',
  }
  const collaboratorIds = ref<string[]>([])
  const collaborators = computed(() =>
    members.filter(member => collaboratorIds.value.includes(member.id))
  )
  const selectionFeedback = ref('尚未选择协作成员')
  const confirmCollaborators = (rows: OrganizationMember[]) => {
    selectionFeedback.value = rows.length
      ? `已确认 ${rows.length} 名协作成员`
      : '已清空协作成员'
  }
  const cancelCollaborators = () => {
    selectionFeedback.value = '已取消本次选择，协作成员保持不变'
  }
  const search = ref('')
  const focusId = ref(orgData.id)
  const selectedId = ref(orgData.id)
  const direction = ref<OrgChartDirection>('vertical')
  const lineStyle = ref<OrgChartLineStyle>('rounded')
  const chartRef = ref<OrgChartExpose | null>(null)
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
    memberSource,
    memberOrganization,
    memberFields,
    collaboratorIds,
    collaborators,
    selectionFeedback,
    confirmCollaborators,
    cancelCollaborators,
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
