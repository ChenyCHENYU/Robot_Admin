<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: role-manage 页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="role-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace>
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索角色名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                :name="ICONS.search"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="searchForm.type"
            placeholder="角色类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleType"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.status"
            placeholder="角色状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleStatus"
            @update:value="handleSearch"
          />
        </NSpace>

        <C_ActionBar
          :actions="toolbarActions"
          :config="{ compact: true }"
        />
      </NSpace>
    </NCard>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <NCard class="content-card">
        <template #header>
          <NSpace
            justify="space-between"
            align="center"
          >
            <NText>
              角色列表
              <NTag
                type="info"
                size="small"
                style="margin-left: 8px"
              >
                共 {{ pagination.itemCount }} 个
              </NTag>
            </NText>
          </NSpace>
        </template>

        <!-- 使用 C_Table 组件 -->
        <C_Table
          ref="tableRef"
          :columns="tableColumns"
          :data="roleList"
          :loading="loading"
          :row-key="rowKey"
          :config="{
            actions: tableActions,
            edit: { modalTitle: '编辑角色', modalWidth: 800 },
            pagination: {
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.itemCount,
              remote: true,
            },
          }"
          @save="handleTableSave"
          @pagination-change="handlePaginationChange"
        />
      </NCard>
    </div>

    <!-- 角色详情抽屉（增强版 4 标签） -->
    <NDrawer
      v-model:show="showRoleDetail"
      :width="720"
      placement="right"
    >
      <NDrawerContent
        title="角色详情"
        closable
      >
        <div
          class="role-detail"
          v-if="currentRole"
        >
          <NTabs
            v-model:value="detailTab"
            type="line"
            animated
          >
            <!-- 标签1: 基本信息 -->
            <NTabPane
              name="basic"
              tab="基本信息"
            >
              <NSpace
                vertical
                :size="24"
              >
                <NCard
                  title="基本信息"
                  size="small"
                >
                  <NDescriptions
                    :column="2"
                    bordered
                  >
                    <NDescriptionsItem
                      v-for="field in roleDetailFields"
                      :key="field.key"
                      :label="field.label"
                    >
                      <component
                        :is="field.component"
                        v-bind="field.props"
                      >
                        {{ field.value }}
                      </component>
                    </NDescriptionsItem>
                  </NDescriptions>
                </NCard>

                <NCard
                  title="权限信息"
                  size="small"
                  v-if="currentRole.permissionNames?.length"
                >
                  <NSpace>
                    <NTag
                      v-for="permission in currentRole.permissionNames"
                      :key="permission"
                      type="primary"
                      size="medium"
                    >
                      <template #icon>
                        <C_Icon
                          :name="ICONS.permission"
                          :size="12"
                        />
                      </template>
                      {{ permission }}
                    </NTag>
                  </NSpace>
                </NCard>
              </NSpace>
            </NTabPane>

            <!-- 标签2: 权限预览 -->
            <NTabPane
              name="preview"
              tab="权限预览"
            >
              <NSpace
                vertical
                :size="16"
              >
                <!-- 菜单权限 -->
                <NCard
                  title="菜单权限"
                  size="small"
                >
                  <template #header-extra>
                    <NTag
                      size="small"
                      type="info"
                    >
                      {{ groupedPreview.menus.length }} 项
                    </NTag>
                  </template>
                  <NEmpty
                    v-if="!groupedPreview.menus.length"
                    description="暂无菜单权限"
                  />
                  <div
                    v-else
                    class="preview-grid"
                  >
                    <div
                      v-for="item in groupedPreview.menus"
                      :key="item.id"
                      class="preview-item"
                    >
                      <C_Icon
                        :name="item.icon || 'mdi:menu'"
                        :size="16"
                      />
                      <div class="preview-item-info">
                        <NText strong>{{ item.name }}</NText>
                        <NText
                          depth="3"
                          style="font-size: 12px"
                        >
                          {{ item.path || item.code }}
                        </NText>
                      </div>
                    </div>
                  </div>
                </NCard>

                <!-- 按钮权限 -->
                <NCard
                  title="按钮权限"
                  size="small"
                >
                  <template #header-extra>
                    <NTag
                      size="small"
                      type="success"
                    >
                      {{ groupedPreview.buttons.length }} 项
                    </NTag>
                  </template>
                  <NEmpty
                    v-if="!groupedPreview.buttons.length"
                    description="暂无按钮权限"
                  />
                  <NSpace
                    v-else
                    :size="8"
                    wrap
                  >
                    <NTag
                      v-for="item in groupedPreview.buttons"
                      :key="item.id"
                      type="success"
                      size="medium"
                    >
                      <template #icon>
                        <C_Icon
                          :name="item.icon || 'mdi:gesture-tap-button'"
                          :size="12"
                        />
                      </template>
                      {{ item.parentName ? `${item.parentName} / ` : ''
                      }}{{ item.name }}
                    </NTag>
                  </NSpace>
                </NCard>

                <!-- API 权限 -->
                <NCard
                  v-if="groupedPreview.apis.length"
                  title="API 权限"
                  size="small"
                >
                  <template #header-extra>
                    <NTag
                      size="small"
                      type="warning"
                    >
                      {{ groupedPreview.apis.length }} 项
                    </NTag>
                  </template>
                  <NSpace
                    :size="8"
                    wrap
                  >
                    <NTag
                      v-for="item in groupedPreview.apis"
                      :key="item.id"
                      type="warning"
                      size="medium"
                    >
                      {{ item.name }}
                    </NTag>
                  </NSpace>
                </NCard>
              </NSpace>
            </NTabPane>

            <!-- 标签3: 数据权限 -->
            <NTabPane
              name="dataScope"
              tab="数据权限"
            >
              <NEmpty
                v-if="!currentDataScopes.length"
                description="暂无数据权限配置"
              />
              <NSpace
                v-else
                vertical
                :size="12"
              >
                <NCard
                  v-for="scope in currentDataScopes"
                  :key="scope.module"
                  size="small"
                  class="data-scope-card"
                >
                  <NSpace
                    align="center"
                    justify="space-between"
                  >
                    <NSpace align="center">
                      <C_Icon
                        :name="DATA_SCOPE_CONFIG[scope.scope].icon"
                        :size="20"
                      />
                      <div>
                        <NText strong>{{ scope.moduleName }}</NText>
                        <br />
                        <NText
                          depth="3"
                          style="font-size: 12px"
                        >
                          {{ DATA_SCOPE_CONFIG[scope.scope].description }}
                        </NText>
                      </div>
                    </NSpace>
                    <NTag
                      :type="DATA_SCOPE_CONFIG[scope.scope].type"
                      size="medium"
                    >
                      {{ DATA_SCOPE_CONFIG[scope.scope].text }}
                    </NTag>
                  </NSpace>
                </NCard>
              </NSpace>
            </NTabPane>

            <!-- 标签4: 临时授权 -->
            <NTabPane
              name="tempAuth"
              tab="临时授权"
            >
              <NEmpty
                v-if="!currentTempAuths.length"
                description="暂无临时授权记录"
              />
              <NTimeline v-else>
                <NTimelineItem
                  v-for="auth in currentTempAuths"
                  :key="auth.id"
                  :type="
                    auth.status === 'active'
                      ? 'success'
                      : auth.status === 'expired'
                        ? 'warning'
                        : 'error'
                  "
                  :title="`${auth.roleName} → ${auth.targetRoleName}`"
                  :time="`${auth.startTime} ~ ${auth.expireTime}`"
                >
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NText>{{ auth.reason }}</NText>
                    <NSpace :size="4">
                      <NTag
                        v-for="pName in auth.permissionNames"
                        :key="pName"
                        size="small"
                        type="primary"
                      >
                        {{ pName }}
                      </NTag>
                    </NSpace>
                    <NTag
                      :type="TEMP_AUTH_STATUS[auth.status].type"
                      size="small"
                    >
                      {{ TEMP_AUTH_STATUS[auth.status].text }}
                    </NTag>
                  </NSpace>
                </NTimelineItem>
              </NTimeline>
            </NTabPane>
          </NTabs>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 添加/编辑角色弹窗 -->
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
      @negative-click="closeRoleModal"
      style="width: 800px"
    >
      <C_Form
        v-if="showModal"
        ref="formRef"
        :model-value="formData"
        @update:model-value="Object.assign(formData, $event)"
        :options="formOptions"
        :config="formConfig"
        @submit="showModal = false"
      />
    </NModal>

    <!-- 权限分配抽屉 -->
    <c_role
      v-model:show="showPermissionDrawer"
      v-model:selectedIds="selectedPermissionIds"
      :role="permissionRole"
      :permissions="permissionList"
      @save="handleSavePermissions"
      @showTemplate="showPermissionTemplate = true"
    />

    <!-- 权限模板弹窗 -->
    <NModal
      v-model:show="showPermissionTemplate"
      preset="dialog"
      title="选择权限模板"
      positive-text="应用模板"
      negative-text="取消"
      @positive-click="applyPermissionTemplate"
      style="width: 600px"
    >
      <div class="permission-templates">
        <NGrid
          :cols="1"
          :y-gap="12"
        >
          <NGi
            v-for="template in permissionTemplates"
            :key="template.id"
          >
            <NCard
              size="small"
              :class="{ 'template-selected': selectedTemplate === template.id }"
              hoverable
              @click="selectedTemplate = template.id"
            >
              <template #header>
                <NSpace align="center">
                  <NRadio :checked="selectedTemplate === template.id" />
                  <C_Icon
                    :name="template.icon"
                    :size="18"
                  />
                  <NText strong>{{ template.name }}</NText>
                  <NTag
                    size="small"
                    type="info"
                    >{{ template.permissions.length }} 项权限</NTag
                  >
                </NSpace>
              </template>

              <NText depth="3">{{ template.description }}</NText>

              <template #footer>
                <NSpace size="small">
                  <NTag
                    v-for="perm in template.permissions.slice(0, 3)"
                    :key="perm"
                    size="small"
                    type="primary"
                  >
                    {{ getPermissionNameById(perm) }}
                  </NTag>
                  <NTag
                    v-if="template.permissions.length > 3"
                    size="small"
                    type="default"
                  >
                    +{{ template.permissions.length - 3 }}
                  </NTag>
                </NSpace>
              </template>
            </NCard>
          </NGi>
        </NGrid>
      </div>
    </NModal>

    <!-- 角色用户列表弹窗 -->
    <NModal
      v-model:show="showRoleUsers"
      preset="dialog"
      :title="`${currentRole?.name} - 用户列表`"
      positive-text="关闭"
      @positive-click="showRoleUsers = false"
      style="width: 800px"
    >
      <C_Table
        :columns="roleUserColumns"
        :data="roleUserList"
        :loading="roleUsersLoading"
        :config="{
          toolbar: { show: false },
          pagination: {
            showSizePicker: false,
            showQuickJumper: false,
            pageSize: 10,
          },
          display: { size: 'small', striped: true },
        }"
      />
    </NModal>

    <!-- 角色权限对比弹窗 -->
    <NModal
      v-model:show="showCompareModal"
      preset="dialog"
      title="角色权限对比"
      style="width: 900px"
    >
      <NSpace
        vertical
        :size="16"
      >
        <!-- 选择器 -->
        <NGrid
          :cols="5"
          :x-gap="12"
        >
          <NGi :span="2">
            <NSelect
              v-model:value="compareRoleA"
              placeholder="选择角色 A"
              :options="roleOptions"
              filterable
            />
          </NGi>
          <NGi>
            <div style="text-align: center; line-height: 34px">
              <C_Icon
                name="mdi:compare-horizontal"
                :size="24"
              />
            </div>
          </NGi>
          <NGi :span="2">
            <NSelect
              v-model:value="compareRoleB"
              placeholder="选择角色 B"
              :options="roleOptions"
              filterable
            />
          </NGi>
        </NGrid>

        <NButton
          type="primary"
          block
          @click="handleCompareRoles"
        >
          开始对比
        </NButton>

        <!-- 对比结果 -->
        <template v-if="compareResult">
          <NGrid
            :cols="3"
            :x-gap="12"
          >
            <NGi>
              <NCard
                title="共有权限"
                size="small"
              >
                <template #header-extra>
                  <NTag
                    type="success"
                    size="small"
                  >
                    {{ compareResult.shared.length }}
                  </NTag>
                </template>
                <NSpace
                  :size="4"
                  wrap
                >
                  <NTag
                    v-for="id in compareResult.shared"
                    :key="id"
                    size="small"
                    type="success"
                  >
                    {{ getPermissionNameById(id) || id }}
                  </NTag>
                </NSpace>
                <NEmpty
                  v-if="!compareResult.shared.length"
                  description="无"
                  :show-icon="false"
                />
              </NCard>
            </NGi>
            <NGi>
              <NCard
                :title="`仅角色 A`"
                size="small"
              >
                <template #header-extra>
                  <NTag
                    type="warning"
                    size="small"
                  >
                    {{ compareResult.onlyA.length }}
                  </NTag>
                </template>
                <NSpace
                  :size="4"
                  wrap
                >
                  <NTag
                    v-for="id in compareResult.onlyA"
                    :key="id"
                    size="small"
                    type="warning"
                  >
                    {{ getPermissionNameById(id) || id }}
                  </NTag>
                </NSpace>
                <NEmpty
                  v-if="!compareResult.onlyA.length"
                  description="无"
                  :show-icon="false"
                />
              </NCard>
            </NGi>
            <NGi>
              <NCard
                :title="`仅角色 B`"
                size="small"
              >
                <template #header-extra>
                  <NTag
                    type="info"
                    size="small"
                  >
                    {{ compareResult.onlyB.length }}
                  </NTag>
                </template>
                <NSpace
                  :size="4"
                  wrap
                >
                  <NTag
                    v-for="id in compareResult.onlyB"
                    :key="id"
                    size="small"
                    type="info"
                  >
                    {{ getPermissionNameById(id) || id }}
                  </NTag>
                </NSpace>
                <NEmpty
                  v-if="!compareResult.onlyB.length"
                  description="无"
                  :show-icon="false"
                />
              </NCard>
            </NGi>
          </NGrid>
        </template>
      </NSpace>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
  import '@robot-admin/naive-ui-components/C_Icon/style.css'
  import { UI_CONFIG, ICONS, DATA_SCOPE_CONFIG, TEMP_AUTH_STATUS } from './data'
  import { useRoleManagement } from './useRoleManagement'

  defineOptions({ name: 'RoleManage' })
  const {
    loading,
    roleUsersLoading,
    showModal,
    showRoleDetail,
    showPermissionDrawer,
    showPermissionTemplate,
    showRoleUsers,
    modalMode,
    formRef,
    tableRef,
    selectedPermissionIds,
    selectedTemplate,
    currentRole,
    permissionRole,
    roleList,
    permissionList,
    permissionTemplates,
    roleUserList,
    currentDataScopes,
    currentTempAuths,
    formData,
    searchForm,
    detailTab,
    showCompareModal,
    compareRoleA,
    compareRoleB,
    compareResult,
    groupedPreview,
    roleOptions,
    pagination,
    modalTitle,
    roleDetailFields,
    formOptions,
    formConfig,
    rowKey,
    tableActions,
    roleUserColumns,
    toolbarActions,
    getPermissionNameById,
    handleTableSave,
    handleSearch,
    handlePaginationChange,
    closeRoleModal,
    handleCompareRoles,
    handleSavePermissions,
    applyPermissionTemplate,
    tableColumns,
  } = useRoleManagement()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
