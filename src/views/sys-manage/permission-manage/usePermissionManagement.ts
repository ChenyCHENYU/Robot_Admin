/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\permission-manage\usePermissionManagement.ts
 * @Description: 页面状态、表单及请求控制，模板只负责展示和事件绑定
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  compareRolePermissions,
  getRolePermissionName,
} from '@/utils/d_permissionComparison'

import type { DataScopeType } from '@/api/permission-policy.contract'
import {
  DATA_SCOPE_CONFIG,
  DATA_SCOPE_OPTIONS,
} from '../shared/d_permissionPolicy'

import { parsePermissionImport } from './d_permissionImport'
import { createGovernanceColumns } from './d_columns'
import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
import {
  PRESET_RULES,
  type FormInstance,
  type FormOption,
  type FormConfig,
  type FormRenderer,
  type SubmitEventPayload,
} from '@robot-admin/naive-ui-components/C_Form'
import type { DetailConfig } from '@/components/local/c_detail/data'
import {
  type PermissionData,
  type PermissionFormData,
  type SearchForm,
  type PermissionType,
  type DataPermissionRule,
  type TempAuthorization,
  type PermissionConstraint,
  type AuditLogItem,
  PERMISSION_FORM_RULES,
  DEFAULT_PERMISSION_FORM_DATA,
  UI_CONFIG,
  PERMISSION_TYPE_CONFIG,
  SYSTEM_MODULES,
  AUDIT_ACTION_CONFIG,
  AUDIT_TARGET_CONFIG,
  MOCK_PERMISSION_RESOURCES,
  getTableColumns,
} from './data'
import {
  createPermissionApi,
  updatePermissionApi,
  deletePermissionApi,
  getPermissionByIdApi,
} from '@/api/permission-manage'
import {
  createTempAuthorizationApi,
  getDataPermissionRulesApi,
  getPermissionAuditLogsApi,
  getPermissionConstraintsApi,
  getTempAuthorizationsApi,
  revokeTempAuthorizationApi,
  updateDataPermissionRuleApi,
} from '@/api/permission-governance'
import { useNaiveTableCrud } from '@robot-admin/request-core/naive'
import { isMockDataMode } from '@/config/dataMode'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { delayWithSignal } from '@/utils/abort'
import { toCrudTableColumns } from '@/utils/d_tableColumns'
import { getRoleListApi } from '@/api/role-manage'
import type { RoleData } from '@/api/role-manage.contract'
import type { PermissionDraft } from '@/api/permission-manage.contract'
import { ref, computed, reactive, onMounted, onScopeDispose, h } from 'vue'
import {
  useMessage,
  useDialog,
  NButton,
  NInput,
  NSwitch,
  NRadioGroup,
  NRadio,
  NSpace,
  NText,
} from 'naive-ui/es'

