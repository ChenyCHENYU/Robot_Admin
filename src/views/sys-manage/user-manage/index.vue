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
            v-model:value="view.ledger.searchModel.keyword"
            placeholder="搜索用户名、昵称、邮箱"
            clearable
            style="width: 300px"
            @keyup.enter="view.ledger.search"
          >
            <template #prefix>
              <C_Icon
                :name="COMPONENT_CONFIG.icons.search"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="view.ledger.searchModel.userType"
            placeholder="用户类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.userType"
            @update:value="view.ledger.search"
          />

          <NSelect
            v-model:value="view.ledger.searchModel.status"
            placeholder="用户状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.userStatus"
            @update:value="view.ledger.search"
          />

          <NSelect
            v-model:value="view.ledger.searchModel.roleId"
            placeholder="用户角色"
            clearable
            style="width: 120px"
            :options="view.userRoleOptions"
            @update:value="view.ledger.search"
          />
        </NSpace>

        <C_ActionBar
          :actions="view.ledger.toolbar"
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
              :data="view.departments.rows"
              :searchable="false"
              :show-toolbar="false"
              :icon-config="view.departments.iconConfig"
              :default-expanded-keys="view.departments.expanded"
              :default-selected-keys="view.departments.selected"
              @node-select="view.departments.select"
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
                    view.departments.current
                      ? `${view.departments.current.name} - 用户列表`
                      : '用户列表'
                  }}
                  <NTag
                    type="info"
                    size="small"
                    style="margin-left: 8px"
                  >
                    共 {{ view.ledger.pagination.itemCount }} 人
                  </NTag>
                </NText>
                <C_ActionBar
                  v-if="view.ledger.selected.length > 0"
                  :actions="view.ledger.batchActions"
                  :config="{ compact: true, size: 'small' }"
                />
              </NSpace>
            </template>

            <!-- 用户表格 -->
            <C_Table
              ref="userTableRef"
              :columns="view.ledger.columns"
              :data="view.ledger.rows"
              :loading="view.ledger.loading"
              :row-key="view.ledger.rowKey"
              :row-class-name="view.ledger.rowClass"
              :config="{
                actions: view.ledger.actions,
                selection: {
                  enabled: true,
                },
                pagination: {
                  page: view.ledger.pagination.page,
                  pageSize: view.ledger.pagination.pageSize,
                  total: view.ledger.pagination.itemCount,
                  remote: true,
                },
                display: { scrollX: 1500 },
              }"
              @pagination-change="view.ledger.changePage"
              @selection-change="view.ledger.changeSelection"
            />
          </NCard>
        </NGi>
      </NGrid>
    </div>

    <!-- 用户详情抽屉 -->
    <NDrawer
      v-model:show="view.inspection.visible"
      :width="600"
      placement="right"
    >
      <NDrawerContent
        title="用户详情"
        closable
      >
        <div
          class="user-detail"
          v-if="view.inspection.user"
        >
          <NSpace
            vertical
            :size="24"
          >
            <!-- 基本信息 -->
            <NCard
              title="基本信息"
              size="small"
              :class="{ 'disabled-card': view.inspection.user.status === 0 }"
            >
              <NSpace
                vertical
                :size="16"
              >
                <NAlert
                  v-if="view.inspection.user.accountStatus === 0"
                  type="warning"
                  >全局账号已停用；启用本公司成员不会恢复账号访问。</NAlert
                >
                <NSpace
                  align="center"
                  justify="center"
                  style="position: relative"
                >
                  <NAvatar
                    :size="80"
                    :src="view.inspection.user.avatar"
                    :fallback-src="COMPONENT_CONFIG.defaultAvatar"
                    :class="{
                      'disabled-avatar': view.inspection.user.status === 0,
                    }"
                  >
                    {{ view.inspection.user.nickname?.charAt(0) }}
                  </NAvatar>
                  <div
                    v-if="view.inspection.user.status === 0"
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
                    v-for="field in view.inspection.fields(
                      view.inspection.user
                    )"
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
              v-if="view.inspection.user.roleNames?.length"
              :class="{ 'disabled-card': view.inspection.user.status === 0 }"
            >
              <NSpace>
                <NTag
                  v-for="role in view.inspection.user.roleNames"
                  :key="role"
                  type="success"
                  size="medium"
                  :class="{ 'disabled-tag': view.inspection.user.status === 0 }"
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
              v-if="view.mockMode"
              title="企业归属"
              size="small"
            >
              <NSpace
                vertical
                :size="10"
              >
                <div
                  v-for="membership in view.membership.getUserMemberships(
                    view.inspection.user.username
                  )"
                  :key="membership.contextId"
                  class="membership-summary"
                >
                  <NTag
                    :type="membership.isPrimary ? 'info' : 'default'"
                    size="small"
                  >
                    {{ membership.isPrimary ? '主公司' : '兼任' }}
                  </NTag>
                  <strong>{{
                    view.membership.getCompanyName(membership.contextId)
                  }}</strong>
                  <NText depth="3">{{
                    view.membership.getCompanyRoleName(membership.roleId)
                  }}</NText>
                </div>
              </NSpace>
            </NCard>

            <!-- 时间信息 -->
            <NCard
              title="时间信息"
              size="small"
              :class="{ 'disabled-card': view.inspection.user.status === 0 }"
            >
              <NGrid
                :cols="1"
                :y-gap="12"
              >
                <NGi
                  v-for="timeField in view.inspection.getTimeFields(
                    view.inspection.user
                  )"
                  :key="timeField.key"
                >
                  <NSpace align="center">
                    <NText depth="3">{{ timeField.label }}：</NText>
                    <NText
                      :class="{
                        'disabled-text': view.inspection.user.status === 0,
                      }"
                    >
                      {{ timeField.value }}
                    </NText>
                  </NSpace>
                </NGi>
              </NGrid>
            </NCard>

            <!-- 备注信息 -->
            <NCard
              v-if="view.inspection.user.remark"
              title="备注信息"
              size="small"
              :class="{ 'disabled-card': view.inspection.user.status === 0 }"
            >
              <NText
                :class="{ 'disabled-text': view.inspection.user.status === 0 }"
              >
                {{ view.inspection.user.remark }}
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
                    view.inspection.visible = false
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
      v-model:show="view.editor.visible"
      preset="dialog"
      :title="view.editor.title"
      :positive-text="view.editor.mode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="() => view.formRef?.submit() ?? false"
      :closable="!view.formRef?.isSubmitting"
      :mask-closable="!view.formRef?.isSubmitting"
      :close-on-esc="!view.formRef?.isSubmitting"
      :negative-button-props="{ disabled: !!view.formRef?.isSubmitting }"
      @negative-click="view.editor.cancel"
      style="width: 800px"
    >
      <C_Form
        v-if="view.editor.visible"
        ref="formRef"
        :model-value="view.editor.model"
        @update:model-value="view.editor.update"
        :options="view.editor.options"
        :config="view.editor.config"
        :renderers="view.editor.renderers"
        @submit="view.editor.visible = false"
      />
      <NCard
        v-if="view.mockMode"
        title="企业归属与公司内角色"
        size="small"
        class="membership-editor"
      >
        <p
          >登录默认进入主公司；兼任公司可在登录后切换。每个账号必须且只能有一个主公司。</p
        >
        <div
          v-for="(membership, index) in view.editor.model.memberships"
          :key="index"
          class="membership-editor__row"
        >
          <NSelect
            :disabled="!!view.formRef?.isSubmitting"
            :value="membership.contextId"
            :options="view.membership.getCompanyOptions(membership.contextId)"
            placeholder="选择公司"
            @update:value="membership.contextId = $event"
          />
          <NSelect
            :disabled="!!view.formRef?.isSubmitting"
            :value="membership.roleId"
            :options="view.membership.companyRoleOptions"
            placeholder="公司内角色"
            @update:value="membership.roleId = $event"
          />
          <NButton
            size="small"
            :type="membership.isPrimary ? 'primary' : 'default'"
            :disabled="!!view.formRef?.isSubmitting"
            @click="view.membership.setPrimaryMembership(index)"
          >
            {{ membership.isPrimary ? '主公司' : '设为主公司' }}
          </NButton>
          <NButton
            size="small"
            quaternary
            :disabled="
              view.editor.model.memberships.length === 1 ||
              !!view.formRef?.isSubmitting
            "
            @click="view.membership.removeCompanyMembership(index)"
            >移除</NButton
          >
        </div>
        <NButton
          dashed
          block
          :disabled="
            view.editor.model.memberships.length >=
              view.membership.companyOptions.length ||
            !!view.formRef?.isSubmitting
          "
          @click="view.membership.addCompanyMembership"
          >+ 添加兼任公司</NButton
        >
      </NCard>
    </NModal>

    <!-- 重置密码弹窗 -->
    <NModal
      v-model:show="view.passwordReset.visible"
      preset="dialog"
      title="重置密码"
      positive-text="确认重置"
      negative-text="取消"
      @positive-click="() => view.resetPasswordFormRef?.submit() ?? false"
      :closable="!view.resetPasswordFormRef?.isSubmitting"
      :mask-closable="!view.resetPasswordFormRef?.isSubmitting"
      :close-on-esc="!view.resetPasswordFormRef?.isSubmitting"
      :negative-button-props="{
        disabled: !!view.resetPasswordFormRef?.isSubmitting,
      }"
    >
      <C_Form
        v-if="view.passwordReset.visible"
        ref="resetPasswordFormRef"
        :model-value="view.passwordReset.model"
        @update:model-value="Object.assign(view.passwordReset.model, $event)"
        :options="view.passwordReset.options"
        :config="view.passwordReset.config"
        @submit="view.passwordReset.visible = false"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { UI_CONFIG, COMPONENT_CONFIG } from './data'
  import { useUserManagement } from './useUserManagement'

  defineOptions({ name: 'UserManage' })
  const controller = useUserManagement()
  const view = proxyRefs(controller)
  const { deptTreeRef, userTableRef, formRef, resetPasswordFormRef } =
    controller
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
