import { expect, type Page } from '@playwright/test'

/** 固定演示拼图的随机目标，真实拖动验证滑块以覆盖交互链路。 */
export const solveDemoCaptcha = async (page: Page) => {
  await page.locator('.c-captcha-modern .captcha-trigger').click()
  const slider = page.locator('.vue-puzzle-vcode.show_ .range-btn')
  await expect(slider).toBeVisible()
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '.vue-puzzle-vcode.show_ .auth-canvas1_'
    )
    const data = canvas?.getContext('2d')?.getImageData(0, 0, 310, 160).data
    return Boolean(
      data &&
      Array.from(data).some((value, index) => index % 4 === 3 && value > 0)
    )
  })
  const box = await slider.boundingBox()
  if (!box) throw new Error('拼图滑块不可见')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 163, y, { steps: 12 })
  await page.mouse.up()
  await expect(
    page.locator('.c-captcha-modern .captcha-trigger.verified')
  ).toBeVisible()
}
