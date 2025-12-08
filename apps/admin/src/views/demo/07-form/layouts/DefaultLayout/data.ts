import type { FormOption } from '@/types/modules/form'
import { PRESET_RULES, RULE_COMBOS } from '@/utils/v_verify'

/**
 * 表单字段配置
 */
export const formOptions: FormOption[] = [
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
    rules: [PRESET_RULES.required('年龄'), PRESET_RULES.range('年龄', 1, 120)],
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
    rules: [PRESET_RULES.required('地址'), PRESET_RULES.length('地址', 5, 200)],
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

/**
 * 表单提示消息
 */
export const FORM_MESSAGES = {
  SUBMIT_SUCCESS: '默认布局表单提交成功！',
  VALIDATE_ERROR: '表单验证失败，请检查输入',
  RESET_INFO: '表单已重置',
  SUBMITTING: '提交中...',
  SUBMIT_TEXT: '提交表单',
  RESET_TEXT: '重置表单',
} as const
