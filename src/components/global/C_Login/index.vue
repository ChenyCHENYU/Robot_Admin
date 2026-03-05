<!--
 * @Description: C_Login - 通用插拔式登录组件
 * 通过 features prop 控制功能模块的显隐，样式通过 CSS 变量覆盖
-->
<template>
  <div class="c-login-panel">
    <!-- ===== Logo / 标题区 ===== -->
    <div class="c-login__header">
      <slot name="logo">
        <div
          v-if="mergedProps.logoIcon"
          class="c-login__logo"
        >
          <C_Icon
            :name="mergedProps.logoIcon"
            :size="36"
            class="c-login__logo-icon"
          />
        </div>
      </slot>
      <h2 class="c-login__title">{{ mergedProps.title }}</h2>
      <p
        v-if="mergedProps.subtitle && activeTab !== 'register'"
        class="c-login__subtitle"
      >
        {{ mergedProps.subtitle }}
      </p>
      <!-- 注册视图的副标题 -->
      <p
        v-if="activeTab === 'register'"
        class="c-login__subtitle c-login__subtitle--register"
      >
        {{ t('cl_register', '注册账号') }}
      </p>
    </div>

    <!-- ===== 密码登录表单（默认视图） ===== -->
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
          :placeholder="t('cl_username_ph', '请输入用户名')"
          clearable
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
          show-password-on="click"
          :placeholder="t('cl_password_ph', '请输入密码')"
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
          v-model:checked="rememberMe"
          class="c-login__remember"
        >
          {{ t('cl_remember', '记住我') }}
        </NCheckbox>
        <NText
          v-if="feat.forgotPassword"
          class="c-login__forgot"
          @click="emit('forgot-password')"
        >
          {{ t('cl_forgot', '忘记密码？') }}
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
          :placeholder="t('cl_phone_ph', '请输入手机号')"
          clearable
          maxlength="11"
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
            :placeholder="t('cl_code_ph', '请输入验证码')"
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
            {{
              countdown > 0
                ? `${countdown}s ${t('cl_resend', '后重发')}`
                : t('cl_get_code', '获取验证码')
            }}
          </NButton>
        </div>
      </NFormItem>
    </NForm>

    <!-- ===== 登录按钮（密码和验证码模式） ===== -->
    <NButton
      v-if="activeTab === 'password' || activeTab === 'captcha'"
      type="primary"
      block
      :loading="props.loading"
      :disabled="
        activeTab === 'password' ? false : feat.captchaVerify && !captchaValid
      "
      class="c-login__submit-btn"
      @click="
        activeTab === 'password'
          ? handlePasswordSubmit()
          : handleCaptchaSubmit()
      "
    >
      {{
        activeTab === 'captcha' && feat.captchaVerify && !captchaValid
          ? t('cl_verify_first', '请先完成人机验证')
          : t('cl_login_btn', '登 录')
      }}
    </NButton>

    <!-- ===== 人机验证拼图（仅在验证码模式显示） ===== -->
    <div
      v-if="feat.captchaVerify && activeTab === 'captcha'"
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

    <!-- ===== 返回按钮（验证码子视图） ===== -->
    <NButton
      v-if="activeTab === 'captcha'"
      block
      class="c-login__back-btn"
      @click="activeTab = 'password'"
    >
      {{ t('cl_back', '返回') }}
    </NButton>

    <!-- ===== 扫码登录面板 ===== -->
    <div
      v-if="activeTab === 'qrcode'"
      class="c-login__qr-panel"
    >
      <div class="c-login__qr-frame">
        <C_QRCode
          ref="qrcodeRef"
          :value="qrcodeValue"
          :size="148"
          :margin="1"
          :show-border="false"
          color="#ffffff"
          bg-color="#000000"
          error-correction-level="M"
        />
        <div class="c-login__qr-scan-line" />
        <div class="c-login__qr-corner c-login__qr-corner--tl" />
        <div class="c-login__qr-corner c-login__qr-corner--tr" />
        <div class="c-login__qr-corner c-login__qr-corner--bl" />
        <div class="c-login__qr-corner c-login__qr-corner--br" />
      </div>
      <p class="c-login__qr-hint">
        <C_Icon
          name="mdi:cellphone-check"
          :size="13"
        />
        {{ t('cl_qr_hint', '打开手机扫码后点击「确认」即可登录') }}
      </p>
      <NButton
        text
        size="tiny"
        class="c-login__qr-refresh"
        @click="handleQrcodeRefresh"
      >
        <template #icon>
          <C_Icon
            name="mdi:refresh"
            :size="12"
          />
        </template>
        {{ t('cl_qr_refresh', '二维码已失效？点击刷新') }}
      </NButton>
    </div>

    <!-- ===== 返回按钮（扫码子视图，在二维码下方） ===== -->
    <NButton
      v-if="activeTab === 'qrcode'"
      block
      class="c-login__back-btn"
      @click="activeTab = 'password'"
    >
      {{ t('cl_back', '返回') }}
    </NButton>

    <!-- ===== 注册表单 ===== -->
    <NForm
      v-show="activeTab === 'register'"
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      class="c-login__form"
    >
      <NFormItem
        path="phone"
        class="c-login__form-item"
      >
        <NInput
          v-model:value="registerForm.phone"
          :placeholder="t('cl_phone_ph', '请输入手机号')"
          clearable
          maxlength="11"
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
            v-model:value="registerForm.code"
            :placeholder="t('cl_code_ph', '请输入验证码')"
            clearable
            class="c-login__code-input"
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
            :disabled="regCountdown > 0 || !registerForm.phone"
            class="c-login__send-code-btn"
            @click="handleRegSendCode"
          >
            {{
              regCountdown > 0
                ? `${regCountdown}s ${t('cl_resend', '后重发')}`
                : t('cl_get_code', '获取验证码')
            }}
          </NButton>
        </div>
      </NFormItem>

      <NFormItem
        path="password"
        class="c-login__form-item"
      >
        <NInput
          v-model:value="registerForm.password"
          type="password"
          show-password-on="click"
          :placeholder="t('cl_password_ph', '请输入密码')"
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

      <NFormItem
        path="confirmPassword"
        class="c-login__form-item"
      >
        <NInput
          v-model:value="registerForm.confirmPassword"
          type="password"
          show-password-on="click"
          :placeholder="t('cl_confirm_pw_ph', '请再次输入密码')"
          @keyup.enter="handleRegisterSubmit"
        >
          <template #prefix>
            <C_Icon
              name="mdi:lock-check-outline"
              :size="16"
              class="c-login__input-icon"
            />
          </template>
        </NInput>
      </NFormItem>
    </NForm>

    <!-- ===== 注册确认按钮 ===== -->
    <NButton
      v-if="activeTab === 'register'"
      type="primary"
      block
      :loading="props.loading"
      class="c-login__submit-btn"
      @click="handleRegisterSubmit"
    >
      {{ t('cl_confirm', '确认') }}
    </NButton>

    <!-- ===== 注册视图返回按钮 ===== -->
    <NButton
      v-if="activeTab === 'register'"
      block
      class="c-login__back-btn"
      @click="activeTab = 'password'"
    >
      {{ t('cl_back', '返回') }}
    </NButton>

    <!-- ===== 登录方式切换（仅密码登录默认视图显示） ===== -->
    <div
      v-if="activeTab === 'password' && (feat.captchaLogin || feat.qrcodeLogin)"
      class="c-login__mode-switch"
    >
      <NButton
        v-if="feat.captchaLogin"
        class="c-login__mode-btn"
        size="small"
        @click="activeTab = 'captcha'"
      >
        {{ t('cl_captcha_login', '验证码登录') }}
      </NButton>
      <NButton
        v-if="feat.qrcodeLogin"
        class="c-login__mode-btn"
        size="small"
        @click="activeTab = 'qrcode'"
      >
        {{ t('cl_qr_login', '扫码登录') }}
      </NButton>
    </div>

    <!-- ===== 其他登录方式（仅密码登录默认视图显示） ===== -->
    <template
      v-if="activeTab === 'password' && feat.socialLogin && socialList.length"
    >
      <NDivider class="c-login__divider">{{
        t('cl_social_login', '其他账号登录')
      }}</NDivider>
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
                  :size="16"
                />
              </template>
            </NButton>
          </template>
          {{ provider.label }}
        </NTooltip>
      </div>
    </template>

    <!-- ===== 注册入口（仅密码登录默认视图显示） ===== -->
    <div
      v-if="activeTab === 'password' && feat.register"
      class="c-login__register-row"
    >
      <NText class="c-login__register-hint">{{
        t('cl_no_account', '还没有账号？')
      }}</NText>
      <NText
        class="c-login__register-link"
        @click="activeTab = 'register'"
      >
        {{ t('cl_register', '注册账号') }}
      </NText>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst, FormRules } from 'naive-ui/es'
  import type { C_Captcha } from '@robot-admin/naive-ui-components'
  import { RULE_COMBOS } from '@robot-admin/form-validate'
  import {
    DEFAULT_FEATURES,
    DEFAULT_SOCIAL_PROVIDERS,
    type LoginProps,
    type PasswordFormData,
    type CaptchaFormData,
    type RegisterFormData,
  } from './types'

  // ===== i18n helper =====
  const t = (key: string, fallback: string) =>
    typeof (globalThis as any).$t === 'function'
      ? (globalThis as any).$t(key, fallback, 'robot_admin')
      : fallback

  // ===== Props & Emits =====
  const props = withDefaults(defineProps<LoginProps>(), {
    title: '欢迎回来',
    loading: false,
    storageKey: 'c_login_remember',
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
    (e: 'qrcode-refresh'): void
    (e: 'register-submit', data: RegisterFormData): void
    (e: 'register-send-code', phone: string): void
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

  // ===== Tab（默认密码登录） =====
  const activeTab = ref<'password' | 'captcha' | 'qrcode' | 'register'>(
    'password'
  )

  // ===== 密码表单 =====
  const passwordFormRef = ref<FormInst | null>(null)
  const passwordForm = reactive<PasswordFormData>({
    username: '',
    password: '',
  })

  const passwordRules: FormRules = {
    username: [
      {
        required: true,
        message: t('cl_username_rule', '请输入用户名'),
        trigger: 'blur',
      },
    ],
    password: [
      {
        required: true,
        message: t('cl_password_rule', '请输入密码'),
        trigger: 'blur',
      },
    ],
  }

  // ===== 记住我 =====
  const rememberMe = ref(false)

  watch(rememberMe, val => {
    if (val) {
      localStorage.setItem(
        props.storageKey!,
        JSON.stringify({ username: passwordForm.username })
      )
    } else {
      localStorage.removeItem(props.storageKey!)
    }
  })

  onMounted(() => {
    try {
      const saved = localStorage.getItem(props.storageKey!)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.username) {
          passwordForm.username = data.username
          rememberMe.value = true
        }
      }
    } catch {
      /* ignore */
    }
  })

  // ===== 密码登录提交 =====
  const handlePasswordSubmit = async () => {
    try {
      await passwordFormRef.value?.validate()
    } catch {
      return // 校验失败，表单会显示行内错误提示
    }
    emit('submit', {
      ...passwordForm,
      ...(captchaValid.value
        ? {
            captchaToken: captchaToken.value,
            captchaTimestamp: captchaTimestamp.value,
          }
        : {}),
    })
  }

  // ===== 验证码表单 =====
  const captchaFormRef = ref<FormInst | null>(null)
  const captchaForm = reactive<CaptchaFormData>({ account: '', code: '' })
  const countdown = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const captchaRules: FormRules = {
    account: RULE_COMBOS.mobile('手机号') as FormRules['account'],
    code: [
      {
        required: true,
        message: t('cl_code_rule', '请输入验证码'),
        trigger: 'blur',
      },
    ],
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

  const handleCaptchaSubmit = async () => {
    try {
      await captchaFormRef.value?.validate()
    } catch {
      return
    }
    if (feat.value.captchaVerify && !captchaValid.value) return
    emit('captcha-submit', { ...captchaForm })
  }

  // ===== 发送验证码 =====
  const handleSendCode = () => {
    if (!captchaForm.account) return
    emit('send-code', captchaForm.account)
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, 1000)
  }

  // ===== 扫码登录 =====
  const qrcodeRef = ref<any>(null)
  const qrcodeValue = ref(
    `https://robot-admin.app/qrcode-login?t=${Date.now()}`
  )

  const handleQrcodeRefresh = () => {
    qrcodeValue.value = `https://robot-admin.app/qrcode-login?t=${Date.now()}`
    emit('qrcode-refresh')
  }

  // ===== 注册表单 =====
  const registerFormRef = ref<FormInst | null>(null)
  const registerForm = reactive<RegisterFormData>({
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
  })
  const regCountdown = ref(0)
  let regCountdownTimer: ReturnType<typeof setInterval> | null = null

  const registerRules: FormRules = {
    phone: RULE_COMBOS.mobile('手机号') as FormRules['phone'],
    code: [
      {
        required: true,
        message: t('cl_code_rule', '请输入验证码'),
        trigger: 'blur',
      },
    ],
    password: RULE_COMBOS.password('密码') as FormRules['password'],
    confirmPassword: [
      {
        required: true,
        message: t('cl_confirm_pw_rule', '请再次输入密码'),
        trigger: 'blur',
      },
      {
        validator: (_rule: any, value: string) => {
          if (value !== registerForm.password) {
            return new Error(t('cl_pw_mismatch', '两次密码输入不一致'))
          }
          return true
        },
        trigger: 'blur',
      },
    ],
  }

  const handleRegSendCode = () => {
    if (!registerForm.phone) return
    emit('register-send-code', registerForm.phone)
    if (regCountdownTimer) {
      clearInterval(regCountdownTimer)
      regCountdownTimer = null
    }
    regCountdown.value = 60
    regCountdownTimer = setInterval(() => {
      regCountdown.value--
      if (regCountdown.value <= 0) {
        clearInterval(regCountdownTimer!)
        regCountdownTimer = null
      }
    }, 1000)
  }

  const handleRegisterSubmit = async () => {
    try {
      await registerFormRef.value?.validate()
    } catch {
      return
    }
    emit('register-submit', { ...registerForm })
  }

  // ===== 清理定时器 =====
  onUnmounted(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    if (regCountdownTimer) {
      clearInterval(regCountdownTimer)
      regCountdownTimer = null
    }
  })

  // ===== 暴露方法给父组件 =====
  defineExpose({ resetCaptcha })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
