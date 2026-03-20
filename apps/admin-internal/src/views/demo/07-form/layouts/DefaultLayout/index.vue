<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-10 00:12:40
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:20:33
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\DefaultLayout\index.vue
 * @Description: 表单组件 - 默认布局  - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="default-layout">
    <C_Form
      ref="formRef"
      :options="formOptions"
      :config="formConfig"
      v-model="formData"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
    >
      <!-- 自定义表单操作区 -->
      <template #action="{ validate, reset }">
        <C_ActionBar
          :actions="getFormActions(validate, reset)"
          :config="{ align: 'right', gap: 16 }"
        />
      </template>
    </C_Form>
  </div>
</template>

<script setup lang="ts">
  import type {
    LabelPlacement,
    FormInstance,
    FormModel,
    FormOption,
    ActionItem,
  } from '@robot-admin/naive-ui-components'
  import { PRESET_RULES, RULE_COMBOS } from '@robot-admin/form-validate'

  // ==================== 表单字段配置 ====================
  const getFormOptions = (): FormOption[] => [
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      rules: RULE_COMBOS.username('用户名'),
    },
    {
      type: 'input',
      prop: 'realName',
      label: '真实姓名',
      placeholder: '请输入真实姓名',
      rules: [
        PRESET_RULES.required('真实姓名'),
        PRESET_RULES.length('真实姓名', 2, 20),
      ],
    },
    {
      type: 'inputNumber',
      prop: 'age',
      label: '年龄',
      rules: [
        PRESET_RULES.required('年龄'),
        PRESET_RULES.range('年龄', 1, 120),
      ],
      attrs: { min: 1, max: 120 },
    },
    {
      type: 'select',
      prop: 'gender',
      label: '性别',
      placeholder: '请选择性别',
      rules: [PRESET_RULES.required('性别')],
      children: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
      ],
    },
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱地址',
      rules: RULE_COMBOS.email('邮箱'),
    },
    {
      type: 'input',
      prop: 'phone',
      label: '手机号',
      placeholder: '请输入手机号',
      rules: RULE_COMBOS.mobile('手机号'),
    },
    {
      type: 'input',
      prop: 'password',
      label: '密码',
      placeholder: '请输入密码',
      rules: RULE_COMBOS.password('密码'),
      attrs: { type: 'password', showPasswordOn: 'mousedown' },
    },
    {
      type: 'textarea',
      prop: 'address',
      label: '地址',
      placeholder: '请输入详细地址',
      rules: [
        PRESET_RULES.required('地址'),
        PRESET_RULES.length('地址', 5, 200),
      ],
      attrs: { rows: 3 },
    },
    {
      type: 'editor',
      prop: 'description',
      label: '个人简介',
      placeholder: '请输入个人简介...',
      value: '',
      attrs: { height: 200 },
    },
  ]

  // ==================== Props ====================
  interface Props {
    labelPlacement?: LabelPlacement
    validateOnChange?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    labelPlacement: 'left',
    validateOnChange: false,
  })

  const { labelPlacement, validateOnChange } = toRefs(props)

  // ==================== Emits ====================
  const emit = defineEmits<{
    submit: [payload: any]
    'validate-success': [model: FormModel]
    'validate-error': [errors: any]
    'fields-change': [fields: any[]]
  }>()

  // ==================== v-model ====================
  const formData = defineModel<FormModel>({ required: true })

  // ==================== 响应式状态 ====================
  const formRef = ref<FormInstance | null>(null)
  const submitLoading = ref<boolean>(false)
  const message = useMessage()

  // ==================== 计算属性 ====================
  const formOptions = computed(() => getFormOptions())

  const formConfig = computed(() => ({
    layout: 'default' as const,
    validateOnChange: validateOnChange.value,
    labelPlacement: labelPlacement.value,
    onFieldsChange: handleFieldsChange,
  }))

  // ==================== 事件处理 ====================
  const handleFieldsChange = (fields: any[]): void => {
    emit('fields-change', fields)
  }

  // ==================== 表单操作按钮配置 ====================
  const getFormActions = (
    validate: () => Promise<void>,
    reset: () => void
  ): ActionItem[] => [
    {
      key: 'reset',
      label: '重置表单',
      onClick: () => resetForm(reset),
    },
    {
      key: 'submit',
      label: submitLoading.value ? '提交中...' : '提交表单',
      type: 'primary',
      loading: submitLoading.value,
      onClick: () => submitForm(validate),
    },
  ]

  // ==================== 表单操作方法 ====================
  const submitForm = async (validate: () => Promise<void>): Promise<void> => {
    try {
      submitLoading.value = true
      await validate()
      emit('submit', formData.value)
      message.success('默认布局表单提交成功！')
    } catch (errors) {
      message.error('请完善表单必填信息')
      console.log('表单验证失败:', errors)
    } finally {
      submitLoading.value = false
    }
  }

  const resetForm = (reset: () => void): void => {
    reset()
    message.info('表单已重置')
  }

  // ==================== 事件处理器 ====================
  const handleSubmit = (payload: any): void => {
    emit('submit', payload)
  }

  const handleValidateSuccess = (model: FormModel): void => {
    emit('validate-success', model)
  }

  const handleValidateError = (errors: any): void => {
    emit('validate-error', errors)
  }

  // ==================== 暴露的方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  defineExpose({
    validate,
    resetFields,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
