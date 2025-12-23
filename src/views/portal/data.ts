/**
 * Portal 门户页面数据配置
 */

// 应用系统接口
export interface App {
  id: string
  name: string
  icon: string
  color: string
  url?: string
  port?: number
  integrated?: boolean
}

// 待办事项接口
export interface TodoItem {
  id: number
  title: string
  time: string
  statusText: string
  statusClass: 'rejected' | 'progress' | 'done' | 'revoked'
}

// 外部事项接口
export interface ExternalItem {
  id: number
  title: string
  time: string
  color: string
}

// 应用中心项接口
export interface AppCenterItem {
  id: string
  name: string
  icon: string
  bgColor: string
  color: string
}

// 消息接口
export interface Message {
  id: number
  title: string
  time: string
  icon: string
  bgColor: string
  color: string
}

// 日历日期接口
export interface CalendarDate {
  day: number
  isOtherMonth: boolean
  isToday: boolean
  key: string
}

// 系统列表
export const systems: App[] = [
  {
    id: 'base-platform',
    name: '基础平台系统管理',
    icon: 'ri:dashboard-line',
    color: '#7B8DED',
  },
  {
    id: 'robot-admin',
    name: 'Robot Admin 框架系统',
    icon: 'ri:robot-line',
    color: '#5B8FF9',
    url: '/home',
    integrated: true,
  },
  {
    id: 'logistics',
    name: '智慧物流管理系统',
    icon: 'ri:truck-line',
    color: '#6FC5E8',
    port: 3003,
  },
  {
    id: 'procurement',
    name: '大宗采购管理系统',
    icon: 'ri:shopping-cart-line',
    color: '#9254DE',
  },
  {
    id: 'sales',
    name: '销售管理系统',
    icon: 'ri:line-chart-line',
    color: '#52C41A',
  },
  {
    id: 'cost',
    name: '日清月结智慧成本管理系统',
    icon: 'ri:money-dollar-circle-line',
    color: '#FFA940',
  },
  {
    id: 'warehouse',
    name: '仓储管理系统',
    icon: 'ri:archive-line',
    color: '#13C2C2',
  },
  {
    id: 'performance',
    name: '即时绩效管理系统',
    icon: 'ri:bar-chart-box-line',
    color: '#FA8C16',
  },
  {
    id: 'energy',
    name: '能源安环管理系统',
    icon: 'ri:leaf-line',
    color: '#52C41A',
  },
  {
    id: 'equipment',
    name: '设备管理系统',
    icon: 'ri:settings-4-line',
    color: '#FF7875',
  },
]

// 待办事项列表
export const todoList: TodoItem[] = [
  {
    id: 1,
    title: '[测试账号] 的采购合同的一次审批',
    time: '2023-09-08 10:30',
    statusText: '已驳回',
    statusClass: 'rejected',
  },
  {
    id: 2,
    title: '[测试账号] 的采购合同的一次审批，又一次审批',
    time: '2023-09-08 10:30',
    statusText: '进行中',
    statusClass: 'progress',
  },
  {
    id: 3,
    title: '[测试账号] 的采购合同的一次审批',
    time: '2023-09-08 10:30',
    statusText: '已完成',
    statusClass: 'done',
  },
  {
    id: 4,
    title: '[测试账号] 的采购合同的一次审批，又一次审批',
    time: '2023-09-08 10:30',
    statusText: '已撤回',
    statusClass: 'revoked',
  },
]

// 外部事项列表
export const externalItems: ExternalItem[] = [
  { id: 1, title: '您需要进行紧急处理！！', time: '1小时前', color: '#FF6B6B' },
  { id: 2, title: '基础平台4.0正式发布', time: '2小时前', color: '#51CF66' },
  {
    id: 3,
    title: '采购平台有3条需要处理的事项。请尽快办理',
    time: '1周前',
    color: '#4ECDC4',
  },
  { id: 4, title: '基础平台4.0正式发布', time: '2周前', color: '#4ECDC4' },
]

// 应用中心列表
export const appCenterItems: AppCenterItem[] = [
  {
    id: '1',
    name: '协议详情',
    icon: 'ri:file-text-line',
    bgColor: 'rgba(91, 143, 249, 0.15)',
    color: '#5B8FF9',
  },
  {
    id: '2',
    name: '账户流水',
    icon: 'ri:account-box-line',
    bgColor: 'rgba(127, 216, 182, 0.15)',
    color: '#7FD8B6',
  },
  {
    id: '3',
    name: '客户库存',
    icon: 'ri:user-search-line',
    bgColor: 'rgba(123, 143, 237, 0.15)',
    color: '#7B8FED',
  },
  {
    id: '4',
    name: '合同结算',
    icon: 'ri:file-chart-line',
    bgColor: 'rgba(167, 142, 250, 0.15)',
    color: '#A78EFA',
  },
  {
    id: '5',
    name: '仓库档案',
    icon: 'ri:archive-line',
    bgColor: 'rgba(122, 197, 221, 0.15)',
    color: '#7AC5DD',
  },
  {
    id: '6',
    name: '库存预警',
    icon: 'ri:alert-line',
    bgColor: 'rgba(237, 168, 109, 0.15)',
    color: '#EDA86D',
  },
  {
    id: '7',
    name: '表单开发',
    icon: 'ri:file-edit-line',
    bgColor: 'rgba(91, 143, 249, 0.15)',
    color: '#5B8FF9',
  },
  {
    id: '8',
    name: '库存预警',
    icon: 'ri:database-2-line',
    bgColor: 'rgba(107, 184, 174, 0.15)',
    color: '#6BB8AE',
  },
]

// 消息列表
export const messages: Message[] = [
  {
    id: 1,
    title: '基础平台4.0正式发布',
    time: '30分钟前',
    icon: 'ri:message-2-line',
    bgColor: 'rgba(237, 106, 94, 0.15)',
    color: '#ED6A5E',
  },
  {
    id: 2,
    title: '采购平台有3条需要处理的事项。请尽快办理',
    time: '30分钟前',
    icon: 'ri:message-2-line',
    bgColor: 'rgba(81, 207, 102, 0.15)',
    color: '#51CF66',
  },
  {
    id: 3,
    title: '基础平台4.0正式发布',
    time: '30分钟前',
    icon: 'ri:message-2-line',
    bgColor: 'rgba(91, 143, 249, 0.15)',
    color: '#5B8FF9',
  },
  {
    id: 4,
    title: '基础平台4.0正式发布',
    time: '30分钟前',
    icon: 'ri:message-2-line',
    bgColor: 'rgba(237, 106, 94, 0.15)',
    color: '#ED6A5E',
  },
  {
    id: 5,
    title: '基础平台4.0正式发布',
    time: '30分钟前',
    icon: 'ri:message-2-line',
    bgColor: 'rgba(81, 207, 102, 0.15)',
    color: '#51CF66',
  },
]

// 星期数组
export const weekDays = ['一', '二', '三', '四', '五', '六', '日']
