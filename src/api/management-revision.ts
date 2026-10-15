/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @Description: 管理命令使用客户端已读取的版本；禁止自动读取最新版覆盖冲突
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 校验客户端快照版本，缺失时要求重新读取资源。 */
export const requireRevision = (value: number | undefined): number => {
  if (!Number.isSafeInteger(value) || value === undefined || value < 0) {
    throw new Error('资源版本缺失或无效，请刷新后重新操作')
  }
  return value
}

/** 演示写入也比较客户端版本，不接受旧页面覆盖新记录。 */
export const assertMockRevision = (
  actual: number | undefined,
  expected: number | undefined
): void => {
  if (requireRevision(expected) !== (actual ?? 0)) {
    throw new Error('数据已被其他操作修改，请刷新后重试')
  }
}
