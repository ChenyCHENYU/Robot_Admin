<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: security 页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="security-page">
    <!-- 安全配置 -->
    <NCard title="安全设置">
      <div class="security-list">
        <div
          v-for="item in securitySettings"
          :key="item.key"
          class="security-item"
        >
          <div class="security-item-icon">
            <span :class="item.icon" />
          </div>
          <div class="security-item-content">
            <div class="security-item-label">{{ item.label }}</div>
            <div class="security-item-desc">{{ item.description }}</div>
          </div>
          <div class="security-item-action">
            <NSwitch
              v-if="!item.action"
              v-model:value="item.enabled"
              :loading="updatingSettingKeys.has(item.key)"
              @update:value="(val: boolean) => handleToggle(item.key, val)"
            />
            <NButton
              v-else-if="item.key === 'password'"
              size="small"
              @click="showPasswordModal = true"
            >
              {{ item.action }}
            </NButton>
            <NButton
              v-else
              size="small"
              @click="handleAction(item.key)"
            >
              {{ item.action }}
            </NButton>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 最近登录记录 -->
    <NCard
      title="登录记录"
      class="login-records-card"
    >
      <C_Table
        :columns="loginColumns"
        :data="loginRecords"
        :loading="recordsLoading"
        :config="{
          toolbar: { show: false },
          pagination: false,
          display: { bordered: false, striped: true, size: 'small' },
        }"
      >
        <template #loading>
          <C_Loading label="正在加载登录记录" />
        </template>
      </C_Table>
    </NCard>

    <!-- 修改密码弹窗 -->
    <NModal
      v-model:show="showPasswordModal"
      preset="card"
      title="修改密码"
      :style="{ width: '460px' }"
      :bordered="false"
      :mask-closable="false"
      :closable="!passwordFormRef?.isSubmitting"
      :close-on-esc="!passwordFormRef?.isSubmitting"
    >
      <C_Form
        v-if="showPasswordModal"
        ref="passwordFormRef"
        :model-value="passwordForm"
        @update:model-value="Object.assign(passwordForm, $event)"
        :options="PASSWORD_FORM_OPTIONS"
        :config="passwordConfig"
        class="password-form"
      >
        <template #action="{ submit, submitting }">
          <div class="form-actions">
            <NButton
              :disabled="submitting"
              @click="showPasswordModal = false"
              >取消</NButton
            >
            <NButton
              type="primary"
              :loading="submitting"
              @click="submit"
              >确认修改</NButton
            >
          </div>
        </template>
      </C_Form>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'

  import type {
    FormConfig,
    FormInstance,
  } from '@robot-admin/naive-ui-components/C_Form'
  import {
    SECURITY_SETTINGS,
    PASSWORD_FORM_OPTIONS,
    DEFAULT_PASSWORD_FORM,
    MOCK_LOGIN_RECORDS,
    type SecuritySetting,
    type LoginRecord,
    type ChangePasswordForm,
  } from './data'
  import {
    changeAccountPasswordApi,
    getAccountLoginRecordsApi,
    getAccountSecuritySettingsApi,
    updateAccountSecuritySettingApi,
  } from '@/api/account'
  import { s_userStore } from '@/stores/user'
  import { useLatestRequest } from '@/composables/useLatestRequest'
  import { isMockDataMode } from '@/config/dataMode'

  defineOptions({ name: 'AccountSecurity' })

  const message = useMessage()
  const passwordFormRef = ref<FormInstance<ChangePasswordForm> | null>(null)
  const showPasswordModal = ref(false)
  const updatingSettingKeys = reactive(new Set<string>())
  const userStore = s_userStore()

  // 安全配置项
  const securitySettings = ref<SecuritySetting[]>(
    isMockDataMode() ? SECURITY_SETTINGS.map(setting => ({ ...setting })) : []
  )

  // 密码表单
  const passwordForm = reactive<ChangePasswordForm>({
    ...DEFAULT_PASSWORD_FORM,
  })

  watch(showPasswordModal, visible => {
    if (!visible) Object.assign(passwordForm, DEFAULT_PASSWORD_FORM)
  })

  // 登录记录
  const loginRecords = ref<LoginRecord[]>(
    isMockDataMode() ? [...MOCK_LOGIN_RECORDS] : []
  )

  // 登录记录表格列
  const loginColumns: TableColumn<LoginRecord>[] = [
    { title: '时间', key: 'time', width: 180 },
    { title: 'IP 地址', key: 'ip', width: 140 },
    { title: '地区', key: 'location', width: 120 },
    { title: '设备', key: 'device', width: 120 },
    { title: '浏览器', key: 'browser', width: 120 },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (row: LoginRecord) =>
        h(
          NTag,
          {
            type: row.status === 'success' ? 'success' : 'error',
            size: 'small',
            round: true,
          },
          () => (row.status === 'success' ? '成功' : '失败')
        ),
    },
  ]

  /** 切换安全开关 */
  const handleToggle = async (key: string, val: boolean) => {
    if (updatingSettingKeys.has(key)) return
    updatingSettingKeys.add(key)
    try {
      await updateAccountSecuritySettingApi(key, val)
      message.success(
        `${key === 'twoFactor' ? '两步验证' : key}已${val ? '开启' : '关闭'}`
      )
    } catch {
      const setting = securitySettings.value.find(item => item.key === key)
      if (setting) setting.enabled = !val
      message.error('安全设置更新失败，已恢复原状态')
    } finally {
      updatingSettingKeys.delete(key)
    }
  }

  /** 操作按钮 */
  const handleAction = (key: string) => {
    message.info(`${key} 功能开发中...`)
  }

  const passwordConfig = computed<FormConfig<ChangePasswordForm>>(() => ({
    disabled: !!passwordFormRef.value?.isSubmitting,
    labelPlacement: 'left',
    labelWidth: 90,
    onSubmit: async ({ model }, context) => {
      await changeAccountPasswordApi(
        { oldPassword: model.oldPassword, newPassword: model.newPassword },
        context?.signal
      )
      if (context?.signal.aborted) return
      message.success('密码修改成功，请重新登录')
      showPasswordModal.value = false
      await userStore.logout()
    },
  }))

  const { loading: recordsLoading, run: runLatestRecordsRequest } =
    useLatestRequest()

  onMounted(async () => {
    try {
      const response = await runLatestRecordsRequest(signal =>
        Promise.all([
          getAccountLoginRecordsApi(MOCK_LOGIN_RECORDS, signal),
          getAccountSecuritySettingsApi(SECURITY_SETTINGS, signal),
        ])
      )
      if (!response) return
      loginRecords.value = response[0].data
      securitySettings.value = response[1].data
    } catch {
      message.error('登录记录加载失败，请稍后重试')
    }
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
