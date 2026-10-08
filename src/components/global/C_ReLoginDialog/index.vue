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
    :show="visible"
    :mask-closable="false"
    :close-on-esc="true"
    preset="card"
    title="提示"
    class="re-login-dialog"
    @update:show="handleShowChange"
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
          :value="formUsername"
          placeholder="账号"
          readonly
          size="large"
        >
          <template #prefix>
            <span class="i-mdi-account text-base mr-2" />
          </template>
        </NInput>

        <NInput
          v-model:value="password"
          type="password"
          placeholder="密码"
          show-password-on="click"
          size="large"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <span class="i-mdi-lock text-base mr-2" />
          </template>
        </NInput>
      </NSpace>

      <!-- 按钮 -->
      <NSpace justify="end">
        <NButton @click="handleClose">取消</NButton>
        <NButton
          type="primary"
          :loading="loading"
          :disabled="!password"
          @click="handleLogin"
        >
          登录
        </NButton>
      </NSpace>
    </NSpace>
  </NModal>
</template>

<script setup lang="ts">
  import { recordTelemetry } from '@/utils/d_telemetry'
  import { s_userStore } from '@/stores/user'
  import {
    activateAuthContextApi,
    loginApi,
    type LoginResponse,
  } from '@/api/auth'
  import {
    onReLoginSuccess,
    onReLoginCancel,
  } from '@robot-admin/request-core/axios'

  defineOptions({ name: 'C_ReLoginDialog' })

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

  const formUsername = computed(() => props.username)
  const password = ref('')
  let generation = 0

  /** 关闭、切换账号或卸载后，旧请求不再拥有写入会话的权限。 */
  const invalidateAttempt = () => {
    generation++
    loading.value = false
  }

  const getErrorMessage = (error: unknown): string => {
    if (typeof error !== 'object' || error === null)
      return '登录失败，请检查密码'
    const response = Reflect.get(error, 'response')
    if (typeof response !== 'object' || response === null) {
      const directMessage = Reflect.get(error, 'message')
      return typeof directMessage === 'string'
        ? directMessage
        : '登录失败，请检查密码'
    }
    const data = Reflect.get(response, 'data')
    if (typeof data !== 'object' || data === null) return '登录失败，请检查密码'
    const apiMessage = Reflect.get(data, 'message') ?? Reflect.get(data, 'msg')
    return typeof apiMessage === 'string' ? apiMessage : '登录失败，请检查密码'
  }

  /** 重新验证身份，并在多公司模式下重新激活原工作上下文。 */
  const requestReLoginSession = async (
    credentials: { username: string; password: string; contextId?: string },
    isCurrent: () => boolean
  ): Promise<LoginResponse | undefined> => {
    const identityResponse = await loginApi({
      username: credentials.username,
      password: credentials.password,
    })
    if (!isCurrent()) return
    if (String(identityResponse.code) !== '0') {
      throw new Error(identityResponse.msg || '身份验证失败')
    }
    if (!identityResponse.data.availableContexts) return identityResponse

    const { contextId } = credentials
    const { loginTicket } = identityResponse.data
    if (!contextId || !loginTicket) {
      throw new Error('公司上下文已失效，请重新登录')
    }
    const activated = await activateAuthContextApi({ loginTicket, contextId })
    if (String(activated.code) !== '0') {
      throw new Error(activated.msg || '公司会话恢复失败')
    }
    return activated
  }

  const assertSameAccount = (username?: string) => {
    if (
      username &&
      userStore.userInfo.username &&
      username.toLowerCase() !== userStore.userInfo.username.toLowerCase()
    ) {
      throw new Error('账号身份已变化，请重新登录')
    }
  }

  const assertSameContext = (
    activeContext: LoginResponse['data']['activeContext'],
    availableContexts: LoginResponse['data']['availableContexts']
  ) => {
    if (
      userStore.activeContext &&
      activeContext?.id !== userStore.activeContext.id
    ) {
      throw new Error('公司上下文已变化，请重新登录')
    }
    if (
      activeContext &&
      !availableContexts?.some(item => item.id === activeContext.id)
    ) {
      throw new Error('公司上下文已变化，请重新登录')
    }
  }

  /** 校验完成后更新同一公司会话，不改动当前页面的业务路由。 */
  const restoreReLoginSession = (response: LoginResponse) => {
    const {
      token,
      refreshToken,
      expiresIn,
      user,
      activeContext,
      availableContexts,
    } = response.data
    if (!token) throw new Error('登录会话不完整，请重新登录')
    assertSameAccount(user?.username)
    assertSameContext(activeContext, availableContexts)
    userStore.handleLoginSuccess(token, refreshToken, expiresIn)
    if (user) userStore.setUserInfo(user)
    if (activeContext && availableContexts) {
      userStore.setAuthContexts(availableContexts, activeContext)
    }
  }

  // 请求期间保存身份快照；任何新会话都优先于这个过期会话。
  const handleLogin = async () => {
    if (loading.value || !visible.value) return
    if (!password.value) {
      message.error('请输入密码')
      return
    }

    const attempt = ++generation
    const oldToken = userStore.token
    const oldRefreshToken = userStore.refreshToken
    const oldUsername = userStore.userInfo.username
    const credentials = {
      username: formUsername.value,
      password: password.value,
      contextId: userStore.activeContext?.id,
    }
    loading.value = true
    // 身份认证不携带过期 token，避免进入请求拦截器的重新登录队列。
    userStore.setToken('')
    const isCurrent = () =>
      attempt === generation &&
      visible.value &&
      userStore.token === '' &&
      userStore.refreshToken === oldRefreshToken &&
      userStore.userInfo.username === oldUsername &&
      userStore.activeContext?.id === credentials.contextId

    try {
      const response = await requestReLoginSession(credentials, isCurrent)
      if (!response || !isCurrent()) return
      restoreReLoginSession(response)
      recordTelemetry('login_success', { route: 'relogin' })
      message.success('重新登录成功')
      password.value = ''
      visible.value = false
      emit('success')
      onReLoginSuccess()
    } catch (error: unknown) {
      if (!isCurrent()) return
      userStore.setToken(oldToken)
      recordTelemetry('login_failure', { route: 'relogin' })
      message.error(getErrorMessage(error))
    } finally {
      if (attempt === generation) loading.value = false
    }
  }

  // 处理关闭
  const handleClose = () => {
    invalidateAttempt()
    password.value = ''
    visible.value = false
    emit('cancel')
    // 通知所有等待的请求：重新登录已取消
    onReLoginCancel()
    // 关闭后执行正常退出逻辑
    void userStore.logout(true)
  }

  /** 卡片关闭与 Escape 都走 NModal 的统一 show 更新事件。 */
  const handleShowChange = (show: boolean) => {
    if (!show) handleClose()
  }

  onBeforeUnmount(invalidateAttempt)
  watch(
    () => [props.modelValue, props.username],
    () => {
      invalidateAttempt()
      password.value = ''
    },
    { flush: 'sync' }
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
