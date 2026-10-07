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
    <input
      ref="importInputRef"
      type="file"
      accept=".json,application/json"
      hidden
      @change="handleImportFile"
    />
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
          />
          <NSelect
            v-model:value="searchForm.module"
            placeholder="所属模块"
            clearable
            style="width: 120px"
            :options="SYSTEM_MODULES"
          />
          <NSelect
            v-model:value="searchForm.status"
            placeholder="权限状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionStatus"
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
          <NButton
            @click="handleImport"
            :disabled="!mockMode"
            :title="
              mockMode ? '导入 JSON 权限数据' : '当前数据源暂不支持批量导入'
            "
          >
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
  import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
  import {
    UI_CONFIG,
    SYSTEM_MODULES,
    AUDIT_ACTION_CONFIG,
    AUDIT_TARGET_CONFIG,
  } from './data'
  import { usePermissionManagement } from './usePermissionManagement'

  defineOptions({ name: 'PermissionManage' })
  const {
    mockMode,
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
  } = usePermissionManagement()
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