/** 创建权限管理页面的独立状态与业务行为。 */
export function usePermissionManagement() {
  const message = useMessage()
  const dialog = useDialog()

  // ============ 通用状态 ============
  const activeTab = ref('resources')
  const exportLoading = ref(false)
  const showModal = ref(false)
  const showPermissionDetail = ref(false)
  const detailLoading = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance<PermissionFormData> | null>(null)
  const tempAuthFormRef = ref<FormInstance<typeof tempAuthForm> | null>(null)
  const tableRef = ref()
  const currentPermission = ref<PermissionData | null>(null)

  const formData = reactive<PermissionFormData>({
    ...DEFAULT_PERMISSION_FORM_DATA,
  })

  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    type: null,
    module: null,
  })

  const mockMode = isMockDataMode()

  // ============ 表格数据管理 ============
  const mockPermissionRecords = ref<PermissionData[]>(
    MOCK_PERMISSION_RESOURCES.map(permission => ({
      ...permission,
      resources: [...permission.resources],
    }))
  )
  const table = useNaiveTableCrud<PermissionData>({
    source: mockMode
      ? {
          query: async ({ signal }) => {
            await delayWithSignal(250, signal)
            const items = mockPermissionRecords.value.map(permission => ({
              ...permission,
              resources: [...permission.resources],
            }))
            return { items, total: items.length }
          },
        }
      : { list: '/sys/permissions' },
    columns: toCrudTableColumns(getTableColumns()),
    autoLoad: 'mounted',
  })
  const { data: tableData, loading, refresh } = table

  // ============ 数据权限状态 ============
  const dataPermissionList = ref<DataPermissionRule[]>([])
  const selectedDataPermission = ref<DataPermissionRule | null>(null)

  // ============ 临时授权状态 ============
  const showTempAuthModal = ref(false)
  const tempAuthList = ref<TempAuthorization[]>([])
  const tempAuthForm = reactive({
    targetRole: null as string | null,
    permissions: [] as string[],
    reason: '',
    dateRange: null as [number, number] | null,
    remark: '',
  })

  // ============ 权限约束状态 ============
  const constraintList = ref<PermissionConstraint[]>([])

  // ============ 审计日志状态 ============
  const auditLogs = ref<AuditLogItem[]>([])
  const roleList = ref<RoleData[]>([])
  const auditFilter = reactive({
    action: null as string | null,
    targetType: null as string | null,
  })

  // ============ 权限对比状态 ============
  const compareRoleA = ref<string | null>(null)
  const compareRoleB = ref<string | null>(null)
  const comparisonResult = ref<{
    roleAName: string
    roleBName: string
    shared: string[]
    onlyA: string[]
    onlyB: string[]
  } | null>(null)

  // ============ 计算属性 ============
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增权限' : '编辑权限'
  )

  const hasActiveFilters = computed(() =>
    Boolean(
      searchForm.keyword ||
      searchForm.type ||
      searchForm.module ||
      searchForm.status !== null
    )
  )

  const filteredData = computed<PermissionData[]>(() => {
    let filtered = [...tableData.value]
    if (searchForm.keyword) {
      const k = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(
        p =>
          (p.name || '').toLowerCase().includes(k) ||
          (p.code || '').toLowerCase().includes(k) ||
          (p.description || '').toLowerCase().includes(k)
      )
    }
    if (searchForm.type)
      filtered = filtered.filter(p => p.type === searchForm.type)
    if (searchForm.module)
      filtered = filtered.filter(p => p.module === searchForm.module)
    if (searchForm.status !== null)
      filtered = filtered.filter(p => p.status === searchForm.status)
    return filtered
  })

  const searchResultText = computed(() =>
    hasActiveFilters.value
      ? `筛选出 ${filteredData.value.length} 个权限`
      : `共 ${tableData.value.length} 个权限`
  )

  const tableColumns = getTableColumns()
  const getDataPermissionRowKey = (row: DataPermissionRule) => row.id
  const getTempAuthorizationRowKey = (row: TempAuthorization) => row.id

  const permissionStats = computed(() => {
    const stats: Record<string, number> = {
      module: 0,
      function: 0,
      button: 0,
      api: 0,
    }
    tableData.value.forEach(p => {
      if (p.status === 1) stats[p.type]++
    })
    return [
      {
        type: 'module',
        label: '模块权限',
        value: stats.module,
        icon: PERMISSION_TYPE_CONFIG.module.icon,
        color: PERMISSION_TYPE_CONFIG.module.color,
      },
      {
        type: 'function',
        label: '功能权限',
        value: stats.function,
        icon: PERMISSION_TYPE_CONFIG.function.icon,
        color: PERMISSION_TYPE_CONFIG.function.color,
      },
      {
        type: 'button',
        label: '按钮权限',
        value: stats.button,
        icon: PERMISSION_TYPE_CONFIG.button.icon,
        color: PERMISSION_TYPE_CONFIG.button.color,
      },
      {
        type: 'api',
        label: 'API权限',
        value: stats.api,
        icon: PERMISSION_TYPE_CONFIG.api.icon,
        color: PERMISSION_TYPE_CONFIG.api.color,
      },
    ]
  })

  const activeTempAuthCount = computed(
    () => tempAuthList.value.filter(t => t.status === 'active').length
  )

  const mutualExclusionConstraints = computed(() =>
    constraintList.value.filter(c => c.type === 'mutual_exclusion')
  )

  const inheritanceConstraints = computed(() =>
    constraintList.value.filter(c => c.type === 'inheritance')
  )

  const filteredAuditLogs = computed(() => {
    let logs = [...auditLogs.value]
    if (auditFilter.action)
      logs = logs.filter(l => l.action === auditFilter.action)
    if (auditFilter.targetType)
      logs = logs.filter(l => l.targetType === auditFilter.targetType)
    return logs
  })

  const compareRoleOptions = computed(() =>
    roleList.value.map(r => ({ label: r.name, value: r.id }))
  )

  const allPermissionOptions = computed(() =>
    tableData.value.map(permission => ({
      label: permission.name,
      value: String(permission.id),
    }))
  )

  const auditActionOptions = Object.entries(AUDIT_ACTION_CONFIG).map(
    ([value, config]) => ({ label: config.text, value })
  )

  const auditTargetOptions = Object.entries(AUDIT_TARGET_CONFIG).map(
    ([value, config]) => ({ label: config.text, value })
  )

  // ============ 数据权限表格列配置 ============
  // ============ 详情配置 ============
  const detailConfig: DetailConfig = {
    sections: [
      {
        title: '基本信息',
        columns: 2,
        items: [
          { label: '权限名称', key: 'name', type: 'text' },
          { label: '权限编码', key: 'code', type: 'tag', tagType: 'info' },
          {
            label: '权限类型',
            key: 'type',
            type: 'tag',
            tagType: 'success',
            formatter: (val: unknown) => {
              if (typeof val !== 'string') return String(val ?? '暂无')
              return PERMISSION_TYPE_CONFIG[val as PermissionType]?.text || val
            },
          },
          {
            label: '所属模块',
            key: 'module',
            type: 'text',
            formatter: (val: unknown) => {
              if (typeof val !== 'string') return String(val ?? '暂无')
              return SYSTEM_MODULES.find(m => m.value === val)?.label || val
            },
          },
          {
            label: '状态',
            key: 'status',
            type: 'tag',
            tagType: 'success',
            formatter: (val: unknown) => {
              if (val === 1) return '启用'
              if (val === 0) return '禁用'
              return String(val ?? '暂无')
            },
          },
          { label: '创建时间', key: 'createTime', type: 'text' },
        ],
      },
      {
        title: '扩展信息',
        columns: 1,
        items: [
          {
            label: '关联资源',
            key: 'resources',
            type: 'text',
            span: 2,
            formatter: (val: unknown) =>
              Array.isArray(val) ? val.map(String).join(', ') : '无',
          },
          { label: '描述', key: 'description', type: 'text', span: 2 },
          { label: '备注', key: 'remark', type: 'text', span: 2 },
        ],
      },
    ],
  }

  const savePermissionRecord = async (
    id: number,
    data: Partial<PermissionDraft>
  ): Promise<void> => {
    if (!mockMode) {
      await updatePermissionApi(id, data)
      return
    }

    const index = mockPermissionRecords.value.findIndex(
      permission => permission.id === id
    )
    if (index < 0) throw new Error('权限不存在')
    mockPermissionRecords.value[index] = {
      ...mockPermissionRecords.value[index],
      ...data,
      id,
      updateTime: Date.now(),
    }
  }

  const removePermissionRecord = async (id: number): Promise<void> => {
    if (!mockMode) {
      await deletePermissionApi(id)
      return
    }
    mockPermissionRecords.value = mockPermissionRecords.value.filter(
      permission => permission.id !== id
    )
  }

  const createPermissionRecord = async (
    data: PermissionDraft
  ): Promise<void> => {
    if (!mockMode) {
      await createPermissionApi(data)
      return
    }

    const now = Date.now()
    const nextId =
      Math.max(
        0,
        ...mockPermissionRecords.value.map(permission => permission.id)
      ) + 1
    mockPermissionRecords.value = [
      {
        ...data,
        id: nextId,
        createTime: now,
        updateTime: now,
      },
      ...mockPermissionRecords.value,
    ]
  }

  const loadPermissionDetail = async (
    row: PermissionData
  ): Promise<PermissionData> => {
    if (mockMode) {
      const permission = tableData.value.find(item => item.id === row.id)
      if (!permission) throw new Error('权限不存在')
      return { ...permission, resources: [...permission.resources] }
    }
    const response = await getPermissionByIdApi(row.id)
    return response.data
  }

  // ============ 表格操作配置 ============
  const tableActions = computed(() => ({
    edit: (row: PermissionData) => savePermissionRecord(row.id, row),
    delete: (row: PermissionData) => removePermissionRecord(row.id),
    detail: (row: PermissionData) => loadPermissionDetail(row),
    custom: [
      {
        key: 'copy',
        label: '复制',
        icon: 'material-symbols:content-copy',
        type: 'info' as const,
        onClick: (row: PermissionData) => copyPermission(row),
      },
      {
        key: 'toggle',
        label: (row: PermissionData) => (row.status === 1 ? '禁用' : '启用'),
        icon: (row: PermissionData) =>
          row?.status === 1
            ? 'material-symbols:pause'
            : 'material-symbols:play-arrow',
        type: (row: PermissionData): 'warning' | 'success' =>
          row?.status === 1 ? 'warning' : 'success',
        onClick: (row: PermissionData) => togglePermissionStatus(row),
      },
    ],
  }))

  // ============ 权限资源库事件处理 ============
  const getModuleName = (v: string) =>
    SYSTEM_MODULES.find(m => m.value === v)?.label || v

  const getTypeLabel = (v: string) =>
    UI_CONFIG.permissionType.find(t => t.value === v)?.label || v

  const handleStatCardClick = (type: string) => {
    searchForm.type = searchForm.type === type ? null : (type as PermissionType)
  }

  const clearFilter = (key: keyof SearchForm) => {
    if (key === 'keyword') searchForm.keyword = ''
    else if (key === 'status') searchForm.status = null
    else if (key === 'type') searchForm.type = null
    else searchForm.module = null
  }

  const clearAllFilters = () => {
    Object.assign(searchForm, {
      keyword: '',
      status: null,
      type: null,
      module: null,
    })
  }

  /**
   * * @description: 导出权限数据为 JSON 文件
   */
  const handleExport = async () => {
    exportLoading.value = true
    try {
      const exportData = filteredData.value.map(p => ({
        name: p.name,
        code: p.code,
        type: p.type,
        module: p.module,
        description: p.description,
        status: p.status === 1 ? '启用' : '禁用',
      }))
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `permissions_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      message.success(`成功导出 ${exportData.length} 条权限数据`)
    } finally {
      exportLoading.value = false
    }
  }

  const { run: readLatestImport } = useLatestRequest()
  let importDialog: ReturnType<typeof dialog.warning> | undefined
  onScopeDispose(() => importDialog?.destroy())

  const importInputRef = ref<HTMLInputElement | null>(null)
  /** 原生输入留在 Vue 组件树内，确保浏览器可稳定触发文件选择。 */
  const handleImport = () => {
    if (!mockMode) return
    importInputRef.value?.click()
  }
  /** 完整校验后展示批次确认；演示模式一次性写入，远端需批量导入契约。 */
  const handleImportFile = async () => {
    const input = importInputRef.value
    const file = input?.files?.[0]
    if (input) input.value = ''
    if (!mockMode) return
    if (!file) return
    try {
      if (file.size > 1024 * 1024) throw new Error('导入文件不能超过 1 MB')
      const drafts = await readLatestImport(async () =>
        parsePermissionImport(
          JSON.parse(await file.text()),
          mockPermissionRecords.value.map(row => row.code)
        )
      )
      if (!drafts) return
      importDialog?.destroy()
      importDialog = dialog.warning({
        title: '确认导入权限',
        content: `已校验 ${drafts.length} 条权限：${drafts
          .slice(0, 3)
          .map(row => row.name)
          .join(
            '、'
          )}${drafts.length > 3 ? '等' : ''}。确认后添加到当前演示列表。`,
        positiveText: '确认导入',
        negativeText: '取消',
        onPositiveClick: async () => {
          try {
            // 确认前再检查一次，避免弹窗期间的新建操作造成编码重复。
            const checked = parsePermissionImport(
              drafts,
              mockPermissionRecords.value.map(row => row.code)
            )
            const now = Date.now()
            let id = Math.max(
              0,
              ...mockPermissionRecords.value.map(row => row.id)
            )
            mockPermissionRecords.value = [
              ...checked.map(row => ({
                ...row,
                id: ++id,
                createTime: now,
                updateTime: now,
              })),
              ...mockPermissionRecords.value,
            ]
            await refresh()
            message.success(`已导入 ${checked.length} 条权限`)
          } catch (error) {
            message.error(error instanceof Error ? error.message : '导入失败')
            return false
          }
        },
      })
    } catch (error) {
      message.error(
        error instanceof SyntaxError
          ? '文件解析失败，请检查 JSON 格式'
          : error instanceof Error
            ? error.message
            : '导入失败'
      )
    }
  }

  const copyPermission = (permission: PermissionData) => {
    const next = { ...permission }
    next.name = `${permission.name} - 副本`
    next.code = `${permission.code}_copy`
    openPermissionModal(next, 'add')
  }

  const togglePermissionStatus = async (permission: PermissionData) => {
    try {
      const newStatus = permission.status === 1 ? 0 : 1
      const action = newStatus === 1 ? '启用' : '禁用'
      await savePermissionRecord(permission.id, { status: newStatus })
      message.success(`${action}成功`)
      await refresh()
    } catch {
      message.error('操作失败')
    }
  }

  const handleSave = async (rowData: PermissionData) => {
    try {
      await savePermissionRecord(rowData.id, rowData)
      message.success('修改成功')
      await refresh()
    } catch {
      message.error('保存失败')
    }
  }

  const handleRowDelete = async () => {
    await refresh()
  }

  const handleViewDetail = async (row: PermissionData) => {
    try {
      detailLoading.value = true
      currentPermission.value = await loadPermissionDetail(row)
      showPermissionDetail.value = true
    } catch {
      message.error('获取详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  const handleDetailClose = () => {
    currentPermission.value = null
    showPermissionDetail.value = false
  }

  const openPermissionModal = (
    permission?: PermissionData,
    mode: 'add' | 'edit' = permission ? 'edit' : 'add'
  ) => {
    modalMode.value = mode
    delete formData.id
    if (permission) {
      Object.assign(formData, {
        id: mode === 'edit' ? permission.id : undefined,
        name: permission.name,
        code: permission.code,
        type: permission.type,
        module: permission.module,
        description: permission.description || '',
        resources: Array.isArray(permission.resources)
          ? permission.resources.join(', ')
          : '',
        sort: permission.sort,
        status: permission.status,
        remark: permission.remark || '',
      })
    } else {
      Object.assign(formData, DEFAULT_PERMISSION_FORM_DATA)
    }
    showModal.value = true
  }

  const closePermissionModal = () => {
    showModal.value = false
    delete formData.id
    Object.assign(formData, DEFAULT_PERMISSION_FORM_DATA)
  }

  const handleTypeChange = (type: string) => {
    if (formData.module && type) generateCode()
  }

  const generateCode = () => {
    if (!formData.module || !formData.type) return
    const codeMap: Record<string, string> = {
      module: formData.module,
      function: `${formData.module}:manage`,
      button: `${formData.module}:add`,
      api: `${formData.module}:create`,
    }
    formData.code = codeMap[formData.type] || ''
  }

  /** 提交权限与资源列表，成功后刷新列表。 */
  async function handleSavePermission({
    model,
  }: SubmitEventPayload<PermissionFormData>): Promise<void> {
    const submitData: PermissionDraft = {
      ...model,
      resources: model.resources
        ? model.resources
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    }

    try {
      if (modalMode.value === 'add') {
        await createPermissionRecord(submitData)
        message.success('权限创建成功')
      } else if (model.id != null) {
        await savePermissionRecord(model.id, submitData)
        message.success('修改成功')
      }
      await refresh()
    } catch {
      throw new Error(modalMode.value === 'add' ? '创建失败' : '修改失败')
    }
  }

  // ============ 数据权限事件处理 ============
  const handleAddDataPermission = () => {
    message.info('当前页面支持配置已有规则，新增规则请通过策略中心完成')
  }

  const handleEditDataPermission = (row: DataPermissionRule) => {
    selectedDataPermission.value = {
      ...row,
      fieldPermissions: row.fieldPermissions.map(f => ({ ...f })),
    }
  }

  const handleEditScope = (row: DataPermissionRule) => {
    const pendingScope = ref<DataScopeType>(row.scope)
    dialog.create({
      title: `修改数据范围 — ${row.moduleName}`,
      content: () =>
        h(
          NRadioGroup,
          {
            value: pendingScope.value,
            'onUpdate:value': (scope: DataScopeType) => {
              pendingScope.value = scope
            },
          },
          () =>
            h(NSpace, { vertical: true }, () =>
              DATA_SCOPE_OPTIONS.map(opt =>
                h(NRadio, { value: opt.value }, () =>
                  h(NSpace, { vertical: true, size: 4 }, () => [
                    h(NText, { strong: true }, () => opt.label),
                    h(NText, { depth: 3 }, () => opt.description),
                  ])
                )
              )
            )
        ),
      positiveText: '确认',
      onPositiveClick: async () => {
        try {
          const updatedRule = { ...row, scope: pendingScope.value }
          await updateDataPermissionRuleApi(row.id, updatedRule)
          Object.assign(row, updatedRule)
          message.success(
            `数据范围已更新为「${DATA_SCOPE_CONFIG[row.scope].text}」`
          )
        } catch {
          message.error('数据范围更新失败')
          return false
        }
      },
    })
  }

  const handleSaveFieldPermissions = async () => {
    if (!selectedDataPermission.value) return
    const updatedRule = { ...selectedDataPermission.value }
    try {
      await updateDataPermissionRuleApi(updatedRule.id, updatedRule)
      const idx = dataPermissionList.value.findIndex(
        d => d.id === updatedRule.id
      )
      if (idx !== -1) dataPermissionList.value[idx] = updatedRule
      message.success('字段权限配置已保存')
      selectedDataPermission.value = null
    } catch {
      message.error('字段权限配置保存失败')
    }
  }

  // ============ 临时授权事件处理 ============
  /** 创建临时授权，保留授权期限和权限集合。 */
  async function handleSaveTempAuth(): Promise<void> {
    if (!tempAuthForm.targetRole || tempAuthForm.permissions.length === 0) {
      throw new Error('请选择目标角色和授权权限')
    }
    if (!tempAuthForm.dateRange) {
      throw new Error('请选择有效期')
    }
    const role = roleList.value.find(r => r.id === tempAuthForm.targetRole)
    const permNames = tempAuthForm.permissions.map(
      id => allPermissionOptions.value.find(o => o.value === id)?.label || id
    )

    const newAuth: TempAuthorization = {
      id: `ta_${Date.now()}`,
      targetRole: tempAuthForm.targetRole,
      targetRoleName: role?.name || '',
      permissions: [...tempAuthForm.permissions],
      permissionNames: permNames,
      reason: tempAuthForm.reason,
      grantedBy: 'user_1',
      grantedByName: '当前用户',
      startTime: new Date(tempAuthForm.dateRange[0]).toLocaleString(),
      expireTime: new Date(tempAuthForm.dateRange[1]).toLocaleString(),
      status: 'active',
      remark: tempAuthForm.remark,
    }
    try {
      const response = await createTempAuthorizationApi(newAuth)
      tempAuthList.value.unshift(response.data)
      message.success('临时授权创建成功')
    } catch {
      throw new Error('临时授权创建失败')
    }

    // 重置表单
    tempAuthForm.targetRole = null
    tempAuthForm.permissions = []
    tempAuthForm.reason = ''
    tempAuthForm.dateRange = null
    tempAuthForm.remark = ''
  }

  const handleRevokeTempAuth = (auth: TempAuthorization) => {
    dialog.warning({
      title: '撤销临时授权',
      content: `确定撤销对角色「${auth.targetRoleName}」的临时授权吗？`,
      positiveText: '确认撤销',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await revokeTempAuthorizationApi(auth.id)
          const idx = tempAuthList.value.findIndex(t => t.id === auth.id)
          if (idx !== -1) {
            tempAuthList.value[idx] = {
              ...tempAuthList.value[idx],
              status: 'revoked',
            }
          }
          message.success('临时授权已撤销')
        } catch {
          message.error('临时授权撤销失败')
          return false
        }
      },
    })
  }

  // ============ 权限对比事件处理 ============
  const handleCompare = () => {
    if (!compareRoleA.value || !compareRoleB.value) return
    const roleA = roleList.value.find(r => r.id === compareRoleA.value)
    const roleB = roleList.value.find(r => r.id === compareRoleB.value)
    if (!roleA || !roleB) return

    const result = compareRolePermissions(roleA, roleB)
    comparisonResult.value = {
      roleAName: roleA.name,
      roleBName: roleB.name,
      shared: result.shared.map(id => getRolePermissionName(roleA, id)),
      onlyA: result.onlyA.map(id => getRolePermissionName(roleA, id)),
      onlyB: result.onlyB.map(id => getRolePermissionName(roleB, id)),
    }
  }

  const { loading: governanceLoading, run: runLatestGovernanceRequest } =
    useLatestRequest()

  const loadGovernanceData = async () => {
    try {
      const result = await runLatestGovernanceRequest(signal =>
        Promise.all([
          getDataPermissionRulesApi(signal),
          getTempAuthorizationsApi(signal),
          getPermissionConstraintsApi(signal),
          getPermissionAuditLogsApi(signal),
          getRoleListApi({ page: 1, pageSize: 1000 }, signal),
        ])
      )
      if (!result) return
      const [rules, tempAuths, constraints, logs, roles] = result
      dataPermissionList.value = rules.data
      tempAuthList.value = tempAuths.data
      constraintList.value = constraints.data
      auditLogs.value = logs.data
      roleList.value = roles.data.list
    } catch {
      message.error('权限治理扩展数据加载失败，请稍后重试')
    }
  }

  /** 刷新当前标签页，资源变更仍只重载资源表格。 */
  const handleRefresh = async (): Promise<void> => {
    if (activeTab.value === 'resources') await refresh()
    else await loadGovernanceData()
  }

  onMounted(loadGovernanceData)
  const formOptions = computed<FormOption<PermissionFormData>[]>(() => [
    {
      prop: 'name',
      label: '权限名称',
      type: 'input',
      placeholder: '请输入权限名称',
      rules: PERMISSION_FORM_RULES.name,
    },
    {
      prop: 'type',
      label: '权限类型',
      type: 'select',
      children: UI_CONFIG.permissionType,
      rules: PERMISSION_FORM_RULES.type,
    },
    {
      prop: 'module',
      label: '所属模块',
      type: 'select',
      children: SYSTEM_MODULES,
      rules: PERMISSION_FORM_RULES.module,
    },
    {
      prop: 'sort',
      label: '排序',
      type: 'inputNumber',
      attrs: { min: 0, max: 9999, style: { width: '100%' } },
      rules: PERMISSION_FORM_RULES.sort,
    },
    {
      prop: 'code',
      label: '权限编码',
      type: 'permissionCode',
      placeholder: '自动生成或手动输入',
      disabled: modalMode.value === 'edit' || !!formRef.value?.isSubmitting,
      rules: PERMISSION_FORM_RULES.code,
      layout: { span: 2 },
    },
    {
      prop: 'resources',
      label: '关联资源',
      type: 'textarea',
      placeholder: '请输入关联资源，多个用逗号分隔',
      attrs: { rows: 2 },
      layout: { span: 2 },
    },
    {
      prop: 'description',
      label: '权限描述',
      type: 'textarea',
      placeholder: '请输入权限描述',
      attrs: { rows: 3 },
      layout: { span: 2 },
    },
    {
      prop: 'status',
      label: '权限状态',
      type: 'permissionStatus',
      attrs: { checkedValue: 1, uncheckedValue: 0 },
      layout: { span: 2 },
    },
    {
      prop: 'remark',
      label: '备注',
      type: 'textarea',
      placeholder: '请输入备注信息',
      attrs: { rows: 2 },
      layout: { span: 2 },
    },
  ])
  const formConfig = computed<FormConfig<PermissionFormData>>(() => ({
    disabled: !!formRef.value?.isSubmitting,
    layout: 'grid',
    grid: { cols: 2, gutter: 16 },
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    preserveRemovedFields: true,
    onSubmit: handleSavePermission,
  }))
  const formRenderers: Record<string, FormRenderer> = {
    permissionCode: props =>
      h(NInput, props, {
        suffix: () =>
          modalMode.value === 'add'
            ? h(
                NButton,
                {
                  text: true,
                  size: 'small',
                  onClick: generateCode,
                  'aria-label': '生成权限编码',
                },
                () => h(C_Icon, { name: 'material-symbols:auto-fix', size: 14 })
              )
            : null,
      }),
    permissionStatus: props =>
      h(NSwitch, props, { checked: () => '启用', unchecked: () => '禁用' }),
  }
  /** 模型同步后再生成编码，避免联动结果被输入事件覆盖。 */
  function updatePermissionForm(model: PermissionFormData) {
    const typeChanged = model.type !== formData.type
    Object.assign(formData, model)
    if (typeChanged) handleTypeChange(model.type)
  }
  const tempAuthOptions = computed<FormOption<typeof tempAuthForm>[]>(() => [
    {
      prop: 'targetRole',
      label: '目标角色',
      type: 'select',
      children: compareRoleOptions.value,
      placeholder: '选择授权目标角色',
      rules: [PRESET_RULES.required('目标角色', 'change')],
    },
    {
      prop: 'permissions',
      label: '授权权限',
      type: 'select',
      children: allPermissionOptions.value,
      attrs: { multiple: true },
      placeholder: '选择临时授予的权限',
      rules: [PRESET_RULES.required('授权权限', 'change')],
    },
    {
      prop: 'reason',
      label: '授权原因',
      type: 'textarea',
      placeholder: '请说明临时授权原因',
      attrs: { rows: 2 },
    },
    {
      prop: 'dateRange',
      label: '有效期',
      type: 'datePicker',
      attrs: { type: 'datetimerange', style: { width: '100%' } },
      rules: [PRESET_RULES.required('有效期', 'change')],
    },
    {
      prop: 'remark',
      label: '备注',
      type: 'input',
      placeholder: '备注信息（可选）',
    },
  ])
  const tempAuthConfig = computed<FormConfig<typeof tempAuthForm>>(() => ({
    disabled: !!tempAuthFormRef.value?.isSubmitting,
    labelPlacement: 'left',
    labelWidth: 100,
    showActions: false,
    onSubmit: handleSaveTempAuth,
  }))

  const { dataPermissionColumns, tempAuthColumns } = createGovernanceColumns({
    handleEditDataPermission: row => handleEditDataPermission(row),
    handleEditScope: row => handleEditScope(row),
    handleRevokeTempAuth: row => handleRevokeTempAuth(row),
  })

  return {
    mockMode,
    dialog,
    activeTab,
    exportLoading,
    showModal,
    showPermissionDetail,
    detailLoading,
    modalMode,
    formRef,
    tempAuthFormRef,
    tableRef,
    currentPermission,
    formData,
    searchForm,
    loading,
    refresh,
    dataPermissionList,
    selectedDataPermission,
    showTempAuthModal,
    tempAuthList,
    tempAuthForm,
    auditFilter,
    compareRoleA,
    compareRoleB,
    comparisonResult,
    modalTitle,
    hasActiveFilters,
    filteredData,
    searchResultText,
    tableColumns,
    getDataPermissionRowKey,
    getTempAuthorizationRowKey,
    permissionStats,
    activeTempAuthCount,
    mutualExclusionConstraints,
    inheritanceConstraints,
    filteredAuditLogs,
    compareRoleOptions,
    auditActionOptions,
    auditTargetOptions,
    detailConfig,
    tableActions,
    getModuleName,
    getTypeLabel,
    handleStatCardClick,
    clearFilter,
    clearAllFilters,
    handleExport,
    handleImport,
    importInputRef,
    handleImportFile,
    handleSave,
    handleRowDelete,
    handleViewDetail,
    handleDetailClose,
    openPermissionModal,
    closePermissionModal,
    handleAddDataPermission,
    handleSaveFieldPermissions,
    handleCompare,
    governanceLoading,
    handleRefresh,
    formOptions,
    formConfig,
    formRenderers,
    updatePermissionForm,
    tempAuthOptions,
    tempAuthConfig,
    dataPermissionColumns,
    tempAuthColumns,
  }
}
