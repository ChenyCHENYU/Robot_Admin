<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 *
 * 业务逻辑全部委托给 useLoginController composable，
 * 本页面仅负责：拼装 UI + 传入配置。
 *
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container bg-[#181818]">
    <!-- 打字机动画 -->
    <Typewriter
      v-if="showTypewriter"
      :text="t('lp_typewriter', 'Hey！伙计，欢迎来到我的世界。')"
      :duration="2000"
      :delay="300"
      :pause-after="1000"
      @hidden="showTypewriter = false"
    />

    <!-- Spline 3D 背景 -->
    <div class="spline-background">
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
      />
    </div>

    <!-- 右上角工具栏：语言 + 主题 -->
    <div class="login-toolbar">
      <NButton
        circle
        class="login-toolbar__btn"
        @click="toggleTheme"
      >
        <template #icon>
          <C_Icon
            :name="
              themeStore.isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'
            "
            :size="16"
            :title="
              themeStore.isDark
                ? t('lp_light_mode', '切换亮色')
                : t('lp_dark_mode', '切换暗色')
            "
          />
        </template>
      </NButton>

      <NButton
        circle
        class="login-toolbar__btn"
        @click="toggleLang"
      >
        <template #icon>
          <C_Icon
            name="mdi:translate"
            :size="16"
            :title="langStore.currentLang === 'zh-cn' ? 'English' : '中文'"
          />
        </template>
      </NButton>
    </div>

    <!-- 登录面板 -->
    <div class="login-wrapper">
      <C_Login
        ref="loginRef"
        title="Robot Admin"
        :subtitle="t('lp_subtitle', '管理系统·请登录您的账号')"
        :features="LOGIN_FEATURES"
        :social-providers="SOCIAL_PROVIDERS"
        :loading="loading"
        default-username="CHENY"
        default-password="123456"
        @submit="handleLogin"
        @captcha-submit="handleCaptchaLogin"
        @send-code="handleSendCode"
        @social-login="handleSocialLogin"
        @forgot-password="handleForgotPassword"
        @register-submit="handleRegisterSubmit"
        @register-send-code="handleRegisterSendCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { initDynamicRouter } from '@/router/dynamicRouter'
  import { s_userStore } from '@/stores/user/index'
  import { s_themeStore } from '@/stores/theme'
  import { s_languageStore } from '@/stores/language'
  import { loginApi, type LoginResponse } from '@/api/auth'
  import { useLoginController } from '@/composables/useLoginController'
  import { LOGIN_FEATURES, SOCIAL_PROVIDERS, createWelcomeConfig } from './data'
  import Spline from './components/Spline.vue'
  import Typewriter from './components/Typewriter.vue'
  import './index.scss'

  const router = useRouter()
  const message = useMessage()
  const userStore = s_userStore()
  const themeStore = s_themeStore()
  const langStore = s_languageStore()

  // ===== i18n helper =====
  const t = (key: string, fallback: string) =>
    typeof (globalThis as any).$t === 'function'
      ? (globalThis as any).$t(key, fallback, 'robot_admin')
      : fallback

  // ===== 打字机 =====
  const showTypewriter = ref(true)

  // ===== 工具栏 =====
  const toggleTheme = () =>
    themeStore.setMode(themeStore.isDark ? 'light' : 'dark')
  const toggleLang = () =>
    langStore.setLanguage(langStore.currentLang === 'zh-cn' ? 'en' : 'zh-cn')

  // ===== 登录控制器（业务逻辑全部由 composable 托管） =====
  const {
    loginRef,
    loading,
    handleLogin,
    handleCaptchaLogin,
    handleSendCode,
    handleSocialLogin,
    handleForgotPassword,
    handleRegisterSubmit,
    handleRegisterSendCode,
  } = useLoginController<LoginResponse>({
    loginApi,
    successMessage: t('lp_login_ok', '登录成功'),
    errorMessage: t('lp_login_err', '账号或密码错误'),
    welcomeConfig: createWelcomeConfig(t),

    onLoginSuccess: async (response, formData) => {
      userStore.handleLoginSuccess(response.data.token)
      userStore.setUserInfo(formData)
      const ok = await initDynamicRouter()
      if (!ok) throw new Error('动态路由初始化失败')
      // 跳转到门户页面
      router.replace('/portal')
    },

    onError: error => console.error('登录错误:', error),

    onCaptchaLogin: () =>
      message.info(t('lp_captcha_wip', '验证码登录功能开发中，敬请期待')),

    onSendCode: account =>
      message.info(`${t('lp_code_sent', '验证码已发送至')} ${account}`),

    onSocialLogin: provider =>
      message.info(`${provider} ${t('lp_login_wip', '登录开发中，敬请期待')}`),

    onForgotPassword: () =>
      message.info(t('lp_forgot_wip', '忘记密码功能开发中，请联系管理员')),

    onRegisterSubmit: data => {
      message.info(t('lp_reg_wip', '注册功能开发中，敬请期待'))
      console.log('注册信息:', data)
    },

    onRegisterSendCode: phone =>
      message.info(`${t('lp_code_sent', '验证码已发送至')} ${phone}`),
  })
</script>
