<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-10-28 11:23:07
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-10-28 14:50:22
 * @FilePath: \Robot_Admin\src\components\global\C_ReLoginDialog\index.vue
 * @Description: 重新登录弹框组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NModal
    v-model:show="visible"
    :mask-closable="false"
    :close-on-esc="true"
    preset="card"
    title="提示"
    :style="{ width: '400px' }"
    @close="handleClose"
  >
    <NSpace
      vertical
      :size="16"
    >
      <!-- 提示信息 -->
      <NAlert
        type="warning"
        :bordered="false"
      >
        登录会话已过期，若需访问请点击登录
      </NAlert>

      <!-- 表单 -->
      <NSpace
        vertical
        :size="12"
      >
        <NInput
          v-model:value="formModel.username"
          placeholder="账号"
          readonly
          size="large"
        >
          <template #prefix>
            <span class="i-mdi:account text-base mr-2" />
          </template>
        </NInput>

        <NInput
          v-model:value="formModel.password"
          type="password"
          placeholder="密码"
          show-password-on="click"
          size="large"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <span class="i-mdi:lock text-base mr-2" />
          </template>
        </NInput>
      </NSpace>

      <!-- 按钮 -->
      <NSpace justify="end">
        <NButton @click="handleClose">取消</NButton>
        <NButton
          type="primary"
          :loading="loading"
          :disabled="!formModel.password"
          @click="handleLogin"
        >
          登录
        </NButton>
      </NSpace>
    </NSpace>
  </NModal>
</template>

<script setup lang="ts">
  import { s_userStore } from '@/stores/user'
  import { loginApi, type LoginResponse } from '@/api/auth'
  import { onReLoginSuccess, onReLoginCancel } from '@robot-admin/request-core'

  // Props
  interface Props {
    modelValue: boolean
    username?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    username: '',
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
    cancel: []
  }>()

  const userStore = s_userStore()
  const message = useMessage()

  const visible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
  })

  const loading = ref(false)

  // 表单数据
  const formModel = reactive({
    username: computed(() => props.username),
    password: computed(() => userStore.userInfo?.password || ''),
  })

  // 处理登录
  const handleLogin = async () => {
    if (!formModel.password) {
      message.error('请输入密码')
      return
    }

    try {
      loading.value = true

      // 重新登录前先清除过期的 token，避免拦截器拦截
      const oldToken = userStore.token
      userStore.setToken('')

      try {
        // 调用登录 API（不需要验证码）
        const response: LoginResponse = await loginApi({
          username: formModel.username,
          password: formModel.password,
        })

        // 更新 token 并续期
        const { token } = response.data
        userStore.handleLoginSuccess(token)

        message.success('重新登录成功')
        visible.value = false
        emit('success')

        // 通知所有等待的请求：重新登录成功
        onReLoginSuccess()
      } catch (error: any) {
        // 登录失败，恢复旧 token
        userStore.setToken(oldToken)
        throw error
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || '登录失败，请检查密码')
    } finally {
      loading.value = false
    }
  }

  // 处理关闭
  const handleClose = () => {
    visible.value = false
    emit('cancel')
    // 通知所有等待的请求：重新登录已取消
    onReLoginCancel()
    // 关闭后执行正常退出逻辑
    userStore.logout(true)
  }
</script>
