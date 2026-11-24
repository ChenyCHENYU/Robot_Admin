<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 16:34:17
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 18:21:35
 * @FilePath: \Robot_Admin\src\views\demo\27-permission-direct\index.vue
 * @Description: 权限指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="permission-demo-page">
    <c_vTitle
      title="v-permission 权限指令场景示例"
      icon="mdi:shield-check-outline"
      description="通过 v-permission 指令按权限控制元素显隐，支持 AND / OR 两种权限模式"
    />

    <NGrid
      :cols="2"
      :x-gap="24"
      :y-gap="16"
    >
      <!-- 左侧演示区 -->
      <NGridItem>
        <NSpace
          vertical
          size="large"
        >
          <!-- 用户角色切换 -->
          <NCard
            title="👤 用户角色切换"
            size="small"
          >
            <NSpace vertical>
              <NRadioGroup
                :value="currentUserId"
                @update:value="switchUser"
              >
                <NSpace vertical>
                  <NRadio
                    v-for="user in USER_PROFILES"
                    :key="user.id"
                    :value="user.id"
                    :label="user.name"
                  >
                    <div class="user-option">
                      <span class="user-name">{{ user.name }}</span>
                      <NTag
                        size="small"
                        type="info"
                        >{{ user.desc }}</NTag
                      >
                    </div>
                  </NRadio>
                </NSpace>
              </NRadioGroup>

              <NDivider />

              <div class="current-permissions">
                <NText strong>当前用户权限:</NText>
                <div class="permission-list">
                  <NTag
                    v-for="(value, key) in currentPermissions"
                    :key="key"
                    :type="value ? 'success' : 'error'"
                    size="small"
                  >
                    {{ key }}: {{ value ? '✓' : '✗' }}
                  </NTag>
                  <NTag
                    v-if="Object.keys(currentPermissions).length === 0"
                    type="warning"
                    size="small"
                  >
                    无权限
                  </NTag>
                </div>
              </div>
            </NSpace>
          </NCard>

          <!-- 基础权限演示 -->
          <NCard
            title="🔐 基础权限演示"
            size="small"
          >
            <NSpace vertical>
              <NText
                depth="3"
                style="margin-bottom: 8px"
              >
                点击按钮体验权限控制，没权限时会给出提示
              </NText>

              <div class="demo-section">
                <div
                  v-for="example in basicExamples"
                  :key="example.operation"
                  class="demo-row"
                >
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: example.permissions,
                        authData: currentPermissions,
                        mode: example.mode,
                        fallback: example.fallback,
                      }"
                      :type="example.type"
                      @click="
                        perform(
                          example.permissions,
                          example.operation,
                          example.mode
                        )
                      "
                    >
                      {{ example.label }}
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">{{ example.hint }}</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span
                      :class="
                        example.allowed ? 'status-granted' : 'status-denied'
                      "
                    >
                      {{ example.allowed ? '✅ 有权限' : '❌ 无权限' }}
                    </span>
                  </div>
                </div>
              </div>
            </NSpace>
          </NCard>

          <!-- 不同降级策略演示 -->
          <NCard
            title="🎯 降级策略演示"
            size="small"
          >
            <NSpace vertical>
              <NText
                depth="3"
                style="margin-bottom: 8px"
              >
                同一个权限，不同的处理方式
              </NText>

              <div class="demo-section">
                <div class="strategy-row">
                  <NText strong>隐藏模式 (fallback: 'hide'):</NText>
                  <NButton
                    v-permission="{
                      permissions: 'admin:secret',
                      authData: currentPermissions,
                      fallback: 'hide',
                    }"
                    type="error"
                  >
                    🔒 隐藏按钮
                  </NButton>
                  <NText
                    depth="3"
                    size="small"
                    >没权限时完全隐藏</NText
                  >
                </div>

                <div class="strategy-row">
                  <NText strong>禁用模式 (fallback: 'disable'):</NText>
                  <NButton
                    v-permission="{
                      permissions: 'admin:secret',
                      authData: currentPermissions,
                      fallback: 'disable',
                    }"
                    type="warning"
                    @click="perform('admin:secret', '管理员操作')"
                  >
                    🚫 禁用按钮
                  </NButton>
                  <NText
                    depth="3"
                    size="small"
                    >没权限时禁用但可见</NText
                  >
                </div>

                <div class="strategy-row">
                  <NText strong>显示模式 (fallback: 'show'):</NText>
                  <NButton
                    v-permission="{
                      permissions: 'admin:secret',
                      authData: currentPermissions,
                      fallback: 'show',
                    }"
                    type="info"
                    @click="perform('admin:secret', '管理员操作')"
                  >
                    👻 半透明按钮
                  </NButton>
                  <NText
                    depth="3"
                    size="small"
                    >没权限时半透明，点击提示</NText
                  >
                </div>
              </div>
            </NSpace>
          </NCard>

          <!-- 高级配置演示 -->
          <NCard
            title="⚡ 高级配置演示"
            size="small"
          >
            <NSpace vertical>
              <div class="demo-section">
                <div
                  v-for="example in advancedExamples"
                  :key="example.operation"
                  class="demo-row"
                >
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: example.permissions,
                        authData: currentPermissions,
                        mode: example.mode,
                        fallback: example.fallback,
                      }"
                      :type="example.type"
                      @click="
                        perform(
                          example.permissions,
                          example.operation,
                          example.mode
                        )
                      "
                    >
                      {{ example.label }}
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">{{ example.hint }}</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span
                      :class="
                        example.allowed ? 'status-granted' : 'status-denied'
                      "
                    >
                      {{ example.allowed ? '✅ 有权限' : '❌ 无权限' }}
                    </span>
                  </div>
                </div>
              </div>
            </NSpace>
          </NCard>

          <!-- 面板权限演示 -->
          <NCard
            title="📋 面板权限演示"
            size="small"
          >
            <NSpace vertical>
              <div
                v-permission="{
                  permissions: 'system:admin',
                  authData: currentPermissions,
                  fallback: 'hide',
                }"
                class="admin-panel"
              >
                <NAlert
                  type="error"
                  title="超级管理员面板"
                >
                  只有超级管理员才能看到此面板内容
                </NAlert>
              </div>

              <div
                v-permission="{
                  permissions: 'user:view',
                  authData: currentPermissions,
                  fallback: 'show',
                }"
                class="user-panel"
              >
                <NAlert
                  type="info"
                  title="用户面板"
                >
                  有用户查看权限才能正常使用此面板
                </NAlert>
              </div>

              <NText
                depth="3"
                size="small"
              >
                上方面板会根据权限动态显示/隐藏
              </NText>
            </NSpace>
          </NCard>
        </NSpace>
      </NGridItem>

      <!-- 右侧代码展示 -->
      <NGridItem>
        <NCard
          title="📝 使用示例"
          size="small"
        >
          <NTabs
            v-model:value="activeTab"
            type="line"
            size="small"
          >
            <NTabPane
              name="basic"
              tab="基础用法"
            >
              <C_Code
                :code="PERMISSION_CODE_EXAMPLES.basic"
                language="html"
              />
            </NTabPane>
            <NTabPane
              name="advanced"
              tab="高级配置"
            >
              <C_Code
                :code="PERMISSION_CODE_EXAMPLES.advanced"
                language="html"
              />
            </NTabPane>
            <NTabPane
              name="scenarios"
              tab="应用场景"
            >
              <C_Code
                :code="PERMISSION_CODE_EXAMPLES.scenarios"
                language="html"
              />
            </NTabPane>
          </NTabs>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo27PermissionDirect' })
  import {
    hasPermission,
    type PermissionMode,
  } from '@robot-admin/directives/permission'
  import {
    ADVANCED_PERMISSIONS,
    BASIC_PERMISSIONS,
    MOCK_PERMISSIONS,
    PERMISSION_CODE_EXAMPLES,
    USER_PROFILES,
    type PermissionExample,
  } from './data'

  const message = useMessage()
  const currentUserId = ref(USER_PROFILES[0].id)
  const activeTab = ref('basic')
  const currentPermissions = computed(
    () => MOCK_PERMISSIONS[currentUserId.value] ?? {}
  )

  const withStatus = (examples: PermissionExample[]) =>
    examples.map(example => ({
      ...example,
      allowed: hasPermission(
        example.permissions,
        currentPermissions.value,
        example.mode
      ),
    }))
  const basicExamples = computed(() => withStatus(BASIC_PERMISSIONS))
  const advancedExamples = computed(() => withStatus(ADVANCED_PERMISSIONS))

  const switchUser = (userId: number) => {
    const user = USER_PROFILES.find(item => item.id === userId)
    if (!user) return
    currentUserId.value = user.id
    message.info('用户已切换: ' + user.name)
  }

  const perform = (
    permissions: string | readonly string[],
    operation: string,
    mode: PermissionMode = 'OR'
  ) => {
    if (hasPermission(permissions, currentPermissions.value, mode)) {
      message.success('执行操作: ' + operation)
      return
    }
    const requirement =
      typeof permissions === 'string'
        ? permissions
        : permissions.join(mode === 'AND' ? ' 且 ' : ' 或 ')
    message.warning('权限不足，执行「' + operation + '」需要 ' + requirement)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
