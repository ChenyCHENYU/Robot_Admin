import type { FormOption } from '@/types/modules/form'
import { PRESET_RULES } from '@robot-admin/form-validate'

const { required, length, email } = PRESET_RULES

// 步骤配置
export const getLayoutConfig = () => ({
  steps: {
    steps: [
      {
        key: 'step1',
        title: '基本信息',
        description: '填写个人基本信息',
        required: true,
      },
      {
        key: 'step2',
        title: '联系方式',
        description: '填写联系方式和地址',
        required: true,
      },
      {
        key: 'step3',
        title: '安全设置',
        description: '设置登录密码',
        required: true,
      },
      {
        key: 'step4',
        title: '确认提交',
        description: '确认信息并完成注册',
        required: false,
      },
    ],
    size: 'medium' as 'small' | 'medium',
    vertical: false,
    validateBeforeNext: true,
    showStepHeader: true,
    prevButtonText: '上一步',
    nextButtonText: '下一步',
  },
})

// 表单字段配置
export const getFormOptions = (formData: any): FormOption[] => [
  // 第一步：基本信息
  {
    type: 'input',
    prop: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
    layout: { step: 'step1' },
    rules: [required('姓名')],
  },
  {
    type: 'input',
    prop: 'idCard',
    label: '身份证号',
    placeholder: '请输入身份证号',
    layout: { step: 'step1' },
    rules: [required('身份证号')],
  },
  {
    type: 'datePicker',
    prop: 'birthday',
    label: '出生日期',
    layout: { step: 'step1' },
    attrs: { type: 'date' },
  },
  {
    type: 'radio',
    prop: 'gender',
    label: '性别',
    layout: { step: 'step1' },
    children: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
    rules: [required('性别')],
  },

  // 第二步：联系方式
  {
    type: 'input',
    prop: 'phone',
    label: '手机号码',
    placeholder: '请输入手机号码',
    layout: { step: 'step2' },
    rules: [required('手机号码')],
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱地址',
    placeholder: '请输入邮箱地址',
    layout: { step: 'step2' },
    rules: [required('邮箱地址'), email('邮箱地址')],
  },
  {
    type: 'input',
    prop: 'address',
    label: '联系地址',
    placeholder: '请输入详细地址',
    layout: { step: 'step2' },
  },
  {
    type: 'input',
    prop: 'company',
    label: '工作单位',
    placeholder: '请输入工作单位',
    layout: { step: 'step2' },
  },

  // 第三步：安全设置
  {
    type: 'input',
    prop: 'password',
    label: '登录密码',
    placeholder: '请输入密码',
    layout: { step: 'step3' },
    attrs: { type: 'password', showPasswordOn: 'click' },
    rules: [required('密码'), length('密码', 6, 20)],
  },
  {
    type: 'input',
    prop: 'confirmPassword',
    label: '确认密码',
    placeholder: '请再次输入密码',
    layout: { step: 'step3' },
    attrs: { type: 'password', showPasswordOn: 'click' },
    rules: [
      required('确认密码'),
      {
        validator: (_rule: unknown, value: string) => {
          if (value && value !== formData.password) {
            return Promise.reject(new Error('两次密码输入不一致'))
          }
          return Promise.resolve()
        },
      },
    ],
  },
  {
    type: 'input',
    prop: 'securityQuestion',
    label: '密保问题',
    placeholder: '请输入密保问题',
    layout: { step: 'step3' },
  },
  {
    type: 'input',
    prop: 'securityAnswer',
    label: '密保答案',
    placeholder: '请输入密保答案',
    layout: { step: 'step3' },
  },

  // 第四步：确认提交
  {
    type: 'checkbox',
    prop: 'agreements',
    label: '同意协议',
    layout: { step: 'step4' },
    children: [
      { label: '我已阅读并同意《用户协议》', value: 'user' },
      { label: '我已阅读并同意《隐私政策》', value: 'privacy' },
    ],
    rules: [required('协议')],
  },
  {
    type: 'switch',
    prop: 'newsletter',
    label: '接收邮件通知',
    layout: { step: 'step4' },
  },
  {
    type: 'textarea',
    prop: 'remarks',
    label: '备注信息',
    placeholder: '请输入备注信息（可选）',
    layout: { step: 'step4' },
    attrs: { rows: 3 },
  },
]
