/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-04
 * @Description: SDK 辅助工具 - 自动解包响应并处理错误
 */

/**
 * 包装 SDK 函数，自动解包 { data, error } 响应格式
 * @param fn SDK 生成的 API 函数
 * @returns 解包后的函数，直接返回 data 或抛出 error
 *
 * @example
 * ```ts
 * const deleteEmployee = unwrapSdk(deleteEmployeesById)
 * const result = await deleteEmployee({ path: { id: 1 } })
 * // 直接得到 data，无需解构
 * ```
 */
export const unwrapSdk = <Fn extends (...args: any[]) => Promise<any>>(
  fn: Fn
) => {
  return async (...args: Parameters<Fn>) => {
    const { data, error } = await fn(...args)
    if (error) throw error
    return data
  }
}
