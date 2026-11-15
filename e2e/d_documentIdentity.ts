/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-15
 * @FilePath: \Robot_Admin\e2e\d_documentIdentity.ts
 * @Description: 以原始 Document 对象验证同文档导航，避免将时间戳精度当作文档身份
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, type JSHandle, type Page } from '@playwright/test'

/** 直接检查对象身份；完整导航会使旧执行上下文失效，断言失败后仍释放句柄。 */
export async function expectSameDocument(
  page: Page,
  original: JSHandle<Document>
) {
  try {
    expect(await page.evaluate(held => held === document, original)).toBe(true)
  } finally {
    await original.dispose()
  }
}
