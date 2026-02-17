<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-23 14:53:06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-23 17:02:50
 * @FilePath: \Robot_Admin\src\components\global\C_Captcha\index.vue
 * @Description: 基于 vue3-puzzle-vcode 封装的验证器组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-captcha-modern">
    <!-- 触发按钮 -->
    <div
      class="captcha-trigger"
      @click="showCaptcha"
      :class="{
        verified: isVerified,
        error: hasError,
        disabled: disabled,
      }"
    >
      <div class="captcha-content">
        <div class="captcha-icon">
          <span v-if="!isVerified && !hasError">🧩</span>
          <span
            v-if="isVerified"
            class="success-icon"
            >✓</span
          >
          <span
            v-if="hasError"
            class="error-icon"
            >⚠️</span
          >
        </div>
        <div class="captcha-text">
          <span v-if="!isVerified && !hasError">{{ triggerText }}</span>
          <span
            v-if="isVerified"
            class="success-text"
            >验证成功</span
          >
          <span
            v-if="hasError"
            class="error-text"
            >验证失败，请重试</span
          >
        </div>
      </div>

      <!-- 刷新按钮 -->
      <div
        v-if="isVerified || hasError"
        class="refresh-button"
        @click.stop="resetCaptcha"
        title="重新验证"
      >
        ⟲
      </div>
    </div>

    <!-- 拼图验证码组件 -->
    <PuzzleVcode
      :show="showModal"
      :imgs="captchaImages"
      @success="handleSuccess"
      @close="handleClose"
      @fail="handleFail"
    />
  </div>
</template>

<script setup lang="ts">
  import PuzzleVcode from 'vue3-puzzle-vcode'

  interface CaptchaProps {
    triggerText?: string
    images?: string[]
    disabled?: boolean
    theme?: 'light' | 'dark'
  }

  interface CaptchaEmits {
    (e: 'success', data: { token: string; timestamp: number }): void
    (e: 'fail', error: string): void
    (e: 'change', valid: boolean): void
    (e: 'reset'): void
  }

  const props = withDefaults(defineProps<CaptchaProps>(), {
    triggerText: '点击进行人机验证',
    images: () => [],
    disabled: false,
    theme: 'dark',
  })

  const emit = defineEmits<CaptchaEmits>()

  // 组件状态
  const showModal = ref(false)
  const isVerified = ref(false)
  const hasError = ref(false)
  const verificationToken = ref('')
  let errorTimer: ReturnType<typeof setTimeout> | null = null

  // 计算属性
  const captchaImages = computed(() =>
    props.images.length > 0 ? props.images : undefined
  )

  // 显示验证码
  const showCaptcha = () => {
    if (props.disabled || isVerified.value) return

    hasError.value = false
    showModal.value = true
  }

  // 验证成功
  const handleSuccess = () => {
    isVerified.value = true
    hasError.value = false
    showModal.value = false

    const timestamp = Date.now()
    const token = `puzzle_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
    verificationToken.value = token

    const successData = { token, timestamp }
    emit('success', successData)
    emit('change', true)
  }

  // 验证失败
  const handleFail = () => {
    isVerified.value = false
    hasError.value = true
    showModal.value = false

    if (errorTimer) clearTimeout(errorTimer)
    errorTimer = setTimeout(() => {
      hasError.value = false
      errorTimer = null
    }, 3000)

    emit('fail', '拼图验证失败')
    emit('change', false)
  }

  // 关闭弹窗
  const handleClose = () => {
    showModal.value = false
  }

  // 重置验证
  const resetCaptcha = () => {
    isVerified.value = false
    hasError.value = false
    showModal.value = false
    verificationToken.value = ''
    if (errorTimer) {
      clearTimeout(errorTimer)
      errorTimer = null
    }

    emit('reset')
    emit('change', false)
  }

  // 对外暴露方法
  defineExpose({
    validate: () => isVerified.value,
    getToken: () => verificationToken.value,
    getVerificationData: () => {
      if (!isVerified.value) return null
      return {
        token: verificationToken.value,
        timestamp: Date.now(),
        type: 'puzzle-captcha',
      }
    },
    reset: resetCaptcha,
    show: showCaptcha,
  })

  onBeforeUnmount(() => {
    if (errorTimer) clearTimeout(errorTimer)
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
