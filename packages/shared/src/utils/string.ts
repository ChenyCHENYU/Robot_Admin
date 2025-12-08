/**
 * 字符串处理工具函数
 */

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 驼峰转kebab
 * @example camelToKebab('helloWorld') => 'hello-world'
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * kebab转驼峰
 * @example kebabToCamel('hello-world') => 'helloWorld'
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 下划线转驼峰
 * @example snakeToCamel('hello_world') => 'helloWorld'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 驼峰转下划线
 * @example camelToSnake('helloWorld') => 'hello_world'
 */
export function camelToSnake(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * 截断字符串并添加省略号
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length) + suffix
}

/**
 * 移除字符串中的 HTML 标签
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 生成随机字符串
 */
export function randomString(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 字符串脱敏
 * @example maskString('13800138000', 3, 4) => '138****8000'
 */
export function maskString(
  str: string,
  start: number,
  end: number,
  mask = '*'
): string {
  if (str.length <= start + end) return str
  const maskLength = str.length - start - end
  return str.slice(0, start) + mask.repeat(maskLength) + str.slice(-end)
}
