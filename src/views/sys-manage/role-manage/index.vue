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
            v-model:value="view.ledger.searchModel.keyword"
            placeholder="搜索角色名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="view.ledger.search"
          >
            <template #prefix>
              <C_Icon
                :name="ICONS.search"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="view.ledger.searchModel.type"
            placeholder="角色类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleType"
            @update:value="view.ledger.search"
          />

          <NSelect
            v-model:value="view.ledger.searchModel.status"
            placeholder="角色状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleStatus"
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
                共 {{ view.ledger.pagination.itemCount }} 个
              </NTag>
            </NText>
          </NSpace>
        </template>

        <!-- 使用 C_Table 组件 -->
        <C_Table
          ref="tableRef"
          :columns="view.ledger.columns"
          :data="view.ledger.rows"
          :loading="view.ledger.loading"
          :row-key="view.ledger.rowKey"
          :config="{
            actions: view.ledger.actions,
            edit: {
              modalTitle: '编辑角色',
              modalWidth: 800,
              onSave: view.ledger.saveRow,
            },
            pagination: {
              page: view.ledger.pagination.page,
              pageSize: view.ledger.pagination.pageSize,
              total: view.ledger.pagination.itemCount,
              remote: true,
            },
          }"
          @pagination-change="view.ledger.changePage"
        />
      </NCard>
    </div>

    <!-- 角色详情抽屉（增强版 4 标签） -->
    <NDrawer
      v-model:show="view.inspection.visible"
      :width="720"
      placement="right"
    >
      <NDrawerContent
        title="角色详情"
        closable
      >
        <div
          class="role-detail"
          v-if="view.inspection.role"
        >
          <NTabs
            v-model:value="view.inspection.tab"
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
                      v-for="field in view.inspection.fields"
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
                  v-if="view.inspection.role.permissionNames?.length"
                >
                  <NSpace>
                    <NTag
                      v-for="permission in view.inspection.role.permissionNames"
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
                      {{ view.inspection.preview.menus.length }} 项
                    </NTag>
                  </template>
                  <NEmpty
                    v-if="!view.inspection.preview.menus.length"
                    description="暂无菜单权限"
                  />
                  <div
                    v-else
                    class="preview-grid"
                  >
                    <div
                      v-for="item in view.inspection.preview.menus"
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
                      {{ view.inspection.preview.buttons.length }} 项
                    </NTag>
                  </template>
                  <NEmpty
                    v-if="!view.inspection.preview.buttons.length"
                    description="暂无按钮权限"
                  />
                  <NSpace
                    v-else
                    :size="8"
                    wrap
                  >
                    <NTag
                      v-for="item in view.inspection.preview.buttons"
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
                  v-if="view.inspection.preview.apis.length"
                  title="API 权限"
                  size="small"
                >
                  <template #header-extra>
                    <NTag
                      size="small"
                      type="warning"
                    >
                      {{ view.inspection.preview.apis.length }} 项
                    </NTag>
                  </template>
                  <NSpace
                    :size="8"
                    wrap
                  >
                    <NTag
                      v-for="item in view.inspection.preview.apis"
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
                v-if="!view.inspection.dataScopes.length"
                description="暂无数据权限配置"
              />
              <NSpace
                v-else
                vertical
                :size="12"
              >
                <NCard
                  v-for="scope in view.inspection.dataScopes"
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
                v-if="!view.inspection.temporaryGrants.length"
                description="暂无临时授权记录"
              />
              <NTimeline v-else>
                <NTimelineItem
                  v-for="auth in view.inspection.temporaryGrants"
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
                      :type="TEMP_AUTH_STATUS_CONFIG[auth.status].type"
                      size="small"
                    >
                      {{ TEMP_AUTH_STATUS_CONFIG[auth.status].text }}
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
      @negative-click="view.editor.close"
      style="width: 800px"
    >
      <C_Form
        v-if="view.editor.visible"
        ref="formRef"
        :model-value="view.editor.model"
        @update:model-value="Object.assign(view.editor.model, $event)"
        :options="view.editor.options"
        :config="view.editor.config"
        @submit="view.editor.visible = false"
      />
    </NModal>

    <!-- 权限分配抽屉 -->
    <c_role
      v-model:show="view.grants.visible"
      v-model:selectedIds="view.grants.selected"
      :role="view.grants.role"
      :permissions="view.grants.available"
      @save="view.grants.save"
      @showTemplate="view.grants.showTemplates = true"
    />

    <!-- 权限模板弹窗 -->
    <NModal
      v-model:show="view.grants.showTemplates"
      preset="dialog"
      title="选择权限模板"
      positive-text="应用模板"
      negative-text="取消"
      @positive-click="view.grants.applyTemplate"
      style="width: 600px"
    >
      <div class="permission-templates">
        <NGrid
          :cols="1"
          :y-gap="12"
        >
          <NGi
            v-for="template in view.grants.templates"
            :key="template.id"
          >
            <NCard
              size="small"
              :class="{
                'template-selected': view.grants.template === template.id,
              }"
              hoverable
              @click="view.grants.template = template.id"
            >
              <template #header>
                <NSpace align="center">
                  <NRadio :checked="view.grants.template === template.id" />
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
                    {{ view.grants.getPermissionName(perm) }}
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
      v-model:show="view.members.visible"
      preset="dialog"
      :title="`${view.members.role?.name} - 用户列表`"
      positive-text="关闭"
      @positive-click="view.members.visible = false"
      style="width: 800px"
    >
      <C_Table
        :columns="view.members.columns"
        :data="view.members.rows"
        :loading="view.members.loading"
        :config="{
          toolbar: { show: false },
          pagination: false,
          display: { size: 'small', striped: true },
        }"
      />
      <NPagination
        :page="view.members.page"
        :item-count="view.members.total"
        :page-size="view.members.pageSize"
        @update:page="view.members.loadPage"
      />
    </NModal>

    <!-- 角色权限对比弹窗 -->
    <NModal
      v-model:show="view.comparison.visible"
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
              v-model:value="view.comparison.roleA"
              placeholder="选择角色 A"
              :options="view.comparison.options"
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
              v-model:value="view.comparison.roleB"
              placeholder="选择角色 B"
              :options="view.comparison.options"
              filterable
            />
          </NGi>
        </NGrid>

        <NButton
          type="primary"
          block
          @click="view.comparison.compare"
        >
          开始对比
        </NButton>

        <!-- 对比结果 -->
        <template v-if="view.comparison.result">
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
                    {{ view.comparison.result.shared.length }}
                  </NTag>
                </template>
                <NSpace
                  :size="4"
                  wrap
                >
                  <NTag
                    v-for="id in view.comparison.result.shared"
                    :key="id"
                    size="small"
                    type="success"
                  >
                    {{ view.grants.getPermissionName(id) || id }}
                  </NTag>
                </NSpace>
                <NEmpty
                  v-if="!view.comparison.result.shared.length"
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
                    {{ view.comparison.result.onlyA.length }}
                  </NTag>
                </template>
                <NSpace
                  :size="4"
                  wrap
                >
                  <NTag
                    v-for="id in view.comparison.result.onlyA"
                    :key="id"
                    size="small"
                    type="warning"
                  >
                    {{ view.grants.getPermissionName(id) || id }}
                  </NTag>
                </NSpace>
                <NEmpty
                  v-if="!view.comparison.result.onlyA.length"
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
                    {{ view.comparison.result.onlyB.length }}
                  </NTag>
                </template>
                <NSpace
                  :size="4"
                  wrap
                >
                  <NTag
                    v-for="id in view.comparison.result.onlyB"
                    :key="id"
                    size="small"
                    type="info"
                  >
                    {{ view.grants.getPermissionName(id) || id }}
                  </NTag>
                </NSpace>
                <NEmpty
                  v-if="!view.comparison.result.onlyB.length"
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
  import { UI_CONFIG, ICONS } from './data'
  import {
    DATA_SCOPE_CONFIG,
    TEMP_AUTH_STATUS_CONFIG,
  } from '../shared/d_permissionPolicy'
  import { useRoleManagement } from './useRoleManagement'

  defineOptions({ name: 'RoleManage' })
  const controller = useRoleManagement()
  const view = proxyRefs(controller)
  const { tableRef, formRef } = controller
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
