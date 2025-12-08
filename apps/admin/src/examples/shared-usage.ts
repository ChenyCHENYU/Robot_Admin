/**
 * @robot/shared 使用示例
 * 展示如何在 admin 应用中使用共享工具包
 */

import {
  // 类名处理
  cn,
  
  // 验证函数
  isEmail,
  isMobile,
  isEmpty,
  
  // 字符串处理
  capitalize,
  truncate,
  maskString,
  randomString,
  
  // 日期处理
  formatDate,
  getRelativeTime,
  isToday,
  getDateRange,
  
  // 数组处理
  unique,
  groupBy,
  chunk,
  shuffle,
  
  // 对象处理
  deepClone,
  pick,
  omit,
  get,
  isEmptyObject,
  
  // 类型
  type ID,
  type ObjectValues,
  
  // 常量
  REGEX,
} from '@robot/shared'

// ===== 示例 1: 类名处理 =====
export function buttonClass(variant: 'primary' | 'secondary', disabled: boolean) {
  return cn(
    'btn',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-disabled': disabled,
    }
  )
}

// ===== 示例 2: 表单验证 =====
export function validateUserInput(data: {
  email: string
  phone: string
  name: string
}) {
  const errors: Record<string, string> = {}
  
  if (isEmpty(data.email)) {
    errors.email = '邮箱不能为空'
  } else if (!isEmail(data.email)) {
    errors.email = '邮箱格式错误'
  }
  
  if (!isEmpty(data.phone) && !isMobile(data.phone)) {
    errors.phone = '手机号格式错误'
  }
  
  return { valid: Object.keys(errors).length === 0, errors }
}

// ===== 示例 3: 字符串处理 =====
export function displayUserInfo(name: string, phone: string) {
  return {
    displayName: capitalize(name),
    maskedPhone: maskString(phone, 3, 4), // 138****8000
    userId: randomString(8),
  }
}

// ===== 示例 4: 日期处理 =====
export function formatTimestamps(createTime: Date, updateTime: Date) {
  return {
    created: formatDate(createTime, 'YYYY-MM-DD HH:mm:ss'),
    updated: formatDate(updateTime, 'YYYY-MM-DD HH:mm:ss'),
    relativeTime: getRelativeTime(updateTime),
    isUpdatedToday: isToday(updateTime),
  }
}

// 获取本周日期范围
export function getWeekRange() {
  const [start, end] = getDateRange('week')
  return {
    start: formatDate(start, 'YYYY-MM-DD'),
    end: formatDate(end, 'YYYY-MM-DD'),
  }
}

// ===== 示例 5: 数组处理 =====
export function processUsers(users: any[]) {
  // 去重
  const uniqueUsers = unique(users)
  
  // 按部门分组
  const byDept = groupBy(uniqueUsers, 'deptId')
  
  // 分页
  const pages = chunk(uniqueUsers, 10)
  
  // 随机排序
  const shuffled = shuffle(uniqueUsers)
  
  return { uniqueUsers, byDept, pages, shuffled }
}

// ===== 示例 6: 对象处理 =====
export function cloneAndModifyUser(user: any) {
  // 深拷贝避免修改原对象
  const cloned = deepClone(user)
  
  // 只选择需要的字段
  const userInfo = pick(cloned, ['id', 'name', 'email'])
  
  // 排除敏感字段
  const safeData = omit(cloned, ['password', 'token'])
  
  // 安全获取嵌套属性
  const deptName = get(cloned, 'dept.name', '未知部门')
  
  return { userInfo, safeData, deptName }
}

// ===== 示例 7: 使用正则常量 =====
export function quickValidate(value: string, type: 'email' | 'phone' | 'url') {
  const patterns = {
    email: REGEX.EMAIL,
    phone: REGEX.PHONE,
    url: REGEX.URL,
  }
  return patterns[type].test(value)
}

// ===== 示例 8: 类型安全 =====
interface User {
  id: ID
  name: string
  roles: string[]
}

const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const

type Status = ObjectValues<typeof STATUS>

export function getUserStatus(user: User): Status {
  return STATUS.ACTIVE
}
