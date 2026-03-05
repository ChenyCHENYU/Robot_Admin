<!--
 * @Description: C_Login - 通用插拔式登录组件
 * 通过 features prop 控制功能模块的显隐，样式通过 CSS 变量覆盖
-->
<template>
  <div class="c-login-panel">
    <!-- ===== Logo / 标题区 ===== -->
    <div class="c-login__header">
      <slot name="logo">
        <div class="c-login__logo">
          <C_Icon
            v-if="mergedProps.logoIcon"
            :name="mergedProps.logoIcon"
            :size="36"
            class="c-login__logo-icon"
          />
        </div>
      </slot>
      <h2 class="c-login__title">{{ mergedProps.title }}</h2>
      <p
        v-if="mergedProps.subtitle"
        class="c-login__subtitle"
      >
        {{ mergedProps.subtitle }}
      </p>
    </div>

    <!-- ===== Tab 切换：密码 / 验证码 ===== -->
    <NTabs
      v-if="feat.captchaLogin"
      v-model:value="activeTab"
      type="line"
      animated
      class="c-login__tabs"
    >
      <NTabPane
        name="password"
        tab="密码登录"
      />
      <NTabPane
        name="captcha"
        tab="验证码登录"
      />
    </NTabs>

    <!-- ===== 密码登录表单 ===== -->
    <NForm
      v-show="activeTab === 'password'"
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      class="c-login__form"
    >
      <NFormItem
        path="username"
        class="c-login__form-item"
      >
        <NInput
          v-model:value="passwordForm.username"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handlePasswordSubmit"
        >
          <template #prefix>
            <C_Icon
              name="mdi:account-outline"
              :size="16"
              class="c-login__input-icon"
            />
          </template>
        </NInput>
      </NFormItem>

      <NFormItem
        path="password"
        class="c-login__form-item"
      >
        <NInput
          v-model:value="passwordForm.password"
          type="password"
          placeholder="请输入密码"
          show-password-on="mousedown"
          clearable
          @keyup.enter="handlePasswordSubmit"
        >
          <template #prefix>
            <C_Icon
              name="mdi:lock-outline"
              :size="16"
              class="c-login__input-icon"
            />
          </template>
        </NInput>
      </NFormItem>

      <!-- 记住我 + 忘记密码 -->
      <div
        v-if="feat.rememberMe || feat.forgotPassword"
        class="c-login__aux-row"
      >
        <NCheckbox
          v-if="feat.rememberMe"
          v-model:checked="passwordForm.rememberMe"
          class="c-login__remember"
        >
          记住我
        </NCheckbox>
        <NText
          v-if="feat.forgotPassword"
          class="c-login__forgot"
          @click="emit('forgot-password')"
        >
          忘记密码?
        </NText>
      </div>
    </NForm>

    <!-- ===== 验证码登录表单 ===== -->
    <NForm
      v-show="activeTab === 'captcha'"
      ref="captchaFormRef"
      :model="captchaForm"
      :rules="captchaRules"
      class="c-login__form"
    >
      <NFormItem
        path="account"
        class="c-login__form-item"
      >
        <NInput
          v-model:value="captchaForm.account"
          placeholder="请输入手机号或邮箱"
          clearable
        >
          <template #prefix>
            <C_Icon
              name="mdi:cellphone"
              :size="16"
              class="c-login__input-icon"
            />
          </template>
        </NInput>
      </NFormItem>

      <NFormItem
        path="code"
        class="c-login__form-item"
      >
        <div class="c-login__code-row">
          <NInput
            v-model:value="captchaForm.code"
            placeholder="请输入验证码"
            clearable
            class="c-login__code-input"
            @keyup.enter="handleCaptchaSubmit"
          >
            <template #prefix>
              <C_Icon
                name="mdi:shield-key-outline"
                :size="16"
                class="c-login__input-icon"
              />
            </template>
          </NInput>
          <NButton
            :disabled="countdown > 0 || !captchaForm.account"
            class="c-login__send-code-btn"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </NButton>
        </div>
      </NFormItem>
    </NForm>

    <!-- ===== 登录按钮 ===== -->
    <NButton
      type="primary"
      block
      :loading="props.loading"
      :disabled="feat.captchaVerify && !captchaValid"
      class="c-login__submit-btn"
      @click="handleSubmit"
    >
      {{ feat.captchaVerify && !captchaValid ? '请先完成人机验证' : '登 录' }}
    </NButton>

    <!-- ===== 人机验证拼图 ===== -->
    <div
      v-if="feat.captchaVerify"
      class="c-login__captcha-wrap"
    >
      <C_Captcha
        ref="captchaRef"
        trigger-text=""
        theme="dark"
        @success="handleCaptchaSuccess"
        @fail="handleCaptchaFail"
        @change="handleCaptchaChange"
      />
    </div>

    <!-- ===== 其他登录方式 ===== -->
    <template v-if="feat.socialLogin && socialList.length">
      <NDivider class="c-login__divider">其他账号登录</NDivider>
      <div class="c-login__social-row">
        <NTooltip
          v-for="provider in socialList"
          :key="provider.key"
          trigger="hover"
          placement="top"
        >
          <template #trigger>
            <NButton
              circle
              class="c-login__social-btn"
              @click="emit('social-login', provider.key)"
            >
              <template #icon>
                <C_Icon
                  :name="provider.icon"
                  :size="20"
                />
              </template>
            </NButton>
          </template>
          {{ provider.label }}
        </NTooltip>
      </div>
    </template>

    <!-- ===== 快捷账号（demo） ===== -->
    <template v-if="feat.quickLogin && mergedProps.quickAccounts?.length">
      <NDivider class="c-login__divider">其他账号登录</NDivider>
      <div class="c-login__quick-row">
        <NButton
          v-for="acc in mergedProps.quickAccounts"
          :key="acc.label"
          :type="acc.type ?? 'default'"
          size="small"
          round
          class="c-login__quick-btn"
          @click="fillQuickAccount(acc)"
        >
          {{ acc.label }}
        </NButton>
      </div>
    </template>

    <!-- ===== 注册入口 ===== -->
    <div
      v-if="feat.register"
      class="c-login__register-row"
    >
      <NText class="c-login__register-hint">还没有账号？</NText>
      <NText
        class="c-login__register-link"
        @click="emit('register')"
      >
        注册账号
      </NText>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst, FormRules } from 'naive-ui/es'
  import type { C_Captcha } from '@robot-admin/naive-ui-components'
  import {
    DEFAULT_FEATURES,
    DEFAULT_SOCIAL_PROVIDERS,
    type LoginProps,
    type PasswordFormData,
    type CaptchaFormData,
    type QuickAccount,
  } from './types'

  // ===== Props & Emits =====
  const props = withDefaults(defineProps<LoginProps>(), {
    title: '欢迎回来',
    logoIcon: 'mdi:robot-outline',
    loading: false,
    storageKey: 'login_remember',
  })

  const emit = defineEmits<{
    (
      e: 'submit',
      data: PasswordFormData & {
        captchaToken?: string
        captchaTimestamp?: number
      }
    ): void
    (e: 'captcha-submit', data: CaptchaFormData): void
    (e: 'send-code', account: string): void
    (e: 'social-login', provider: string): void
    (e: 'forgot-password'): void
    (e: 'register'): void
  }>()

  // ===== 合并 Props（填充默认值） =====
  const mergedProps = computed(() => ({
    ...props,
    features: { ...DEFAULT_FEATURES, ...props.features },
    socialProviders: props.socialProviders ?? DEFAULT_SOCIAL_PROVIDERS,
  }))

  const feat = computed(
    () => mergedProps.value.features as Required<typeof DEFAULT_FEATURES>
  )
  const socialList = computed(() => mergedProps.value.socialProviders!)

  // ===== Tab =====
  const activeTab = ref<'password' | 'captcha'>('password')

  // ===== 密码表单 =====
  const passwordFormRef = ref<FormInst | null>(null)
  const passwordForm = reactive<PasswordFormData>({
    username: '',
    password: '',
    rememberMe: false,
  })

  const passwordRules: FormRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
    ],
  }

  // ===== 验证码表单 =====
  const captchaFormRef = ref<FormInst | null>(null)
  const captchaForm = reactive<CaptchaFormData>({ account: '', code: '' })
  const countdown = ref(0)

  const captchaRules: FormRules = {
    account: [
      { required: true, message: '请输入手机号或邮箱', trigger: 'blur' },
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  }

  // ===== 人机验证 =====
  const captchaRef = ref<InstanceType<typeof C_Captcha>>()
  const captchaValid = ref(false)
  const captchaToken = ref('')
  const captchaTimestamp = ref(0)

  const handleCaptchaSuccess = (data: { token: string; timestamp: number }) => {
    captchaValid.value = true
    captchaToken.value = data.token
    captchaTimestamp.value = data.timestamp
  }
  const handleCaptchaFail = () => {
    captchaValid.value = false
  }
  const handleCaptchaChange = (valid: boolean) => {
    captchaValid.value = valid
    if (!valid) {
      captchaToken.value = ''
      captchaTimestamp.value = 0
    }
  }

  const resetCaptcha = () => {
    captchaValid.value = false
    captchaToken.value = ''
    captchaTimestamp.value = 0
    captchaRef.value?.reset()
  }

  // ===== 记住我：初始化 + 监听 =====
  onMounted(() => {
    if (!feat.value.rememberMe) return
    const saved = localStorage.getItem(props.storageKey!)
    if (saved) {
      try {
        const { username, password } = JSON.parse(saved)
        passwordForm.username = username ?? ''
        passwordForm.password = password ?? ''
        passwordForm.rememberMe = true
      } catch {
        // ignore
      }
    }
  })

  watch(
    () => passwordForm.rememberMe,
    val => {
      if (val) {
        localStorage.setItem(
          props.storageKey!,
          JSON.stringify({
            username: passwordForm.username,
            password: passwordForm.password,
          })
        )
      } else {
        localStorage.removeItem(props.storageKey!)
      }
    }
  )

  // ===== 提交逻辑 =====
  const handlePasswordSubmit = () => handleSubmit()

  const handleSubmit = async () => {
    if (activeTab.value === 'password') {
      await passwordFormRef.value?.validate()
      if (feat.value.captchaVerify && !captchaValid.value) return

      // 记住我同步
      if (passwordForm.rememberMe) {
        localStorage.setItem(
          props.storageKey!,
          JSON.stringify({
            username: passwordForm.username,
            password: passwordForm.password,
          })
        )
      }

      emit('submit', {
        ...passwordForm,
        ...(feat.value.captchaVerify
          ? {
              captchaToken: captchaToken.value,
              captchaTimestamp: captchaTimestamp.value,
            }
          : {}),
      })
    } else {
      await handleCaptchaSubmit()
    }
  }

  const handleCaptchaSubmit = async () => {
    await captchaFormRef.value?.validate()
    emit('captcha-submit', { ...captchaForm })
  }

  // ===== 发送验证码 =====
  const handleSendCode = () => {
    if (!captchaForm.account) return
    emit('send-code', captchaForm.account)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  }

  // ===== 快捷账号填充 =====
  const fillQuickAccount = (acc: QuickAccount) => {
    activeTab.value = 'password'
    passwordForm.username = acc.username
    passwordForm.password = acc.password
    resetCaptcha()
  }

  // ===== 暴露 resetCaptcha 给父组件 =====
  defineExpose({ resetCaptcha })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
