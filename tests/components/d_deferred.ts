/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\components\d_deferred.ts
 * @Description: 控制接口完成顺序，验证真正的竞态和提交锁
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
/** 提供可控的成功和失败，不使用任意等待时间。 */
export const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept
    reject = fail
  })
  return { promise, resolve, reject }
}
