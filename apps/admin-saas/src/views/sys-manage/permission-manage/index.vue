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
          <NButton @click="refresh">
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
            v-model:data="filteredData"
            :columns="tableColumns as any"
            :loading="loading"
            :config="{
              actions: tableActions,
              edit: { mode: 'modal', modalTitle: '编辑权限', modalWidth: 800 },
              display: { striped: true, bordered: true, size: 'small' },
            }"
            @save="handleSave"
            @row-delete="handleRowDelete"
            @view-detail="handleViewDetail as any"
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

          <NDataTable
            :columns="dataPermissionColumns"
            :data="dataPermissionList"
            :row-key="(row: any) => row.id"
            size="small"
            striped
          />
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

          <NDataTable
            :columns="tempAuthColumns"
            :data="tempAuthList"
            :row-key="(row: any) => row.id"
            size="small"
            striped
          />
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

    <!-- ==================== 临时授权模态框 ==================== -->
    <NModal
      v-model:show="showTempAuthModal"
      preset="dialog"
      title="新增临时授权"
      positive-text="确认授权"
      negative-text="取消"
      @positive-click="handleSaveTempAuth"
      style="width: 650px"
    >
      <NForm
        ref="tempAuthFormRef"
        :model="tempAuthForm"
        label-placement="left"
        label-width="100px"
      >
        <NFormItem
          label="目标角色"
          path="targetRole"
        >
          <NSelect
            v-model:value="tempAuthForm.targetRole"
            :options="compareRoleOptions"
            placeholder="选择授权目标角色"
          />
        </NFormItem>
        <NFormItem
          label="授权权限"
          path="permissions"
        >
          <NSelect
            v-model:value="tempAuthForm.permissions"
            multiple
            :options="allPermissionOptions"
            placeholder="选择临时授予的权限"
          />
        </NFormItem>
        <NFormItem
          label="授权原因"
          path="reason"
        >
          <NInput
            v-model:value="tempAuthForm.reason"
            type="textarea"
            :rows="2"
            placeholder="请说明临时授权原因"
          />
        </NFormItem>
        <NFormItem
          label="有效期"
          path="dateRange"
        >
          <NDatePicker
            v-model:value="tempAuthForm.dateRange"
            type="datetimerange"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput
            v-model:value="tempAuthForm.remark"
            placeholder="备注信息（可选）"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import type { DataTableColumns, FormInst } from 'naive-ui/es'
  import type { DetailConfig } from '@/components/local/c_detail/data'
  import {
    type PermissionData,
    type PermissionFormData,
    type SearchForm,
    type PermissionType,
    type DataPermissionRule,
    type TempAuthorization,
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
    MOCK_TEMP_AUTHORIZATIONS,
    MOCK_CONSTRAINTS,
    MOCK_AUDIT_LOGS,
    getTableColumns,
  } from './data'
  import { MOCK_ROLE_DATA } from '../role-manage/data'
  import {
    updatePermissionApi,
    deletePermissionApi,
    getPermissionByIdApi,
  } from '@/api/permission-manage'
  import { useTableCrud } from '@robot-admin/request-core'

  import './index.scss'

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
  const formRef = ref<FormInst | null>(null)
  const tempAuthFormRef = ref<FormInst | null>(null)
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
    api: { list: '/sys/permissionsList' },
    columns: getTableColumns() as any,
  })
  const { data: tableData, loading, refresh } = table

  // ============ 数据权限状态 ============
  const dataPermissionList = ref<DataPermissionRule[]>([
    ...MOCK_DATA_PERMISSIONS,
  ])
  const selectedDataPermission = ref<DataPermissionRule | null>(null)

  // ============ 临时授权状态 ============
  const showTempAuthModal = ref(false)
  const tempAuthList = ref<TempAuthorization[]>([...MOCK_TEMP_AUTHORIZATIONS])
  const tempAuthForm = reactive({
    targetRole: null as string | null,
    permissions: [] as string[],
    reason: '',
    dateRange: null as [number, number] | null,
    remark: '',
  })

  // ============ 权限约束状态 ============
  const constraintList = ref([...MOCK_CONSTRAINTS])

  // ============ 审计日志状态 ============
  const auditLogs = ref<AuditLogItem[]>([...MOCK_AUDIT_LOGS])
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
    MOCK_ROLE_DATA.map(r => ({ label: r.name, value: r.id }))
  )

  const allPermissionOptions = computed(() => [
    { label: '新增用户', value: 'perm_1_1_1' },
    { label: '编辑用户', value: 'perm_1_1_2' },
    { label: '删除用户', value: 'perm_1_1_3' },
    { label: '新增角色', value: 'perm_1_2_1' },
    { label: '编辑角色', value: 'perm_1_2_2' },
    { label: '删除角色', value: 'perm_1_2_3' },
    { label: '发布文章', value: 'perm_2_1_1' },
    { label: '编辑文章', value: 'perm_2_1_2' },
    { label: '查看报表', value: 'perm_3_1' },
    { label: '导出数据', value: 'perm_3_2' },
  ])

  const auditActionOptions = Object.entries(AUDIT_ACTION_CONFIG).map(
    ([value, config]) => ({ label: config.text, value })
  )

  const auditTargetOptions = Object.entries(AUDIT_TARGET_CONFIG).map(
    ([value, config]) => ({ label: config.text, value })
  )

  // ============ 数据权限表格列配置 ============
  const dataPermissionColumns: DataTableColumns = [
    {
      title: '模块',
      key: 'moduleName',
      width: 120,
    },
    {
      title: '数据范围',
      key: 'scope',
      width: 140,
      render: (row: any) => {
        const config =
          DATA_SCOPE_CONFIG[row.scope as keyof typeof DATA_SCOPE_CONFIG]
        return h(
          NTag,
          { type: config?.type as any, size: 'small' },
          { default: () => config?.text || row.scope }
        )
      },
    },
    {
      title: '自定义部门',
      key: 'departmentIds',
      width: 160,
      render: (row: any) =>
        row.scope === 'custom'
          ? h('span', null, `${row.departmentIds.length} 个部门`)
          : h('span', { style: { color: '#999' } }, '—'),
    },
    {
      title: '字段权限',
      key: 'fieldPermissions',
      width: 120,
      render: (row: any) => {
        const total = row.fieldPermissions.length
        const masked = row.fieldPermissions.filter((f: any) => f.masked).length
        const hidden = row.fieldPermissions.filter(
          (f: any) => !f.visible
        ).length
        return h(NSpace, { size: 4 }, () => [
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
      render: (row: any) =>
        h(NSpace, { size: 8 }, () => [
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
  const tempAuthColumns: DataTableColumns = [
    { title: '目标角色', key: 'targetRoleName', width: 120 },
    {
      title: '授权权限',
      key: 'permissionNames',
      width: 180,
      render: (row: any) =>
        h(NSpace, { size: 4 }, () =>
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
      render: (row: any) => {
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
      render: (row: any) =>
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
    ;(searchForm as any)[key] =
      key === 'status' ? null : key === 'type' || key === 'module' ? null : ''
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

  const handleSave = async (rowData: any) => {
    try {
      await updatePermissionApi(rowData.id, rowData)
      message.success('修改成功')
      setTimeout(() => refresh(), 500)
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
    const codeMap: Record<string, string> = {
      module: formData.module,
      function: `${formData.module}:manage`,
      button: `${formData.module}:add`,
      api: `${formData.module}:create`,
    }
    formData.code = codeMap[formData.type] || ''
  }

  const handleSavePermission = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      if (modalMode.value === 'add') {
        message.success('权限创建成功（演示模式）')
        showModal.value = false
        return true
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
    } catch {
      return false
    }
  }

  // ============ 数据权限事件处理 ============
  const handleAddDataPermission = () => {
    message.info('新增数据权限规则（演示模式）')
  }

  const handleEditDataPermission = (row: DataPermissionRule) => {
    selectedDataPermission.value = {
      ...row,
      fieldPermissions: row.fieldPermissions.map(f => ({ ...f })),
    }
  }

  const handleEditScope = (row: DataPermissionRule) => {
    dialog.create({
      title: `修改数据范围 — ${row.moduleName}`,
      content: () =>
        h('div', { style: { padding: '16px 0' } }, [
          h(
            'p',
            { style: { marginBottom: '12px', color: '#666' } },
            `当前范围: ${DATA_SCOPE_CONFIG[row.scope]?.text}`
          ),
          ...DATA_SCOPE_OPTIONS.map(opt =>
            h(
              'div',
              {
                style: {
                  padding: '8px 12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${row.scope === opt.value ? '#2080f0' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  backgroundColor:
                    row.scope === opt.value ? '#f0f7ff' : 'transparent',
                },
                onClick: () => {
                  row.scope = opt.value as any
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
      onPositiveClick: () => {
        message.success(
          `数据范围已更新为「${DATA_SCOPE_CONFIG[row.scope]?.text}」`
        )
      },
    })
  }

  const handleSaveFieldPermissions = () => {
    if (!selectedDataPermission.value) return
    const idx = dataPermissionList.value.findIndex(
      d => d.id === selectedDataPermission.value!.id
    )
    if (idx !== -1) {
      dataPermissionList.value[idx] = { ...selectedDataPermission.value }
    }
    message.success('字段权限配置已保存')
    selectedDataPermission.value = null
  }

  // ============ 临时授权事件处理 ============
  const handleSaveTempAuth = (): boolean => {
    if (!tempAuthForm.targetRole || tempAuthForm.permissions.length === 0) {
      message.warning('请选择目标角色和授权权限')
      return false
    }
    if (!tempAuthForm.dateRange) {
      message.warning('请选择有效期')
      return false
    }
    const role = MOCK_ROLE_DATA.find(r => r.id === tempAuthForm.targetRole)
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
    tempAuthList.value.unshift(newAuth)
    message.success('临时授权创建成功')

    // 重置表单
    tempAuthForm.targetRole = null
    tempAuthForm.permissions = []
    tempAuthForm.reason = ''
    tempAuthForm.dateRange = null
    tempAuthForm.remark = ''
    showTempAuthModal.value = false
    return true
  }

  const handleRevokeTempAuth = (auth: TempAuthorization) => {
    dialog.warning({
      title: '撤销临时授权',
      content: `确定撤销对角色「${auth.targetRoleName}」的临时授权吗？`,
      positiveText: '确认撤销',
      negativeText: '取消',
      onPositiveClick: () => {
        const idx = tempAuthList.value.findIndex(t => t.id === auth.id)
        if (idx !== -1) {
          tempAuthList.value[idx] = {
            ...tempAuthList.value[idx],
            status: 'revoked',
          }
        }
        message.success('临时授权已撤销')
      },
    })
  }

  // ============ 权限对比事件处理 ============
  const handleCompare = () => {
    if (!compareRoleA.value || !compareRoleB.value) return
    const roleA = MOCK_ROLE_DATA.find(r => r.id === compareRoleA.value)
    const roleB = MOCK_ROLE_DATA.find(r => r.id === compareRoleB.value)
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
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
