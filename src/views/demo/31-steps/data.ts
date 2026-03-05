/**
 * @Description: 进度步骤条演示页 - 静态数据
 */
import { type StepItem } from '@robot-admin/naive-ui-components'

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

// ================= 基础步骤 =================
export const basicSteps: StepItem[] = [
  { title: '提交订单' },
  { title: '付款成功' },
  { title: '商品出库' },
  { title: '等待收货' },
  { title: '完成' },
]

// ================= 订单跟踪步骤 =================
export const orderSteps: StepItem[] = [
  {
    title: '提交订单',
    time: '2019-03-17 17:01:25',
    icon: 'i-mdi:text-box-check-outline',
  },
  {
    title: '付款成功',
    time: '2019-03-21 00:00:00',
    icon: 'i-mdi:credit-card-check-outline',
  },
  {
    title: '商品出库',
    time: '2019-03-21 07:00:00',
    icon: 'i-mdi:package-variant-closed-check',
  },
  { title: '等待收货', icon: 'i-mdi:truck-delivery-outline' },
  { title: '完成', icon: 'i-mdi:check-circle-outline' },
]

// ================= 项目进度步骤 =================
export const projectSteps: StepItem[] = [
  {
    title: '需求分析',
    description: '收集用户需求',
    time: '2024-01-15',
    status: 'finish' as StepStatus,
  },
  {
    title: 'UI设计',
    description: '界面原型设计',
    time: '2024-01-20',
    status: 'finish' as StepStatus,
  },
  {
    title: '前端开发',
    description: '正在开发中...',
    time: '2024-01-25',
    status: 'process' as StepStatus,
  },
  { title: '测试阶段', description: '等待开发完成' },
  { title: '部署上线', description: '发布到生产环境' },
]

// ================= 审批流程步骤 =================
export const approvalSteps: StepItem[] = [
  { title: '提交申请', description: '张三提交', time: '09:00' },
  { title: '主管审批', description: '李四已批准', time: '10:30' },
  { title: '经理审批', description: '王五已批准', time: '14:20' },
  { title: 'HR备案', description: '处理中', status: 'process' as StepStatus },
  { title: '完成', description: '等待备案' },
]

// ================= 图标步骤 =================
export const iconSteps: StepItem[] = [
  { title: '创建项目', icon: 'i-mdi:folder-plus-outline' },
  { title: '开发功能', icon: 'i-mdi:code-braces' },
  { title: '代码审查', icon: 'i-mdi:account-search-outline' },
  { title: '测试验收', icon: 'i-mdi:clipboard-check-outline' },
  { title: '部署发布', icon: 'i-mdi:rocket-launch-outline' },
]

// ================= 错误状态步骤 =================
export const errorSteps: StepItem[] = [
  {
    title: '创建订单',
    description: '订单创建成功',
    status: 'finish' as StepStatus,
  },
  {
    title: '支付订单',
    description: '支付失败',
    status: 'error' as StepStatus,
  },
  {
    title: '重新支付',
    description: '等待支付',
    status: 'process' as StepStatus,
  },
  { title: '订单完成', description: '等待处理' },
]

// ================= 注册流程步骤 =================
export interface RegisterStepItem extends StepItem {
  detail: string
}

export const registerSteps: RegisterStepItem[] = [
  {
    title: '填写信息',
    icon: 'i-mdi:form-textbox',
    detail:
      '请填写您的基本信息，包括用户名、邮箱和密码。所有带 * 的字段都是必填项。',
  },
  {
    title: '验证邮箱',
    icon: 'i-mdi:email-check-outline',
    detail:
      '我们已经发送了一封验证邮件到您的邮箱，请点击邮件中的链接完成验证。',
  },
  {
    title: '完善资料',
    icon: 'i-mdi:account-details-outline',
    detail: '请完善您的个人资料，这将帮助我们为您提供更好的服务。',
  },
  {
    title: '注册成功',
    icon: 'i-mdi:check-circle-outline',
    detail: '恭喜！您已经成功注册，现在可以开始使用我们的服务了。',
  },
]
