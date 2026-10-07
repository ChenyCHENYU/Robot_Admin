<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-15
 * @FilePath: \Robot_Admin\src\views\sys-manage\permission-manage\index.vue
 * @Description: 权限管理 - 权限资源库 / 数据权限 / 临时授权 / 权限约束 / 审计日志 / 权限对比
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

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
        <NSpace>
          <NButton
            type="primary"
            @click="openPermissionModal()"
          >
            <template #icon>
              <C_Icon
                name="material-symbols:add"
                :size="16"
              />
            </template>
            新增权限
          </NButton>
          <NButton
            @click="handleExport"
            :loading="exportLoading"
          >
            <template #icon>
              <C_Icon
                name="material-symbols:download"
                :size="16"
              />
            </template>
            导出
          </NButton>
          <NButton @click="handleImport">
            <template #icon>
              <C_Icon
                name="material-symbols:upload"
                :size="16"
              />
            </template>
            导入
          </NButton>
          <NButton @click="handleRefresh">
            <template #icon>
              <C_Icon
                name="material-symbols:refresh"
                :size="16"
              />
            </template>
            刷新
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 功能标签页 -->
    <NTabs
      v-model:value="activeTab"
      type="card"
      animated
      class="main-tabs"
    >
      <!-- ==================== Tab 1: 权限资源库 ==================== -->
      <NTabPane
        name="resources"
        tab="权限资源库"
      >
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
            <NButton
              text
              size="small"
              @click="clearAllFilters"
              type="error"
            >
              清空筛选
            </NButton>
          </NSpace>
        </div>

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
            :data="filteredData"
            :columns="tableColumns"
            :loading="loading"
            :config="{
              actions: tableActions,
              edit: { mode: 'modal', modalTitle: '编辑权限', modalWidth: 800 },
              display: { striped: true, bordered: true, size: 'small' },
            }"
            @save="handleSave"
            @row-delete="handleRowDelete"
            @view-detail="handleViewDetail"
          />
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 2: 数据权限 ==================== -->
      <NTabPane
        name="data-permission"
        tab="数据权限"
      >
        <NCard class="content-card">
          <template #header>
            <NSpace
              justify="space-between"
              align="center"
            >
              <NText strong>数据权限规则配置</NText>
              <NButton
                type="primary"
                size="small"
                @click="handleAddDataPermission"
              >
                <template #icon>
                  <C_Icon
                    name="material-symbols:add"
                    :size="14"
                  />
                </template>
                新增规则
              </NButton>
            </NSpace>
          </template>

          <C_Table
            :columns="dataPermissionColumns"
            :data="dataPermissionList"
            :loading="governanceLoading"
            :row-key="getDataPermissionRowKey"
            :config="{
              toolbar: { show: false },
              pagination: false,
              display: { size: 'small', striped: true },
            }"
          >
            <template #loading>
              <C_Loading label="正在加载数据权限" />
            </template>
          </C_Table>
        </NCard>

        <!-- 数据权限详细配置 - 字段级权限 -->
        <NCard
          v-if="selectedDataPermission"
          class="content-card"
          style="margin-top: 16px"
        >
          <template #header>
            <NSpace align="center">
              <C_Icon
                name="mdi:shield-lock"
                :size="18"
              />
              <NText strong>
                字段权限配置 — {{ selectedDataPermission.moduleName }}
              </NText>
            </NSpace>
          </template>

          <NGrid
            :cols="3"
            :x-gap="24"
          >
            <NGi
              v-for="field in selectedDataPermission.fieldPermissions"
              :key="field.field"
            >
              <NCard
                size="small"
                :bordered="true"
                class="field-permission-card"
              >
                <NSpace
                  vertical
                  :size="8"
                >
                  <NText strong>{{ field.label }}</NText>
                  <NText
                    depth="3"
                    style="font-size: 12px"
                  >
                    字段名: {{ field.field }}
                  </NText>
                  <NSpace :size="16">
                    <NSwitch
                      v-model:value="field.visible"
                      size="small"
                    >
                      <template #checked>可见</template>
                      <template #unchecked>隐藏</template>
                    </NSwitch>
                    <NSwitch
                      v-model:value="field.editable"
                      size="small"
                      :disabled="!field.visible"
                    >
                      <template #checked>可编辑</template>
                      <template #unchecked>只读</template>
                    </NSwitch>
                    <NSwitch
                      v-model:value="field.masked"
                      size="small"
                      :disabled="!field.visible"
                    >
                      <template #checked>脱敏</template>
                      <template #unchecked>明文</template>
                    </NSwitch>
                  </NSpace>
                </NSpace>
              </NCard>
            </NGi>
          </NGrid>

          <NSpace
            justify="end"
            style="margin-top: 16px"
          >
            <NButton @click="selectedDataPermission = null">取消</NButton>
            <NButton
              type="primary"
              @click="handleSaveFieldPermissions"
            >
              保存字段权限
            </NButton>
          </NSpace>
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 3: 临时授权 ==================== -->
      <NTabPane
        name="temp-auth"
        tab="临时授权"
      >
        <NCard class="content-card">
          <template #header>
            <NSpace
              justify="space-between"
              align="center"
            >
              <NSpace align="center">
                <NText strong>临时授权管理</NText>
                <NTag
                  type="success"
                  size="small"
                >
                  生效中: {{ activeTempAuthCount }}
                </NTag>
              </NSpace>
              <NButton
                type="primary"
                size="small"
                @click="showTempAuthModal = true"
              >
                <template #icon>
                  <C_Icon
                    name="mdi:shield-plus"
                    :size="14"
                  />
                </template>
                新增临时授权
              </NButton>
            </NSpace>
          </template>

          <C_Table
            :columns="tempAuthColumns"
            :data="tempAuthList"
            :loading="governanceLoading"
            :row-key="getTempAuthorizationRowKey"
            :config="{
              toolbar: { show: false },
              pagination: false,
              display: { size: 'small', striped: true },
            }"
          >
            <template #loading>
              <C_Loading label="正在加载临时授权" />
            </template>
          </C_Table>
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 4: 权限约束 ==================== -->
      <NTabPane
        name="constraints"
        tab="权限约束"
      >
        <NGrid
          :cols="2"
          :x-gap="16"
        >
          <!-- 互斥关系 -->
          <NGi>
            <NCard class="content-card">
              <template #header>
                <NSpace align="center">
                  <C_Icon
                    name="mdi:swap-horizontal"
                    :size="18"
                    color="#d03050"
                  />
                  <NText strong>互斥关系</NText>
                  <NTag
                    type="error"
                    size="small"
                  >
                    {{ mutualExclusionConstraints.length }} 条
                  </NTag>
                </NSpace>
              </template>

              <NList bordered>
                <NListItem
                  v-for="item in mutualExclusionConstraints"
                  :key="item.id"
                >
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NSpace align="center">
                      <NTag
                        type="warning"
                        size="small"
                      >
                        {{ item.sourceName }}
                      </NTag>
                      <C_Icon
                        name="mdi:swap-horizontal"
                        :size="16"
                        color="#d03050"
                      />
                      <NTag
                        type="warning"
                        size="small"
                      >
                        {{ item.targetName }}
                      </NTag>
                    </NSpace>
                    <NText
                      depth="3"
                      style="font-size: 12px"
                    >
                      {{ item.description }}
                    </NText>
                    <NText
                      depth="3"
                      style="font-size: 11px"
                    >
                      编码: {{ item.sourceCode }} ⇔ {{ item.targetCode }}
                    </NText>
                  </NSpace>
                </NListItem>
                <NEmpty
                  v-if="mutualExclusionConstraints.length === 0"
                  description="暂无互斥关系"
                />
              </NList>
            </NCard>
          </NGi>

          <!-- 继承关系 -->
          <NGi>
            <NCard class="content-card">
              <template #header>
                <NSpace align="center">
                  <C_Icon
                    name="mdi:arrow-down"
                    :size="18"
                    color="#2080f0"
                  />
                  <NText strong>继承关系</NText>
                  <NTag
                    type="info"
                    size="small"
                  >
                    {{ inheritanceConstraints.length }} 条
                  </NTag>
                </NSpace>
              </template>

              <NList bordered>
                <NListItem
                  v-for="item in inheritanceConstraints"
                  :key="item.id"
                >
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NSpace align="center">
                      <NTag
                        type="info"
                        size="small"
                      >
                        {{ item.sourceName }}
                      </NTag>
                      <C_Icon
                        name="mdi:arrow-right"
                        :size="16"
                        color="#2080f0"
                      />
                      <NTag
                        type="success"
                        size="small"
                      >
                        {{ item.targetName }}
                      </NTag>
                    </NSpace>
                    <NText
                      depth="3"
                      style="font-size: 12px"
                    >
                      {{ item.description }}
                    </NText>
                    <NText
                      depth="3"
                      style="font-size: 11px"
                    >
                      编码: {{ item.sourceCode }} → {{ item.targetCode }}
                    </NText>
                  </NSpace>
                </NListItem>
                <NEmpty
                  v-if="inheritanceConstraints.length === 0"
                  description="暂无继承关系"
                />
              </NList>
            </NCard>
          </NGi>
        </NGrid>
      </NTabPane>

      <!-- ==================== Tab 5: 审计日志 ==================== -->
      <NTabPane
        name="audit-log"
        tab="审计日志"
      >
        <NCard class="content-card">
          <template #header>
            <NSpace
              justify="space-between"
              align="center"
            >
              <NText strong>权限变更日志</NText>
              <NSpace>
                <NSelect
                  v-model:value="auditFilter.action"
                  placeholder="操作类型"
                  clearable
                  style="width: 120px"
                  :options="auditActionOptions"
                />
                <NSelect
                  v-model:value="auditFilter.targetType"
                  placeholder="目标类型"
                  clearable
                  style="width: 120px"
                  :options="auditTargetOptions"
                />
              </NSpace>
            </NSpace>
          </template>

          <NTimeline>
            <NTimelineItem
              v-for="log in filteredAuditLogs"
              :key="log.id"
              :type="AUDIT_ACTION_CONFIG[log.action].type"
              :title="`${log.operatorName} ${AUDIT_ACTION_CONFIG[log.action].text}了${AUDIT_TARGET_CONFIG[log.targetType].text}「${log.targetName}」`"
              :content="log.detail"
              :time="`${log.timestamp} | IP: ${log.ip}`"
            />
          </NTimeline>
          <NEmpty
            v-if="filteredAuditLogs.length === 0"
            description="暂无审计日志"
          />
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 6: 权限对比 ==================== -->
      <NTabPane
        name="comparison"
        tab="权限对比"
      >
        <NCard class="content-card">
          <template #header>
            <NText strong>角色权限对比工具</NText>
          </template>

          <NSpace
            align="center"
            style="margin-bottom: 16px"
          >
            <NSelect
              v-model:value="compareRoleA"
              placeholder="选择角色 A"
              style="width: 200px"
              :options="compareRoleOptions"
            />
            <C_Icon
              name="mdi:swap-horizontal"
              :size="20"
            />
            <NSelect
              v-model:value="compareRoleB"
              placeholder="选择角色 B"
              style="width: 200px"
              :options="compareRoleOptions"
            />
            <NButton
              type="primary"
              :disabled="!compareRoleA || !compareRoleB"
              @click="handleCompare"
            >
              开始对比
            </NButton>
          </NSpace>

          <div v-if="comparisonResult">
            <NGrid
              :cols="3"
              :x-gap="16"
            >
              <NGi>
                <NCard
                  size="small"
                  :bordered="true"
                >
                  <template #header>
                    <NSpace align="center">
                      <NTag
                        type="success"
                        size="small"
                      >
                        共有权限
                      </NTag>
                      <NText depth="3">
                        {{ comparisonResult.shared.length }} 项
                      </NText>
                    </NSpace>
                  </template>
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NTag
                      v-for="perm in comparisonResult.shared"
                      :key="perm"
                      type="success"
                      size="small"
                    >
                      {{ perm }}
                    </NTag>
                    <NEmpty
                      v-if="comparisonResult.shared.length === 0"
                      description="无共有权限"
                      size="small"
                    />
                  </NSpace>
                </NCard>
              </NGi>
              <NGi>
                <NCard
                  size="small"
                  :bordered="true"
                >
                  <template #header>
                    <NSpace align="center">
                      <NTag
                        type="info"
                        size="small"
                      >
                        仅 {{ comparisonResult.roleAName }}
                      </NTag>
                      <NText depth="3">
                        {{ comparisonResult.onlyA.length }} 项
                      </NText>
                    </NSpace>
                  </template>
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NTag
                      v-for="perm in comparisonResult.onlyA"
                      :key="perm"
                      type="info"
                      size="small"
                    >
                      {{ perm }}
                    </NTag>
                    <NEmpty
                      v-if="comparisonResult.onlyA.length === 0"
                      description="无独有权限"
                      size="small"
                    />
                  </NSpace>
                </NCard>
              </NGi>
              <NGi>
                <NCard
                  size="small"
                  :bordered="true"
                >
                  <template #header>
                    <NSpace align="center">
                      <NTag
                        type="warning"
                        size="small"
                      >
                        仅 {{ comparisonResult.roleBName }}
                      </NTag>
                      <NText depth="3">
                        {{ comparisonResult.onlyB.length }} 项
                      </NText>
                    </NSpace>
                  </template>
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NTag
                      v-for="perm in comparisonResult.onlyB"
                      :key="perm"
                      type="warning"
                      size="small"
                    >
                      {{ perm }}
                    </NTag>
                    <NEmpty
                      v-if="comparisonResult.onlyB.length === 0"
                      description="无独有权限"
                      size="small"
                    />
                  </NSpace>
                </NCard>
              </NGi>
            </NGrid>
          </div>
          <NEmpty
            v-else
            description="选择两个角色进行权限对比"
          />
        </NCard>
      </NTabPane>
    </NTabs>

    <!-- ==================== 权限详情抽屉 ==================== -->
    <c_detail
      v-model:visible="showPermissionDetail"
      :data="currentPermission || {}"
      :config="detailConfig"
      title="权限详情"
      :loading="detailLoading"
      @close="handleDetailClose"
    />

    <!-- ==================== 新增/编辑权限模态框 ==================== -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="() => formRef?.submit() ?? false"
      :closable="!formRef?.isSubmitting"
      :mask-closable="!formRef?.isSubmitting"
      :close-on-esc="!formRef?.isSubmitting"
      :negative-button-props="{ disabled: !!formRef?.isSubmitting }"
      @negative-click="closePermissionModal"
      style="width: 700px"
    >
      <C_Form
        v-if="showModal"
        ref="formRef"
        :model-value="formData"
        @update:model-value="updatePermissionForm"
        :options="formOptions"
        :config="formConfig"
        :renderers="formRenderers"
        @submit="showModal = false"
      />
    </NModal>

    <!-- ==================== 临时授权模态框 ==================== -->
    <NModal
      v-model:show="showTempAuthModal"
      preset="dialog"
      title="新增临时授权"
      positive-text="确认授权"
      negative-text="取消"
      @positive-click="() => tempAuthFormRef?.submit() ?? false"
      :closable="!tempAuthFormRef?.isSubmitting"
      :mask-closable="!tempAuthFormRef?.isSubmitting"
      :close-on-esc="!tempAuthFormRef?.isSubmitting"
      :negative-button-props="{ disabled: !!tempAuthFormRef?.isSubmitting }"
      style="width: 650px"
    >
      <C_Form
        v-if="showTempAuthModal"
        ref="tempAuthFormRef"
        :model-value="tempAuthForm"
        @update:model-value="Object.assign(tempAuthForm, $event)"
        :options="tempAuthOptions"
        :config="tempAuthConfig"
        @submit="showTempAuthModal = false"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'

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
    type DataScopeType,
    type DataPermissionRule,
    type FieldPermissionItem,
    type TempAuthorization,
    type PermissionConstraint,
    type AuditLogItem,
    PERMISSION_FORM_RULES,
    DEFAULT_PERMISSION_FORM_DATA,
    UI_CONFIG,
    PERMISSION_TYPE_CONFIG,
    SYSTEM_MODULES,
    DATA_SCOPE_CONFIG,
    DATA_SCOPE_OPTIONS,
    TEMP_AUTH_STATUS_CONFIG,
    AUDIT_ACTION_CONFIG,
    AUDIT_TARGET_CONFIG,
    MOCK_DATA_PERMISSIONS,
    MOCK_PERMISSION_RESOURCES,
    MOCK_TEMP_AUTHORIZATIONS,
    MOCK_CONSTRAINTS,
    MOCK_AUDIT_LOGS,
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
  import {
    getRoleListApi,
    MOCK_ROLE_DATA,
    type RoleData,
  } from '../role-manage/data'

  defineOptions({ name: 'PermissionManage' })

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
  const dataPermissionList = ref<DataPermissionRule[]>(
    mockMode ? [...MOCK_DATA_PERMISSIONS] : []
  )
  const selectedDataPermission = ref<DataPermissionRule | null>(null)

  // ============ 临时授权状态 ============
  const showTempAuthModal = ref(false)
  const tempAuthList = ref<TempAuthorization[]>(
    mockMode ? [...MOCK_TEMP_AUTHORIZATIONS] : []
  )
  const tempAuthForm = reactive({
    targetRole: null as string | null,
    permissions: [] as string[],
    reason: '',
    dateRange: null as [number, number] | null,
    remark: '',
  })

  // ============ 权限约束状态 ============
  const constraintList = ref<PermissionConstraint[]>(
    mockMode ? [...MOCK_CONSTRAINTS] : []
  )

  // ============ 审计日志状态 ============
  const auditLogs = ref<AuditLogItem[]>(mockMode ? [...MOCK_AUDIT_LOGS] : [])
  const roleList = ref<RoleData[]>(mockMode ? [...MOCK_ROLE_DATA] : [])
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
  const dataPermissionColumns: TableColumn<DataPermissionRule>[] = [
    {
      title: '模块',
      key: 'moduleName',
      width: 120,
    },
    {
      title: '数据范围',
      key: 'scope',
      width: 140,
      render: (row: DataPermissionRule) => {
        const config =
          DATA_SCOPE_CONFIG[row.scope as keyof typeof DATA_SCOPE_CONFIG]
        return h(
          NTag,
          { type: config?.type, size: 'small' },
          { default: () => config?.text || row.scope }
        )
      },
    },
    {
      title: '自定义部门',
      key: 'departmentIds',
      width: 160,
      render: (row: DataPermissionRule) =>
        row.scope === 'custom'
          ? h('span', null, `${row.departmentIds.length} 个部门`)
          : h('span', { style: { color: '#999' } }, '—'),
    },
    {
      title: '字段权限',
      key: 'fieldPermissions',
      width: 120,
      render: (row: DataPermissionRule) => {
        const total = row.fieldPermissions.length
        const masked = row.fieldPermissions.filter(
          (f: FieldPermissionItem) => f.masked
        ).length
        const hidden = row.fieldPermissions.filter(
          (f: FieldPermissionItem) => !f.visible
        ).length
        return h(NSpace, { size: 4, justify: 'center' }, () => [
          h(
            NTag,
            { type: 'info', size: 'small' },
            { default: () => `${total} 字段` }
          ),
          masked > 0
            ? h(
                NTag,
                { type: 'warning', size: 'small' },
                { default: () => `${masked} 脱敏` }
              )
            : null,
          hidden > 0
            ? h(
                NTag,
                { type: 'error', size: 'small' },
                { default: () => `${hidden} 隐藏` }
              )
            : null,
        ])
      },
    },
    {
      title: '更新时间',
      key: 'updateTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (row: DataPermissionRule) =>
        h(NSpace, { size: 8, justify: 'center' }, () => [
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              size: 'small',
              onClick: () => handleEditDataPermission(row),
            },
            { default: () => '配置字段' }
          ),
          h(
            NButton,
            {
              text: true,
              type: 'info',
              size: 'small',
              onClick: () => handleEditScope(row),
            },
            { default: () => '修改范围' }
          ),
        ]),
    },
  ]

  // ============ 临时授权表格列配置 ============
  const tempAuthColumns: TableColumn<TempAuthorization>[] = [
    { title: '目标角色', key: 'targetRoleName', width: 120 },
    {
      title: '授权权限',
      key: 'permissionNames',
      width: 180,
      render: (row: TempAuthorization) =>
        h(NSpace, { size: 4, justify: 'center' }, () =>
          row.permissionNames.map((name: string) =>
            h(NTag, { type: 'info', size: 'small' }, { default: () => name })
          )
        ),
    },
    { title: '授权原因', key: 'reason', width: 200 },
    { title: '授权人', key: 'grantedByName', width: 100 },
    { title: '开始时间', key: 'startTime', width: 160 },
    { title: '过期时间', key: 'expireTime', width: 160 },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (row: TempAuthorization) => {
        const config =
          TEMP_AUTH_STATUS_CONFIG[
            row.status as keyof typeof TEMP_AUTH_STATUS_CONFIG
          ]
        return h(
          NTag,
          { type: config.type, size: 'small' },
          { default: () => config.text }
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (row: TempAuthorization) =>
        row.status === 'active'
          ? h(
              NButton,
              {
                text: true,
                type: 'error',
                size: 'small',
                onClick: () => handleRevokeTempAuth(row),
              },
              { default: () => '撤销' }
            )
          : h('span', { style: { color: '#999' } }, '—'),
    },
  ]

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
    data: Record<string, unknown>
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
    } as PermissionData
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
    data: Record<string, unknown>
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
      } as PermissionData,
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
    return response.data as PermissionData
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
  const handleSearch = () => {
    // 前端筛选已通过 filteredData 计算属性实现
  }

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

  /**
   * * @description: 导入权限数据（文件选择 → 解析 JSON）
   */
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (Array.isArray(data)) {
            message.success(`成功解析 ${data.length} 条权限数据，请确认后保存`)
          } else {
            message.error('文件格式不正确，请导入 JSON 数组格式')
          }
        } catch {
          message.error('文件解析失败，请检查 JSON 格式')
        }
      }
      reader.readAsText(file)
    }
    input.click()
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
    const submitData: Record<string, unknown> = {
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
        h('div', { style: { padding: '16px 0' } }, [
          h(
            'p',
            { style: { marginBottom: '12px', color: '#666' } },
            `当前范围: ${DATA_SCOPE_CONFIG[pendingScope.value].text}`
          ),
          ...DATA_SCOPE_OPTIONS.map(opt =>
            h(
              'div',
              {
                style: {
                  padding: '8px 12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${pendingScope.value === opt.value ? '#2080f0' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  backgroundColor:
                    pendingScope.value === opt.value
                      ? '#f0f7ff'
                      : 'transparent',
                },
                onClick: () => {
                  pendingScope.value = opt.value as DataScopeType
                },
              },
              [
                h('div', { style: { fontWeight: '500' } }, opt.label),
                h(
                  'div',
                  { style: { fontSize: '12px', color: '#999' } },
                  opt.description
                ),
              ]
            )
          ),
        ]),
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

    const namesA = roleA.permissionNames || []
    const namesB = roleB.permissionNames || []
    const setA = new Set(namesA)
    const setB = new Set(namesB)

    comparisonResult.value = {
      roleAName: roleA.name,
      roleBName: roleB.name,
      shared: namesA.filter(n => setB.has(n)),
      onlyA: namesA.filter(n => !setB.has(n)),
      onlyB: namesB.filter(n => !setA.has(n)),
    }
  }

  const { loading: governanceLoading, run: runLatestGovernanceRequest } =
    useLatestRequest()

  const loadGovernanceData = async () => {
    try {
      const result = await runLatestGovernanceRequest(signal =>
        Promise.all([
          getDataPermissionRulesApi(dataPermissionList.value, signal),
          getTempAuthorizationsApi(tempAuthList.value, signal),
          getPermissionConstraintsApi(constraintList.value, signal),
          getPermissionAuditLogsApi(auditLogs.value, signal),
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
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
