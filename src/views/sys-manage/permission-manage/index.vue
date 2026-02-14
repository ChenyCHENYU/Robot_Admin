<template>
  <div class="permission-management">
    <!-- 搜索筛选区域 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace class="search-filters">
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索权限名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                name="material-symbols:search"
                :size="16"
              />
            </template>
          </NInput>
          <NSelect
            v-model:value="searchForm.type"
            placeholder="权限类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionType"
            @update:value="handleSearch"
          />
          <NSelect
            v-model:value="searchForm.module"
            placeholder="所属模块"
            clearable
            style="width: 120px"
            :options="SYSTEM_MODULES"
            @update:value="handleSearch"
          />
          <NSelect
            v-model:value="searchForm.status"
            placeholder="权限状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionStatus"
            @update:value="handleSearch"
          />
        </NSpace>
        <C_ActionBar
          :actions="toolbarActions"
          :config="{ compact: true }"
        />
      </NSpace>
    </NCard>

    <!-- 统计卡片区域 -->
    <NGrid
      :cols="4"
      :x-gap="16"
      class="stat-grid"
    >
      <NGi
        v-for="stat in permissionStats"
        :key="stat.type"
      >
        <NCard
          size="small"
          hoverable
          :class="{ 'stat-card-active': searchForm.type === stat.type }"
          class="stat-card-clickable"
          @click="handleStatCardClick(stat.type)"
        >
          <NSpace align="center">
            <div class="stat-icon-wrapper">
              <C_Icon
                :name="stat.icon"
                :size="24"
                :color="stat.color"
              />
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </NSpace>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 筛选标签显示 -->
    <div
      v-if="hasActiveFilters"
      class="filter-tags"
    >
      <NSpace>
        <NText
          depth="3"
          style="margin-right: 8px"
        >
          当前筛选：
        </NText>
        <NTag
          v-if="searchForm.keyword"
          closable
          @close="clearFilter('keyword')"
          type="info"
        >
          关键词: {{ searchForm.keyword }}
        </NTag>
        <NTag
          v-if="searchForm.type"
          closable
          @close="clearFilter('type')"
          type="success"
        >
          类型: {{ getTypeLabel(searchForm.type) }}
        </NTag>
        <NTag
          v-if="searchForm.module"
          closable
          @close="clearFilter('module')"
          type="warning"
        >
          模块: {{ getModuleName(searchForm.module) }}
        </NTag>
        <NTag
          v-if="searchForm.status !== null"
          closable
          @close="clearFilter('status')"
          :type="searchForm.status === 1 ? 'success' : 'error'"
        >
          状态: {{ searchForm.status === 1 ? '启用' : '禁用' }}
        </NTag>
        <C_ActionBar
          :actions="[
            {
              key: 'clear',
              label: '清空筛选',
              type: 'error',
              onClick: clearAllFilters,
            },
          ]"
          :config="{
            compact: true,
            size: 'small',
            buttonProps: { text: true },
          }"
        />
      </NSpace>
    </div>

    <!-- 主表格区域 -->
    <NCard class="content-card">
      <template #header>
        <NText>
          权限资源库
          <NTag
            type="info"
            size="small"
            style="margin-left: 8px"
          >
            {{ searchResultText }}
          </NTag>
        </NText>
      </template>

      <C_Table
        ref="tableRef"
        v-model:data="filteredData"
        :columns="tableColumns as any"
        :loading="loading"
        :actions="tableActions as any"
        edit-mode="modal"
        modal-title="编辑权限"
        :modal-width="800"
        size="small"
        striped
        bordered
        @save="handleSave"
        @row-delete="handleRowDelete"
        @view-detail="handleViewDetail as any"
      />
    </NCard>

    <!-- 权限详情抽屉 -->
    <c_detail
      v-model:visible="showPermissionDetail"
      :data="currentPermission || {}"
      :config="detailConfig"
      title="权限详情"
      :loading="detailLoading"
      @close="handleDetailClose"
    />

    <!-- 新增/编辑权限模态框 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSavePermission"
      @negative-click="closePermissionModal"
      style="width: 700px"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <NGrid
          :cols="2"
          :x-gap="16"
        >
          <NGi>
            <NFormItem
              label="权限名称"
              path="name"
            >
              <NInput
                v-model:value="formData.name"
                placeholder="请输入权限名称"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="权限类型"
              path="type"
            >
              <NSelect
                v-model:value="formData.type"
                :options="UI_CONFIG.permissionType"
                @update:value="handleTypeChange"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="所属模块"
              path="module"
            >
              <NSelect
                v-model:value="formData.module"
                :options="SYSTEM_MODULES"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="排序"
              path="sort"
            >
              <NInputNumber
                v-model:value="formData.sort"
                :min="0"
                :max="9999"
                style="width: 100%"
              />
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem
          label="权限编码"
          path="code"
        >
          <NInput
            v-model:value="formData.code"
            placeholder="自动生成或手动输入"
            :disabled="modalMode === 'edit'"
          >
            <template
              v-if="modalMode === 'add'"
              #suffix
            >
              <NButton
                text
                size="small"
                @click="generateCode"
              >
                <C_Icon
                  name="material-symbols:auto-fix"
                  :size="14"
                />
              </NButton>
            </template>
          </NInput>
        </NFormItem>

        <NFormItem
          label="关联资源"
          path="resources"
        >
          <NInput
            v-model:value="formData.resources"
            type="textarea"
            :rows="2"
            placeholder="请输入关联资源，多个用逗号分隔"
          />
        </NFormItem>

        <NFormItem
          label="权限描述"
          path="description"
        >
          <NInput
            v-model:value="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </NFormItem>

        <NFormItem
          label="权限状态"
          path="status"
        >
          <NSwitch
            v-model:value="formData.status"
            :checked-value="1"
            :unchecked-value="0"
          >
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>

        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst } from 'naive-ui/es'
  import type { ActionItem } from '@/types/modules/action-bar'
  import type { DetailConfig } from '@/components/local/c_detail/data'
  import {
    type PermissionData,
    type PermissionFormData,
    type SearchForm,
    type PermissionType,
    PERMISSION_FORM_RULES,
    DEFAULT_PERMISSION_FORM_DATA,
    UI_CONFIG,
    PERMISSION_TYPE_CONFIG,
    SYSTEM_MODULES,
    getTableColumns,
  } from './data'
  import {
    updatePermissionApi,
    deletePermissionApi,
    getPermissionByIdApi,
  } from '@/api/permission-manage'
  import { useTableCrud } from '@robot-admin/request-core'

  // 引入样式文件
  import './index.scss'

  const message = useMessage()

  // ============ 响应式状态 ============
  const exportLoading = ref(false)
  const showModal = ref(false)
  const showPermissionDetail = ref(false)
  const detailLoading = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const tableRef = ref()
  const currentPermission = ref<PermissionData | null>(null)

  const formData = reactive<PermissionFormData>({
    ...DEFAULT_PERMISSION_FORM_DATA,
  })
  const formRules = PERMISSION_FORM_RULES

  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    type: null,
    module: null,
  })

  // ============ 表格数据管理 ============
  const table = useTableCrud<PermissionData>({
    api: {
      list: '/sys/permissionsList',
    },
    columns: getTableColumns(),
  })

  const { data: tableData, loading, refresh } = table

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

  const tableColumns = computed(() => getTableColumns())

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
            formatter: (val: string) =>
              PERMISSION_TYPE_CONFIG[val as PermissionType]?.text || val,
          },
          {
            label: '所属模块',
            key: 'module',
            type: 'text',
            formatter: (val: string) =>
              SYSTEM_MODULES.find(m => m.value === val)?.label || val,
          },
          {
            label: '状态',
            key: 'status',
            type: 'tag',
            tagType: 'success',
            formatter: (val: number) => (val === 1 ? '启用' : '禁用'),
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
            formatter: (val: string[]) =>
              Array.isArray(val) ? val.join(', ') : '无',
          },
          { label: '描述', key: 'description', type: 'text', span: 2 },
          { label: '备注', key: 'remark', type: 'text', span: 2 },
        ],
      },
    ],
  }

  // ============ 工具栏按钮配置 ============
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增权限',
      icon: 'material-symbols:add',
      type: 'primary',
      onClick: () => openPermissionModal(),
    },
    {
      key: 'export',
      label: '导出',
      icon: 'material-symbols:download',
      loading: exportLoading.value,
      onClick: handleExport,
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'material-symbols:refresh',
      onClick: refresh,
    },
  ])

  // ============ 事件处理函数（提前声明） ============
  const handleExport = async () => {
    exportLoading.value = true
    try {
      message.info('导出功能开发中...')
    } finally {
      exportLoading.value = false
    }
  }

  const copyPermission = (permission: PermissionData) => {
    const next = { ...permission }
    next.name = `${permission.name} - 副本`
    next.code = `${permission.code}_copy`
    openPermissionModal(next)
  }

  const togglePermissionStatus = async (permission: PermissionData) => {
    try {
      const newStatus = permission.status === 1 ? 0 : 1
      const action = newStatus === 1 ? '启用' : '禁用'

      await updatePermissionApi(permission.id, { status: newStatus })
      message.success(`${action}成功`)
      await refresh()
    } catch {
      message.error('操作失败')
    }
  }

  // ============ 表格操作配置 ============
  const tableActions = computed(() => ({
    edit: (row: any) => updatePermissionApi(row.id, row),
    delete: (row: any) => deletePermissionApi(row.id),
    detail: (row: any) => getPermissionByIdApi(row.id),
    custom: [
      {
        key: 'copy',
        label: '复制',
        icon: 'material-symbols:content-copy',
        type: 'info' as const,
        onClick: (row: any) => copyPermission(row as PermissionData),
      },
      {
        key: 'toggle',
        label: (row: any) => (row?.status === 1 ? '禁用' : '启用'),
        icon: (row: any) =>
          row?.status === 1
            ? 'material-symbols:pause'
            : 'material-symbols:play-arrow',
        type: (row: any): 'warning' | 'success' =>
          row?.status === 1 ? 'warning' : 'success',
        onClick: (row: any) => togglePermissionStatus(row as PermissionData),
      },
    ],
  }))

  // ============ 工具函数 ============
  const getModuleName = (v: string) =>
    SYSTEM_MODULES.find(m => m.value === v)?.label || v

  const getTypeLabel = (v: string) =>
    UI_CONFIG.permissionType.find(t => t.value === v)?.label || v

  const handleStatCardClick = (type: string) => {
    searchForm.type = searchForm.type === type ? null : (type as PermissionType)
    handleSearch()
  }

  const clearFilter = (key: keyof SearchForm) => {
    ;(searchForm as any)[key] =
      key === 'status' ? null : key === 'type' || key === 'module' ? null : ''
    handleSearch()
  }

  const clearAllFilters = () => {
    Object.assign(searchForm, {
      keyword: '',
      status: null,
      type: null,
      module: null,
    })
    handleSearch()
  }

  // ============ 更多事件处理 ============
  const handleSearch = () => {
    // 前端筛选已通过 filteredData 计算属性实现
  }

  const handleSave = async (rowData: any) => {
    try {
      const permission = rowData as PermissionData
      await updatePermissionApi(permission.id, permission)
      message.success('修改成功')
      setTimeout(async () => {
        await refresh()
      }, 500)
    } catch (error) {
      message.error('保存失败')
      throw error
    }
  }

  const handleRowDelete = async () => {
    await refresh()
  }

  const handleViewDetail = async (row: PermissionData) => {
    try {
      detailLoading.value = true
      const { data } = await getPermissionByIdApi(row.id)
      currentPermission.value = data as PermissionData
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

  const openPermissionModal = (permission?: PermissionData) => {
    modalMode.value = permission ? 'edit' : 'add'
    if (permission) {
      Object.assign(formData, {
        id: permission.id,
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
    Object.assign(formData, DEFAULT_PERMISSION_FORM_DATA)
  }

  const handleTypeChange = (type: string) => {
    if (formData.module && type) generateCode()
  }

  const generateCode = () => {
    if (!formData.module || !formData.type) return
    const codeMap = {
      module: formData.module,
      function: `${formData.module}:manage`,
      button: `${formData.module}:add`,
      api: `${formData.module}:create`,
    }
    formData.code = (codeMap as any)[formData.type] || ''
  }

  const handleSavePermission = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      if (modalMode.value === 'add') {
        message.info(
          '请在后端提供创建接口或在 src/api/permission-manage.ts 增加 createPermissionApi'
        )
        return false
      }

      if (formData.id != null) {
        const submitData = {
          ...formData,
          resources: formData.resources
            ? formData.resources
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            : [],
        }
        await updatePermissionApi(formData.id, submitData)
        await refresh()
        message.success('修改成功')
      }

      showModal.value = false
      return true
    } catch (error) {
      console.error('保存失败:', error)
      return false
    }
  }
</script>
<style scoped lang="scss">
  @use './index.scss';
</style>
