/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\tests\components\auth-discovery.component.ts
 * @Description: 显式凭据发现的远端适配与敏感错误隔离合同
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { expect, test, vi } from 'vitest'
import { postData } from '@robot-admin/request-core/axios'
import { getLoginCompaniesApi } from '@/api/auth'
vi.mock('@robot-admin/request-core/axios', () => ({
  getData: vi.fn(),
  postData: vi.fn(),
}))
vi.mock('@/api/auth.contract', async importOriginal => ({
  ...(await importOriginal<typeof import('@/api/auth.contract')>()),
  resolveAuthMode: () => 'remote',
}))
test('账号密码齐备后只在POST体发凭据，不发送任意额外字段或改变密码空格', async () => {
  vi.mocked(postData).mockResolvedValue({ code: '0', data: { companies: [] } })
  await getLoginCompaniesApi({
    username: ' Alice ',
    password: ' valid password ',
  })
  expect(postData).toHaveBeenCalledExactlyOnceWith('/auth/login-companies', {
    username: 'Alice',
    password: ' valid password ',
  })
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(0)
})
test('缺少或空白密码不能发送查询，远端失败统一提示且不传播Axios配置', async () => {
  await expect(
    getLoginCompaniesApi({ username: 'Alice', password: '' })
  ).rejects.toThrow('账号或密码错误')
  await expect(
    getLoginCompaniesApi({ username: 'Alice', password: ' ' })
  ).rejects.toThrow('账号或密码错误')
  expect(postData).not.toHaveBeenCalled()
  vi.mocked(postData).mockRejectedValue({
    message: 'credential-secret',
    config: { data: { password: 'credential-secret' } },
  })
  const error = await getLoginCompaniesApi({
    username: 'Alice',
    password: 'valid',
  }).catch(error => error)
  expect(error.message).toBe('账号或密码错误或验证暂不可用，请重试')
  expect(error.config).toBeUndefined()
  expect(error.cause).toBeUndefined()
  expect(JSON.stringify(error)).not.toContain('secret')
  vi.mocked(postData).mockResolvedValue({
    code: 40102,
    msg: 'disabled',
    data: { companies: [] },
  })
  await expect(
    getLoginCompaniesApi({ username: 'Alice', password: 'valid' })
  ).rejects.toThrow('账号或密码错误或验证暂不可用，请重试')
})
