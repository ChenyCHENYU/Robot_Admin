/**
 * 表单验证工具函数
 * 从 apps/admin/src/utils/v_verify.ts 提取
 */

/**
 * 验证邮箱格式
 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * 验证手机号（中国大陆）
 */
export function isMobile(value: string): boolean {
  return /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(value)
}

/**
 * 验证身份证号
 */
export function isIdCard(value: string): boolean {
  return /^\d{15}$|^\d{18}$|^\d{17}[\dXx]$/.test(value)
}

/**
 * 验证 URL 格式
 */
export function isUrl(value: string): boolean {
  return /^https?:\/\/.+/.test(value)
}

/**
 * 验证 IP 地址
 */
export function isIP(value: string): boolean {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    value
  )
}

/**
 * 验证用户名（字母数字下划线，3-20位）
 */
export function isUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(value)
}

/**
 * 验证强密码（包含大小写字母和数字，6-20位）
 */
export function isStrongPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/.test(value)
}

/**
 * 验证是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 验证字符串长度
 */
export function isLength(
  value: string,
  min: number,
  max?: number
): boolean {
  const len = String(value).length
  if (max !== undefined) {
    return len >= min && len <= max
  }
  return len >= min
}

/**
 * 验证数字范围
 */
export function isInRange(value: number, min: number, max: number): boolean {
  const num = Number(value)
  if (isNaN(num)) return false
  return num >= min && num <= max
}

/**
 * 验证是否为纯数字
 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value)
}

/**
 * 验证是否只包含中文
 */
export function isChinese(value: string): boolean {
  return /^[\u4e00-\u9fff]+$/.test(value)
}
