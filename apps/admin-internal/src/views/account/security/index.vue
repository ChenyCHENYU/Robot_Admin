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
      <NDataTable
        :columns="loginColumns"
        :data="loginRecords"
        :bordered="false"
        striped
        size="small"
      />
    </NCard>

    <!-- 修改密码弹窗 -->
    <NModal
      v-model:show="showPasswordModal"
      preset="card"
      title="修改密码"
      :style="{ width: '460px' }"
      :bordered="false"
      :mask-closable="false"
    >
      <NForm
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-placement="left"
        label-width="90"
        class="password-form"
      >
        <NFormItem
          label="当前密码"
          path="oldPassword"
        >
          <NInput
            v-model:value="passwordForm.oldPassword"
            type="password"
            show-password-on="click"
            placeholder="请输入当前密码"
          />
        </NFormItem>
        <NFormItem
          label="新密码"
          path="newPassword"
        >
          <NInput
            v-model:value="passwordForm.newPassword"
            type="password"
            show-password-on="click"
            placeholder="8-32位，含大小写字母和数字"
          />
        </NFormItem>
        <NFormItem
          label="确认密码"
          path="confirmPassword"
        >
          <NInput
            v-model:value="passwordForm.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入新密码"
          />
        </NFormItem>
      </NForm>
      <template #action>
        <div class="form-actions">
          <NButton @click="showPasswordModal = false">取消</NButton>
          <NButton
            type="primary"
            :loading="saving"
            @click="handleChangePassword"
          >
            确认修改
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import {
    NCard,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSwitch,
    NDataTable,
    NModal,
    NTag,
    useMessage,
    type FormInst,
    type FormRules,
    type DataTableColumns,
  } from 'naive-ui/es'
  import {
    SECURITY_SETTINGS,
    PASSWORD_FORM_RULES,
    DEFAULT_PASSWORD_FORM,
    MOCK_LOGIN_RECORDS,
    type SecuritySetting,
    type LoginRecord,
    type ChangePasswordForm,
  } from './data'

  defineOptions({ name: 'AccountSecurity' })

  const message = useMessage()
  const passwordFormRef = ref<FormInst | null>(null)
  const showPasswordModal = ref(false)
  const saving = ref(false)

  // 安全配置项
  const securitySettings = reactive<SecuritySetting[]>(
    JSON.parse(JSON.stringify(SECURITY_SETTINGS))
  )

  // 密码表单
  const passwordForm = reactive<ChangePasswordForm>({
    ...DEFAULT_PASSWORD_FORM,
  })

  // 密码规则（含确认密码校验）
  const confirmPasswordRules = [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_: unknown, value: string) => {
        if (value !== passwordForm.newPassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: 'blur',
    },
  ]

  const passwordRules: FormRules = {
    ...PASSWORD_FORM_RULES,
    confirmPassword: confirmPasswordRules,
  }

  // 登录记录
  const loginRecords = ref<LoginRecord[]>([...MOCK_LOGIN_RECORDS])

  // 登录记录表格列
  const loginColumns: DataTableColumns<LoginRecord> = [
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
  const handleToggle = (key: string, val: boolean) => {
    message.success(
      `${key === 'twoFactor' ? '两步验证' : key}已${val ? '开启' : '关闭'}`
    )
  }

  /** 操作按钮 */
  const handleAction = (key: string) => {
    message.info(`${key} 功能开发中...`)
  }

  /** 修改密码 */
  const handleChangePassword = async () => {
    try {
      await passwordFormRef.value?.validate()
      saving.value = true
      // TODO: 调用 API
      await new Promise(resolve => setTimeout(resolve, 800))
      message.success('密码修改成功，请重新登录')
      showPasswordModal.value = false
      Object.assign(passwordForm, DEFAULT_PASSWORD_FORM)
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
