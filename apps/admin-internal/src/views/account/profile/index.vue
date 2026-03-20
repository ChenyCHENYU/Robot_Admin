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
            <span class="i-mdi:camera-outline"></span>
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
              <span class="i-mdi:shield-account-outline meta-icon" />
              {{ profileData.role }}
            </span>
            <span class="meta-item">
              <span class="i-mdi:domain meta-icon" />
              {{ profileData.department }}
            </span>
            <span class="meta-item">
              <span class="i-mdi:clock-outline meta-icon" />
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
      <NForm
        ref="formRef"
        :model="formData"
        :rules="PROFILE_FORM_RULES"
        label-placement="left"
        label-width="80"
      >
        <NGrid
          :cols="2"
          :x-gap="24"
        >
          <NGi>
            <NFormItem
              label="昵称"
              path="nickname"
            >
              <NInput
                v-model:value="formData.nickname"
                placeholder="请输入昵称"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="邮箱"
              path="email"
            >
              <NInput
                v-model:value="formData.email"
                placeholder="请输入邮箱"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="手机"
              path="phone"
            >
              <NInput
                v-model:value="formData.phone"
                placeholder="请输入手机号"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="简介"
              path="bio"
            >
              <NInput
                v-model:value="formData.bio"
                placeholder="一句话介绍自己"
              />
            </NFormItem>
          </NGi>
        </NGrid>
      </NForm>
      <div class="form-actions">
        <NButton @click="handleReset">重置</NButton>
        <NButton
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存修改
        </NButton>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import {
    NCard,
    NForm,
    NFormItem,
    NInput,
    NGrid,
    NGi,
    NAvatar,
    NButton,
    useMessage,
    type FormInst,
  } from 'naive-ui/es'
  import {
    MOCK_PROFILE,
    PROFILE_FORM_RULES,
    ACCOUNT_INFO_ITEMS,
    type ProfileFormData,
  } from './data'

  defineOptions({ name: 'AccountProfile' })

  const message = useMessage()
  const formRef = ref<FormInst | null>(null)
  const saving = ref(false)

  // 个人信息（Mock）
  const profileData = reactive({ ...MOCK_PROFILE })

  // 表单数据
  const formData = reactive<ProfileFormData>({
    username: profileData.username,
    nickname: profileData.nickname,
    email: profileData.email,
    phone: profileData.phone,
    bio: profileData.bio,
    avatar: profileData.avatar,
  })

  /** 重置表单 */
  const handleReset = () => {
    formData.nickname = profileData.nickname
    formData.email = profileData.email
    formData.phone = profileData.phone
    formData.bio = profileData.bio
  }

  /** 保存修改 */
  const handleSave = async () => {
    try {
      await formRef.value?.validate()
      saving.value = true
      // TODO: 调用 API 保存
      await new Promise(resolve => setTimeout(resolve, 800))
      Object.assign(profileData, formData)
      message.success('个人资料已更新')
    } catch {
      // 表单验证失败
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
