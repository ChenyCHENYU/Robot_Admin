<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: profile 页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="profile-page">
    <!-- 个人信息卡片 -->
    <NCard class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <NAvatar
            round
            :size="80"
            :src="profileData.avatar"
          />
          <div class="avatar-overlay">
            <span class="i-mdi-camera-outline"></span>
          </div>
        </div>
        <div class="info-section">
          <h2 class="info-name">{{
            profileData.nickname || profileData.username
          }}</h2>
          <p class="info-bio">{{
            profileData.bio || '这个人很懒，什么都没写~'
          }}</p>
          <div class="info-meta">
            <span class="meta-item">
              <span class="i-mdi-shield-account-outline meta-icon" />
              {{ profileData.role }}
            </span>
            <span class="meta-item">
              <span class="i-mdi-domain meta-icon" />
              {{ profileData.department }}
            </span>
            <span class="meta-item">
              <span class="i-mdi-clock-outline meta-icon" />
              上次登录：{{ profileData.lastLoginTime }}
            </span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 账户信息 -->
    <NCard
      title="账户信息"
      class="account-info-card"
    >
      <div class="info-grid">
        <div
          v-for="item in ACCOUNT_INFO_ITEMS"
          :key="item.key"
          class="info-row"
        >
          <span
            :class="item.icon"
            class="info-row-icon"
          />
          <div class="info-row-content">
            <div class="info-row-label">{{ item.label }}</div>
            <div class="info-row-value">
              {{ profileData[item.key as keyof typeof profileData] || '-' }}
            </div>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 编辑个人资料 -->
    <NCard
      title="编辑资料"
      class="profile-form-card"
    >
      <C_Form
        ref="formRef"
        v-model="formData"
        :options="PROFILE_FORM_OPTIONS"
        :config="formConfig"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormConfig,
    FormInstance,
  } from '@robot-admin/naive-ui-components/C_Form'
  import {
    MOCK_PROFILE,
    EMPTY_PROFILE,
    PROFILE_FORM_OPTIONS,
    ACCOUNT_INFO_ITEMS,
    type ProfileFormData,
  } from './data'
  import { getAccountProfileApi, updateAccountProfileApi } from '@/api/account'
  import { useLatestRequest } from '@/composables/useLatestRequest'
  import { isMockDataMode } from '@/config/dataMode'

  defineOptions({ name: 'AccountProfile' })

  const { loading: profileLoading, run: runLatestProfileRequest } =
    useLatestRequest()
  const message = useMessage()
  const formRef = ref<FormInstance<ProfileFormData> | null>(null)

  const profileData = reactive({
    ...(isMockDataMode() ? MOCK_PROFILE : EMPTY_PROFILE),
  })

  // 表单数据
  const formData = ref<ProfileFormData>({
    username: profileData.username,
    nickname: profileData.nickname,
    email: profileData.email,
    phone: profileData.phone,
    bio: profileData.bio,
    avatar: profileData.avatar,
  })

  const formConfig = computed<FormConfig<ProfileFormData>>(() => ({
    disabled: profileLoading.value || !!formRef.value?.isSubmitting,
    layout: 'grid',
    grid: { cols: 2, gutter: 24 },
    labelPlacement: 'left',
    labelWidth: 80,
    preserveRemovedFields: true,
    submitText: '保存修改',
    onSubmit: async ({ model }, context) => {
      await updateAccountProfileApi(model, context?.signal)
      if (context?.signal.aborted) return
      Object.assign(profileData, model)
      await nextTick()
      formRef.value?.markAsClean()
      message.success('个人资料已更新')
    },
  }))

  onMounted(async () => {
    try {
      const response = await runLatestProfileRequest(signal =>
        getAccountProfileApi(MOCK_PROFILE, signal)
      )
      if (!response) return
      Object.assign(profileData, response.data)
      Object.assign(formData.value, response.data)
      await nextTick()
      formRef.value?.markAsClean()
    } catch {
      message.error('个人资料加载失败，请稍后重试')
    }
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
