<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: user-manage 页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="user-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace>
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索用户名、昵称、邮箱"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                :name="COMPONENT_CONFIG.icons.search"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="searchForm.userType"
            placeholder="用户类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.userType"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.status"
            placeholder="用户状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.userStatus"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.roleId"
            placeholder="用户角色"
            clearable
            style="width: 120px"
            :options="userRoleOptions"
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
      <NGrid
        :cols="24"
        :x-gap="16"
        responsive="screen"
      >
        <!-- 左侧部门树 -->
        <NGi
          :span="6"
          :md="8"
          :sm="24"
        >
          <NCard
            title="组织架构"
            class="content-card"
          >
            <C_Tree
              ref="deptTreeRef"
              mode="custom"
              :data="deptList"
              :searchable="false"
              :show-toolbar="false"
              :icon-config="deptIconConfig"
              :default-expanded-keys="expandedDeptKeys"
              :default-selected-keys="selectedDeptKeys"
              @node-select="handleDeptSelect"
              class="dept-tree"
            />
          </NCard>
        </NGi>

        <!-- 右侧用户列表 -->
        <NGi
          :span="18"
          :md="16"
          :sm="24"
        >
          <NCard class="content-card">
            <template #header>
              <NSpace
                justify="space-between"
                align="center"
              >
                <NText>
                  {{
                    selectedDept
                      ? `${selectedDept.name} - 用户列表`
                      : '用户列表'
                  }}
                  <NTag
                    type="info"
                    size="small"
                    style="margin-left: 8px"
                  >
                    共 {{ pagination.itemCount }} 人
                  </NTag>
                </NText>
                <C_ActionBar
                  v-if="selectedUsers.length > 0"
                  :actions="batchActions"
                  :config="{ compact: true, size: 'small' }"
                />
              </NSpace>
            </template>

            <!-- 用户表格 -->
            <C_Table
              :columns="userColumns"
              :data="userList"
              :loading="loading"
              :row-key="rowKey"
              :row-class-name="getRowClassName"
              :config="{
                actions: tableActions,
                selection: {
                  enabled: true,
                  defaultCheckedKeys: selectedUsers,
                },
                pagination: {
                  page: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.itemCount,
                  remote: true,
                },
                display: { scrollX: 1500 },
              }"
              @pagination-change="handlePaginationChange"
              @selection-change="handleSelectionChange"
            />
          </NCard>
        </NGi>
      </NGrid>
    </div>

    <!-- 用户详情抽屉 -->
    <NDrawer
      v-model:show="showUserDetail"
      :width="600"
      placement="right"
    >
      <NDrawerContent
        title="用户详情"
        closable
      >
        <div
          class="user-detail"
          v-if="currentUser"
        >
          <NSpace
            vertical
            :size="24"
          >
            <!-- 基本信息 -->
            <NCard
              title="基本信息"
              size="small"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NSpace
                vertical
                :size="16"
              >
                <NSpace
                  align="center"
                  justify="center"
                  style="position: relative"
                >
                  <NAvatar
                    :size="80"
                    :src="currentUser.avatar"
                    :fallback-src="COMPONENT_CONFIG.defaultAvatar"
                    :class="{ 'disabled-avatar': currentUser.status === 0 }"
                  >
                    {{ currentUser.nickname?.charAt(0) }}
                  </NAvatar>
                  <div
                    v-if="currentUser.status === 0"
                    class="disabled-overlay"
                  >
                    <C_Icon
                      :name="COMPONENT_CONFIG.icons.cancel"
                      :size="24"
                      color="#ff4d4f"
                    />
                  </div>
                </NSpace>

                <NGrid
                  :cols="2"
                  :x-gap="16"
                  :y-gap="12"
                >
                  <NGi
                    v-for="field in getUserDetailFields(currentUser)"
                    :key="field.key"
                  >
                    <NSpace align="center">
                      <NText depth="3">{{ field.label }}：</NText>
                      <component
                        :is="field.component"
                        v-bind="field.props"
                      >
                        {{ field.value }}
                      </component>
                    </NSpace>
                  </NGi>
                </NGrid>
              </NSpace>
            </NCard>

            <!-- 角色信息 -->
            <NCard
              title="角色信息"
              size="small"
              v-if="currentUser.roleNames?.length"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NSpace>
                <NTag
                  v-for="role in currentUser.roleNames"
                  :key="role"
                  type="success"
                  size="medium"
                  :class="{ 'disabled-tag': currentUser.status === 0 }"
                >
                  <template #icon>
                    <C_Icon
                      :name="COMPONENT_CONFIG.icons.role"
                      :size="12"
                    />
                  </template>
                  {{ role }}
                </NTag>
              </NSpace>
            </NCard>

            <NCard
              v-if="mockMode"
              title="企业归属"
              size="small"
            >
              <NSpace
                vertical
                :size="10"
              >
                <div
                  v-for="membership in getUserMemberships(currentUser.username)"
                  :key="membership.contextId"
                  class="membership-summary"
                >
                  <NTag
                    :type="membership.isPrimary ? 'info' : 'default'"
                    size="small"
                  >
                    {{ membership.isPrimary ? '主公司' : '兼任' }}
                  </NTag>
                  <strong>{{ getCompanyName(membership.contextId) }}</strong>
                  <NText depth="3">{{
                    getCompanyRoleName(membership.roleId)
                  }}</NText>
                </div>
              </NSpace>
            </NCard>

            <!-- 时间信息 -->
            <NCard
              title="时间信息"
              size="small"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NGrid
                :cols="1"
                :y-gap="12"
              >
                <NGi
                  v-for="timeField in getTimeFields(currentUser)"
                  :key="timeField.key"
                >
                  <NSpace align="center">
                    <NText depth="3">{{ timeField.label }}：</NText>
                    <NText
                      :class="{ 'disabled-text': currentUser.status === 0 }"
                    >
                      {{ timeField.value }}
                    </NText>
                  </NSpace>
                </NGi>
              </NGrid>
            </NCard>

            <!-- 备注信息 -->
            <NCard
              v-if="currentUser.remark"
              title="备注信息"
              size="small"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NText :class="{ 'disabled-text': currentUser.status === 0 }">
                {{ currentUser.remark }}
              </NText>
            </NCard>

            <!-- 操作按钮 -->
            <C_ActionBar
              :actions="[
                {
                  key: 'close',
                  label: '关闭',
                  type: 'primary',
                  onClick: () => {
                    showUserDetail = false
                  },
                },
              ]"
              :config="{ align: 'center' }"
            />
          </NSpace>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 添加/编辑用户弹窗 -->
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
      @negative-click="handleCancelModal"
      style="width: 800px"
    >
      <C_Form
        v-if="showModal"
        ref="formRef"
        :model-value="formData"
        @update:model-value="updateUserForm"
        :options="formOptions"
        :config="formConfig"
        :renderers="formRenderers"
        @submit="showModal = false"
      />
      <NCard
        v-if="mockMode"
        title="企业归属与公司内角色"
        size="small"
        class="membership-editor"
      >
        <p
          >登录默认进入主公司；兼任公司可在登录后切换。每个账号必须且只能有一个主公司。</p
        >
        <div
          v-for="(membership, index) in formData.memberships"
          :key="index"
          class="membership-editor__row"
        >
          <NSelect
            :disabled="!!formRef?.isSubmitting"
            :value="membership.contextId"
            :options="getCompanyOptions(membership.contextId)"
            placeholder="选择公司"
            @update:value="membership.contextId = $event"
          />
          <NSelect
            :disabled="!!formRef?.isSubmitting"
            :value="membership.roleId"
            :options="companyRoleOptions"
            placeholder="公司内角色"
            @update:value="membership.roleId = $event"
          />
          <NButton
            size="small"
            :type="membership.isPrimary ? 'primary' : 'default'"
            :disabled="!!formRef?.isSubmitting"
            @click="setPrimaryMembership(index)"
          >
            {{ membership.isPrimary ? '主公司' : '设为主公司' }}
          </NButton>
          <NButton
            size="small"
            quaternary
            :disabled="
              formData.memberships.length === 1 || !!formRef?.isSubmitting
            "
            @click="removeCompanyMembership(index)"
            >移除</NButton
          >
        </div>
        <NButton
          dashed
          block
          :disabled="
            formData.memberships.length >= companyOptions.length ||
            !!formRef?.isSubmitting
          "
          @click="addCompanyMembership"
          >+ 添加兼任公司</NButton
        >
      </NCard>
    </NModal>

    <!-- 重置密码弹窗 -->
    <NModal
      v-model:show="showResetPasswordModal"
      preset="dialog"
      title="重置密码"
      positive-text="确认重置"
      negative-text="取消"
      @positive-click="() => resetPasswordFormRef?.submit() ?? false"
      :closable="!resetPasswordFormRef?.isSubmitting"
      :mask-closable="!resetPasswordFormRef?.isSubmitting"
      :close-on-esc="!resetPasswordFormRef?.isSubmitting"
      :negative-button-props="{
        disabled: !!resetPasswordFormRef?.isSubmitting,
      }"
    >
      <C_Form
        v-if="showResetPasswordModal"
        ref="resetPasswordFormRef"
        :model-value="resetPasswordForm"
        @update:model-value="Object.assign(resetPasswordForm, $event)"
        :options="resetPasswordOptions"
        :config="resetPasswordConfig"
        @submit="showResetPasswordModal = false"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
  import '@robot-admin/naive-ui-components/C_Icon/style.css'
  import { C_Tree } from '@robot-admin/naive-ui-components/C_Tree'
  import '@robot-admin/naive-ui-components/C_Tree/style.css'
  import { UI_CONFIG, COMPONENT_CONFIG } from './data'
  import { useUserManagement } from './useUserManagement'

  defineOptions({ name: 'UserManage' })
  const {
    mockMode,
    companyOptions,
    companyRoleOptions,
    getCompanyName,
    getCompanyRoleName,
    getUserMemberships,
    getCompanyOptions,
    setPrimaryMembership,
    removeCompanyMembership,
    addCompanyMembership,
    loading,
    showModal,
    showUserDetail,
    showResetPasswordModal,
    modalMode,
    formRef,
    resetPasswordFormRef,
    deptTreeRef,
    expandedDeptKeys,
    selectedDeptKeys,
    selectedUsers,
    currentUser,
    userList,
    deptList,
    userRoleOptions,
    formData,
    resetPasswordForm,
    searchForm,
    pagination,
    modalTitle,
    toolbarActions,
    batchActions,
    selectedDept,
    deptIconConfig,
    getRowClassName,
    rowKey,
    tableActions,
    getUserDetailFields,
    getTimeFields,
    formOptions,
    formRenderers,
    formConfig,
    resetPasswordOptions,
    resetPasswordConfig,
    updateUserForm,
    handleDeptSelect,
    handleSearch,
    handlePaginationChange,
    handleSelectionChange,
    handleCancelModal,
    userColumns,
  } = useUserManagement()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
