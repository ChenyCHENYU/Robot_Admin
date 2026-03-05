<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container bg-[#181818]">
    <!-- 打字机动画 -->
    <Typewriter
      v-if="showTypewriter"
      text="Hey！伙计，欢迎来到我的世界。"
      :duration="2000"
      :delay="300"
      :pause-after="1000"
      @complete="handleTypewriterComplete"
      @hidden="handleTypewriterHidden"
    />

    <!-- Spline 3D 背景 -->
    <div class="spline-background">
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
      />
    </div>

    <!-- 右上角工具栏：语言 + 主题 -->
    <div class="login-toolbar">
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
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
              />
            </template>
          </NButton>
        </template>
        {{ themeStore.isDark ? '切换亮色' : '切换暗色' }}
      </NTooltip>

      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NButton
            circle
            class="login-toolbar__btn"
            @click="toggleLang"
          >
            <template #icon>
              <C_Icon
                name="mdi:translate"
                :size="16"
              />
            </template>
          </NButton>
        </template>
        {{ langStore.currentLang === 'zh-cn' ? 'English' : '中文' }}
      </NTooltip>
    </div>

    <!-- 登录面板 -->
    <div class="login-wrapper">
      <C_Login
        ref="loginRef"
        title="Robot Admin"
        subtitle="管理系统 · 请登录您的账号"
        logo-icon="mdi:robot-outline"
        :features="LOGIN_FEATURES"
        :social-providers="SOCIAL_PROVIDERS"
        :quick-accounts="QUICK_ACCOUNTS"
        :loading="loading"
        @submit="handleLogin"
        @captcha-submit="handleCaptchaLogin"
        @send-code="handleSendCode"
        @social-login="handleSocialLogin"
        @forgot-password="handleForgotPassword"
        @register="handleRegister"
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
  import { useFormSubmit } from '@/hooks/useFormSubmit'
  import { LOGIN_FEATURES, SOCIAL_PROVIDERS, QUICK_ACCOUNTS } from './data'
  import Spline from './components/Spline.vue'
  import Typewriter from './components/Typewriter.vue'
  import type { PasswordFormData } from '@/components/global/C_Login/types'
  import './index.scss'

  const router = useRouter()
  const message = useMessage()
  const userStore = s_userStore()
  const themeStore = s_themeStore()
  const langStore = s_languageStore()
  const { loading, createSubmit } = useFormSubmit<LoginResponse>()

  // ===== 打字机 =====
  const showTypewriter = ref(true)
  const handleTypewriterComplete = () => {}
  const handleTypewriterHidden = () => {
    showTypewriter.value = false
  }

  // ===== C_Login ref =====
  const loginRef = ref<{ resetCaptcha: () => void } | null>(null)

  // ===== 工具栏：主题 & 语言 =====
  const toggleTheme = () => {
    themeStore.setMode(themeStore.isDark ? 'light' : 'dark')
  }

  const toggleLang = () => {
    const next = langStore.currentLang === 'zh-cn' ? 'en' : 'zh-cn'
    langStore.setLanguage(next)
  }

  // ===== 欢迎语生成 =====
  const WELCOME_CONFIG = {
    timeSlots: [
      { hours: [6, 12], greeting: '早上好', emoji: '🌅' },
      { hours: [12, 14], greeting: '中午好', emoji: '☀️' },
      { hours: [14, 18], greeting: '下午好', emoji: '🌤️' },
      { hours: [18, 22], greeting: '晚上好', emoji: '🌆' },
      { hours: [22, 24, 0, 6], greeting: '夜深了', emoji: '🌙' },
    ],
    templates: [
      '{greeting}，{username}！欢迎回来～ {emoji}',
      '{emoji} {greeting}，{username}！开始今天的工作吧',
      '欢迎回来，{username}！{greeting} {emoji}',
      '{greeting}，{username}！准备好了吗？ {emoji}',
    ],
  }

  const generateWelcomeMessage = (data: LoginResponse) => {
    const username = data.data?.username || 'CHENY'
    const hour = new Date().getHours()
    const slot =
      WELCOME_CONFIG.timeSlots.find(({ hours }) =>
        hours.length === 2
          ? hour >= hours[0] && hour < hours[1]
          : hours.includes(hour)
      ) || WELCOME_CONFIG.timeSlots[0]
    const { greeting, emoji } = slot
    const template =
      WELCOME_CONFIG.templates[
        Math.floor(Math.random() * WELCOME_CONFIG.templates.length)
      ]
    return template
      .replace('{greeting}', greeting)
      .replace('{username}', username)
      .replace('{emoji}', emoji)
  }

  // ===== 密码登录 =====
  let tempLoginInfo = { username: '', password: '' }

  const login = createSubmit(loginApi, {
    successMsg: '登录成功',
    meta: generateWelcomeMessage,
    errorMsg: '账号或密码错误',
    onSuccess: async (response: LoginResponse) => {
      try {
        const {
          data: { token },
        } = response
        userStore.handleLoginSuccess(token)
        userStore.setUserInfo(tempLoginInfo)
        const routeSuccess = await initDynamicRouter()
        if (!routeSuccess) throw new Error('动态路由初始化失败')
        router.replace('/home')
      } catch (error) {
        console.error('登录成功后操作失败:', error)
        loginRef.value?.resetCaptcha()
      }
    },
    globalErrorHandler: (error: Error) => {
      console.error('登录错误:', error)
      loginRef.value?.resetCaptcha()
    },
  })

  const handleLogin = (
    formData: PasswordFormData & {
      captchaToken?: string
      captchaTimestamp?: number
    }
  ) => {
    tempLoginInfo = {
      username: formData.username,
      password: formData.password,
    }
    // 构造 API 参数，captcha 部分可按需传入
    const payload: any = {
      username: formData.username,
      password: formData.password,
    }
    if (formData.captchaToken) {
      payload.captcha = {
        token: formData.captchaToken,
        timestamp: formData.captchaTimestamp,
        type: 'puzzle-captcha',
      }
    }
    login({ model: payload } as any)
  }

  // ===== 验证码登录（预留） =====
  const handleCaptchaLogin = () => {
    message.info('验证码登录功能开发中，敬请期待')
  }

  // ===== 发送验证码（预留） =====
  const handleSendCode = (account: string) => {
    message.info(`验证码已发送至 ${account}（演示模式）`)
  }

  // ===== 社交登录 =====
  const handleSocialLogin = (provider: string) => {
    message.info(`${provider} 登录开发中，敬请期待`)
  }

  // ===== 忘记密码 =====
  const handleForgotPassword = () => {
    message.info('忘记密码功能开发中，请联系管理员')
  }

  // ===== 注册 =====
  const handleRegister = () => {
    message.info('注册功能开发中，敬请期待')
  }
</script>
