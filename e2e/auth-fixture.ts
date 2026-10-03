/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-02
 * @FilePath: \Robot_Admin\e2e\auth-fixture.ts
 * @Description: 生产预览浏览器测试的企业管理员会话 fixture
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Page } from '@playwright/test'

/** 在页面脚本执行前注入与演示公司一致的管理员上下文。 */
export const installMockAdminSession = (page: Page): Promise<void> =>
  page.addInitScript(() => {
    if (sessionStorage.getItem('__e2e_auth_seeded__')) return
    sessionStorage.setItem('__e2e_auth_seeded__', '1')
    const context = {
      id: 'jinheng-nanjing',
      isPrimary: true,
      tenantId: 'jiangsu-jinheng',
      tenantName: '江苏金恒',
      companyId: 'nanjing',
      companyName: '江苏金恒（南京）',
      roles: [{ id: 'platform-admin', name: '企业管理员' }],
    }
    const contexts = [
      context,
      {
        id: 'jinheng-xian',
        isPrimary: false,
        tenantId: 'jiangsu-jinheng',
        tenantName: '江苏金恒',
        companyId: 'xian',
        companyName: '江苏金恒（西安）',
        roles: [{ id: 'operations-manager', name: '运营经理' }],
      },
      {
        id: 'tianzhi-xian',
        isPrimary: false,
        tenantId: 'xian-tianzhi',
        tenantName: '西安天智',
        companyId: 'xian',
        companyName: '西安天智',
        roles: [{ id: 'auditor', name: '只读审计' }],
      },
    ]
    localStorage.setItem(
      'token',
      JSON.stringify('mock-access.jinheng-nanjing.e2e')
    )
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ username: 'CHENY', displayName: 'CHENY' })
    )
    localStorage.setItem(
      'refresh_token',
      JSON.stringify('mock-refresh.jinheng-nanjing.e2e')
    )
    localStorage.setItem('authContexts', JSON.stringify(contexts))
    localStorage.setItem('activeAuthContext', JSON.stringify(context))
  })
