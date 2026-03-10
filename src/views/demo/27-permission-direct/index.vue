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
                v-model:value="state.currentUserId.value"
                @update:value="handleUserChange"
              >
                <NSpace vertical>
                  <NRadio
                    v-for="user in state.userProfiles"
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
                    v-for="(value, key) in state.currentPermissions.value"
                    :key="key"
                    :type="value ? 'success' : 'error'"
                    size="small"
                  >
                    {{ key }}: {{ value ? '✓' : '✗' }}
                  </NTag>
                  <NTag
                    v-if="
                      Object.keys(state.currentPermissions.value).length === 0
                    "
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
                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: 'user:view',
                        authData: state.currentPermissions.value,
                        fallback: 'hide',
                      }"
                      type="primary"
                      @click="
                        () =>
                          handlers.performSecureOperation(
                            'user:view',
                            '查看用户'
                          )
                      "
                    >
                      👁️ 查看用户
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: user:view</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span :class="getPermissionStatus('user:view')">
                      {{ getPermissionText('user:view') }}
                    </span>
                  </div>
                </div>

                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: 'user:edit',
                        authData: state.currentPermissions.value,
                        fallback: 'show',
                      }"
                      type="success"
                      @click="
                        () =>
                          handlers.performSecureOperation(
                            'user:edit',
                            '编辑用户'
                          )
                      "
                    >
                      ✏️ 编辑用户
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: user:edit (点击体验提示)</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span :class="getPermissionStatus('user:edit')">
                      {{ getPermissionText('user:edit') }}
                    </span>
                  </div>
                </div>

                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: 'user:delete',
                        authData: state.currentPermissions.value,
                        fallback: 'show',
                      }"
                      type="error"
                      @click="
                        () =>
                          handlers.performSecureOperation(
                            'user:delete',
                            '删除用户'
                          )
                      "
                    >
                      🗑️ 删除用户
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: user:delete (点击体验提示)</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span :class="getPermissionStatus('user:delete')">
                      {{ getPermissionText('user:delete') }}
                    </span>
                  </div>
                </div>

                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: 'system:admin',
                        authData: state.currentPermissions.value,
                        fallback: 'hide',
                      }"
                      type="warning"
                      @click="
                        () =>
                          handlers.performSecureOperation(
                            'system:admin',
                            '系统管理'
                          )
                      "
                    >
                      ⚙️ 系统管理
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: system:admin (隐藏模式)</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span :class="getPermissionStatus('system:admin')">
                      {{ getPermissionText('system:admin') }}
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
                      authData: state.currentPermissions.value,
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
                      authData: state.currentPermissions.value,
                      fallback: 'disable',
                    }"
                    type="warning"
                    @click="
                      () =>
                        handlers.performSecureOperation(
                          'admin:secret',
                          '管理员操作'
                        )
                    "
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
                      authData: state.currentPermissions.value,
                      fallback: 'show',
                    }"
                    type="info"
                    @click="
                      () =>
                        handlers.performSecureOperation(
                          'admin:secret',
                          '管理员操作'
                        )
                    "
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
                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: ['user:edit', 'user:delete'],
                        authData: state.currentPermissions.value,
                        mode: 'OR',
                        fallback: 'show',
                      }"
                      type="primary"
                      @click="
                        () =>
                          handlers.performMultiSecureOperation(
                            ['user:edit', 'user:delete'],
                            '编辑或删除',
                            'OR'
                          )
                      "
                    >
                      📝 编辑或删除 (OR模式)
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: user:edit 或 user:delete</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span
                      :class="
                        getMultiPermissionStatus(
                          ['user:edit', 'user:delete'],
                          'OR'
                        )
                      "
                    >
                      {{
                        getMultiPermissionText(
                          ['user:edit', 'user:delete'],
                          'OR'
                        )
                      }}
                    </span>
                  </div>
                </div>

                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: ['user:edit', 'user:delete'],
                        authData: state.currentPermissions.value,
                        mode: 'AND',
                        fallback: 'show',
                      }"
                      type="warning"
                      @click="
                        () =>
                          handlers.performMultiSecureOperation(
                            ['user:edit', 'user:delete'],
                            '编辑且删除',
                            'AND'
                          )
                      "
                    >
                      🔒 编辑且删除 (AND模式)
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: user:edit 且 user:delete</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span
                      :class="
                        getMultiPermissionStatus(
                          ['user:edit', 'user:delete'],
                          'AND'
                        )
                      "
                    >
                      {{
                        getMultiPermissionText(
                          ['user:edit', 'user:delete'],
                          'AND'
                        )
                      }}
                    </span>
                  </div>
                </div>

                <div class="demo-row">
                  <div class="button-container">
                    <NButton
                      v-permission="{
                        permissions: 'user:*',
                        authData: state.currentPermissions.value,
                        fallback: 'show',
                      }"
                      type="success"
                      @click="
                        () =>
                          handlers.performSecureOperation('user:*', '用户管理')
                      "
                    >
                      🌟 通配符权限 (user:*)
                    </NButton>
                    <div class="permission-hint">
                      <NTag size="tiny">需要: user:* 通配符权限</NTag>
                    </div>
                  </div>
                  <div class="status-indicator">
                    <span :class="getPermissionStatus('user:*')">
                      {{ getPermissionText('user:*') }}
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
                  authData: state.currentPermissions.value,
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
                  authData: state.currentPermissions.value,
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
            v-model:value="state.activeTab.value"
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
  import {
    createPermissionDemoState,
    createPermissionDemoHandlers,
    PERMISSION_CODE_EXAMPLES,
  } from './data'

  // 创建状态和处理函数
  const state = createPermissionDemoState()
  const handlers = createPermissionDemoHandlers(state)

  /**
   * * @description 检查当前用户是否有指定权限
   * ? @param permission - 权限名称
   * ! @return 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    const permissions = state.currentPermissions.value
    if (permissions[permission]) return true

    // 检查通配符权限
    for (const key of Object.keys(permissions)) {
      if (key.endsWith('*') && permission.startsWith(key.slice(0, -1))) {
        return permissions[key]
      }
    }
    return false
  }

  /**
   * * @description 检查多个权限
   * ? @param permissionList - 权限列表
   * ? @param mode - 检查模式
   * ! @return 是否有权限
   */
  const hasMultiPermissions = (
    permissionList: string[],
    mode: 'AND' | 'OR'
  ): boolean => {
    const matches = permissionList.filter(perm => hasPermission(perm))
    return mode === 'AND'
      ? matches.length === permissionList.length
      : matches.length > 0
  }

  /**
   * * @description 获取权限状态CSS类
   * ? @param permission - 权限名称
   * ! @return CSS类名
   */
  const getPermissionStatus = (permission: string) => {
    return hasPermission(permission) ? 'status-granted' : 'status-denied'
  }

  /**
   * * @description 获取权限状态文本
   * ? @param permission - 权限名称
   * ! @return 状态文本
   */
  const getPermissionText = (permission: string) => {
    return hasPermission(permission) ? '✅ 有权限' : '❌ 无权限'
  }

  /**
   * * @description 获取多权限状态CSS类
   * ? @param permissions - 权限列表
   * ? @param mode - 检查模式
   * ! @return CSS类名
   */
  const getMultiPermissionStatus = (
    permissions: string[],
    mode: 'AND' | 'OR'
  ) => {
    return hasMultiPermissions(permissions, mode)
      ? 'status-granted'
      : 'status-denied'
  }

  /**
   * * @description 获取多权限状态文本
   * ? @param permissions - 权限列表
   * ? @param mode - 检查模式
   * ! @return 状态文本
   */
  const getMultiPermissionText = (
    permissions: string[],
    mode: 'AND' | 'OR'
  ) => {
    return hasMultiPermissions(permissions, mode) ? '✅ 有权限' : '❌ 无权限'
  }

  /**
   * * @description 处理用户切换
   * ? @param userId - 用户ID
   * ! @return void
   */
  const handleUserChange = async (userId: number) => {
    await handlers.switchUser(userId)
    await nextTick()
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
