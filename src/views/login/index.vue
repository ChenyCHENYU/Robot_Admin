<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 *
 * 通用凭据表单由 C_Login 负责；企业上下文激活在应用层编排。
 *
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container">
    <!-- Spline 3D 背景 -->
    <div class="spline-background">
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        :paused="loading || captchaVisible"
        :on-load="handleRobotLoad"
      />
    </div>

    <section
      v-if="!robotReady"
      class="workspace-visual"
      aria-label="多公司工作空间"
    >
      <div class="workspace-visual__eyebrow"
        >ONE IDENTITY · MULTIPLE WORKSPACES</div
      >
      <h2>一个账号，<br /><em>连接每个工作空间。</em></h2>
      <p
        >登录前选好公司，在已授权的公司间从容切换。<br />角色、权限与业务数据始终跟随当前公司。</p
      >
      <div
        v-if="authMode === 'mock'"
        class="workspace-visual__map"
      >
        <div class="workspace-visual__identity"
          ><span
            class="i-mdi-account-outline"
            aria-hidden="true"
          />
          CHENY <small>统一身份</small></div
        >
        <div class="workspace-visual__companies">
          <div
            class="workspace-visual__company workspace-visual__company--primary"
            ><span class="workspace-visual__mark">金</span
            ><div
              ><strong>江苏金恒（南京）</strong
              ><small>主公司 · 企业管理员</small></div
            ><b>当前</b></div
          >
          <div class="workspace-visual__company"
            ><span class="workspace-visual__mark">西</span
            ><div
              ><strong>江苏金恒（西安）</strong
              ><small>兼任 · 运营经理</small></div
            ></div
          >
          <div class="workspace-visual__company"
            ><span class="workspace-visual__mark">智</span
            ><div
              ><strong>西安天智</strong><small>兼任 · 只读审计</small></div
            ></div
          >
        </div>
      </div>
      <div
        v-else
        class="workspace-visual__map workspace-visual__map--remote"
      >
        <div class="workspace-visual__identity"
          ><span
            class="i-mdi-shield-check-outline"
            aria-hidden="true"
          />
          企业身份验证</div
        >
        <div class="workspace-visual__company"
          ><span class="workspace-visual__mark">01</span
          ><div
            ><strong>登录前选择公司</strong
            ><small>输入账号后显示已关联公司</small></div
          ></div
        >
        <div class="workspace-visual__company"
          ><span class="workspace-visual__mark">02</span
          ><div
            ><strong>切换已关联公司</strong
            ><small>权限和数据跟随当前公司</small></div
          ></div
        >
      </div>
    </section>

    <!-- 登录面板 -->
    <div class="login-wrapper">
      <div class="enterprise-caption">企业工作台 <span>·</span> 安全访问</div>
      <C_Login
        ref="loginRef"
        title="Robot Admin"
        subtitle="选择工作公司后登录，进入后也可随时切换"
        :features="loginFeatures"
        storage-key="robot-admin-enterprise-login"
        :loading="loading"
        :submit-disabled="!companyReady"
        :captcha-provider="LOGIN_CAPTCHA_PROVIDER"
        :captcha-challenge-url="LOGIN_CAPTCHA_CHALLENGE_URL"
        :captcha-verifier="LOGIN_CAPTCHA_VERIFIER"
        :require-captcha-server-verification="
          LOGIN_REQUIRE_CAPTCHA_SERVER_VERIFICATION
        "
        :default-username="loginDefaults.username"
        :default-password="loginDefaults.password"
        @submit="submitLogin"
        @username-change="workspaceUsername = $event"
        @captcha-visible-change="captchaVisible = $event"
      >
        <template #password-fields>
          <div
            class="login-workspace"
            aria-live="polite"
            :aria-busy="companyLoading"
          >
            <label
              id="login-company-label"
              class="login-workspace__label"
              >工作公司</label
            >
            <NSelect
              v-model:value="selectedCompanyId"
              :options="companyOptions"
              :loading="companyLoading"
              :disabled="loading || companyLoading || companies.length < 2"
              :placeholder="companyLoading ? '正在查询公司…' : '请选择工作公司'"
              :theme-overrides="LOGIN_COMPANY_SELECT_THEME"
              :status="companyError ? 'error' : undefined"
              aria-labelledby="login-company-label"
              filterable
            />
            <p
              class="login-workspace__hint"
              :class="{ 'login-workspace__hint--error': companyError }"
              >{{ translateText(companyHint) }}</p
            >
            <button
              v-if="companyError"
              type="button"
              class="login-workspace__retry"
              :disabled="loading"
              @click="queryCompanies"
              >重新查询</button
            >
          </div>
        </template>
      </C_Login>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { recordTelemetry } from '@/utils/d_telemetry'
  import { initDynamicRouter } from '@/router/dynamicRouter'
  import { preloadAuthenticatedShell } from '@/router/authenticatedShell'
  import { s_userStore } from '@/stores/user/index'
  import {
    activateAuthContextApi,
    getAuthMode,
    loginApi,
    type LoginResponse,
  } from '@/api/auth'
  import { resolveLoginAuthContext } from '@/api/auth.contract'
  import { useLoginWorkspace } from '@/composables/useLoginWorkspace'
  import { applyAuthSession } from '@/utils/d_authSession'
  import { useLoginController } from '@/composables/useLoginController'
  import {
    createWelcomeConfig,
    LOGIN_COMPANY_SELECT_THEME,
    resolveLoginDefaults,
    resolveLoginFeatures,
  } from './data'
  import {
    LOGIN_CAPTCHA_CHALLENGE_URL,
    LOGIN_CAPTCHA_PROVIDER,
    LOGIN_CAPTCHA_VERIFIER,
    LOGIN_REQUIRE_CAPTCHA_SERVER_VERIFICATION,
  } from './captcha'
  import Spline from './components/Spline.vue'
  import { translateText } from '@/utils/d_i18n'

  defineOptions({ name: 'LoginPage' })

  const router = useRouter()
  const userStore = s_userStore()
  const authMode = getAuthMode()
  const loginDefaults = resolveLoginDefaults(authMode)
  const loginFeatures = resolveLoginFeatures()

  const {
    username: workspaceUsername,
    companies,
    selectedCompanyId,
    companyLoading,
    companyError,
    companyOptions,
    companyHint,
    companyReady,
    queryCompanies,
    requireSelectedCompany,
  } = useLoginWorkspace()
  let requestedContextId: string | undefined

  const captchaVisible = ref(false)
  const robotReady = ref(false)
  const handleRobotLoad = () => {
    robotReady.value = true
  }

  // 登录页稳定呈现后再空闲预热认证壳层。用户完成人机验证期间即可完成加载，
  // 不把布局模块的开发态转换/解析成本留到点击登录之后。
  let cancelShellWarmup: (() => void) | undefined
  onMounted(() => {
    const warmup = () => void preloadAuthenticatedShell().catch(() => undefined)
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(warmup, { timeout: 1500 })
      cancelShellWarmup = () => window.cancelIdleCallback(handle)
      return
    }

    const handle = window.setTimeout(warmup, 800)
    cancelShellWarmup = () => window.clearTimeout(handle)
  })
  onBeforeUnmount(() => cancelShellWarmup?.())

  // ===== 登录控制器（凭据验证与企业上下文分阶段完成） =====
  const {
    loginRef,
    loading,
    handleLogin: submitLogin,
  } = useLoginController<LoginResponse>({
    loginApi: payload => {
      requestedContextId = requireSelectedCompany(payload.username)
      return loginApi({ ...payload, contextId: requestedContextId })
    },
    successMessage: '登录成功',
    errorMessage: '账号或密码错误',
    welcomeConfig: createWelcomeConfig(),

    onLoginSuccess: async (response, formData) => {
      const contexts = response.data.availableContexts
      if (!contexts) {
        if (response.data.activeContext?.id !== requestedContextId)
          throw new Error('公司会话与所选公司不一致，请重新登录')
        await enterSession(response, formData.username)
        return
      }
      const selected = resolveLoginAuthContext(contexts, requestedContextId)
      if (response.data.activeContext) {
        if (response.data.activeContext.id !== selected.id)
          throw new Error('公司会话与所选公司不一致，请重新登录')
        await enterSession(response, formData.username)
        return
      }
      if (!response.data.loginTicket)
        throw new Error('登录验证凭据缺失，请重新登录')
      const activated = await requestActivatedSession(
        response.data.loginTicket,
        selected.id
      )
      await enterSession(activated, formData.username)
    },

    onError: error => {
      recordTelemetry('login_failure', { route: 'login' })
      console.error('登录错误:', error)
    },
  })

  /** 完整会话就绪后，再发布权限路由并进入首页。 */
  const enterSession = async (
    response: LoginResponse,
    fallbackUsername = ''
  ) => {
    const token = applyAuthSession(response, fallbackUsername)
    // 布局预热是优化，不作为认证成功的额外阻塞条件。
    void preloadAuthenticatedShell().catch(() => undefined)
    const ok = await initDynamicRouter()
    if (userStore.token !== token) return
    if (!ok) {
      userStore.clearSession()
      throw new Error('动态路由初始化失败')
    }
    recordTelemetry('login_success', { route: 'login' })
    await router.replace('/home')
  }

  /** 激活响应必须包含完整的上下文，而不能回退到旧版单公司会话。 */
  const requestActivatedSession = async (
    loginTicket: string,
    contextId: string
  ): Promise<LoginResponse> => {
    const response = await activateAuthContextApi({ loginTicket, contextId })
    if (String(response.code) !== '0') {
      throw new Error(response.msg || '公司激活失败')
    }
    if (
      response.data.activeContext?.id !== contextId ||
      !response.data.availableContexts
    ) {
      throw new Error('公司会话不完整，请重新登录')
    }
    return response
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
