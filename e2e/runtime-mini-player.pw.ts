/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-31
 * @FilePath: \Robot_Admin\e2e\runtime-mini-player.pw.ts
 * @Description: 真实媒体小窗的固定/自适应尺寸、滚动稳定性、开关和卸载回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'

for (const mode of ['fixed', 'fluid']) {
  test(`${mode} 视频以稳定锚点切换小窗，保留原位并安全停用销毁`, async ({
    page,
  }, info) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    await page.goto(`/mini.html?mode=${mode}`, {
      waitUntil: 'domcontentloaded',
    })
    const anchor = page.locator('.c-video-player-anchor')
    const viewport = page.locator('.c-video-player')
    await expect(anchor).toBeVisible()
    await expect(page.locator('video')).toHaveCount(1)
    await expect
      .poll(() =>
        page
          .locator('video')
          .evaluate(video => (video as HTMLVideoElement).readyState)
      )
      .toBeGreaterThanOrEqual(1)
    await expect(viewport).not.toHaveClass(/is-mini/)
    const before = await anchor.evaluate(element => {
      const box = element.getBoundingClientRect()
      return { top: box.top + scrollY, width: box.width, height: box.height }
    })
    expect(before.height).toBeGreaterThan(0)
    const mediaHeight = await page
      .locator('.xgplayer')
      .evaluate(element => element.getBoundingClientRect().height)
    if (mode === 'fixed') expect(Math.abs(mediaHeight - 360)).toBeLessThan(2)
    else expect(mediaHeight).toBeGreaterThan(0)
    const leavePlayer = () =>
      page.evaluate(
        top => window.scrollTo(0, top),
        before.top + before.height + 260
      )
    await leavePlayer()
    await expect(viewport).toHaveClass(/is-mini/)
    const stability = await viewport.evaluate(async element => {
      const states: boolean[] = []
      const observer = new MutationObserver(() => {
        states.push(element.classList.contains('is-mini'))
      })
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['class'],
      })
      // 至少观察一秒，捕获 fixed 元素重新相交导致的连续回跳。
      await new Promise(resolve => setTimeout(resolve, 1100))
      observer.disconnect()
      const box = element.getBoundingClientRect()
      return {
        mini: element.classList.contains('is-mini'),
        states,
        width: box.width,
        height: box.height,
      }
    })
    expect(stability.mini).toBe(true)
    expect(stability.states.every(Boolean)).toBe(true)
    expect(Math.abs(stability.width - 320)).toBeLessThan(2)
    expect(Math.abs(stability.height - 180)).toBeLessThan(2)
    const floatingMedia = await page.locator('.xgplayer').evaluate(element => {
      const box = element.getBoundingClientRect()
      return { width: box.width, height: box.height }
    })
    expect(Math.abs(floatingMedia.width - 320)).toBeLessThan(2)
    expect(Math.abs(floatingMedia.height - 180)).toBeLessThan(2)
    const floatingAnchor = await anchor.evaluate(element => {
      const box = element.getBoundingClientRect()
      return {
        top: box.top + scrollY,
        height: box.height,
        position: getComputedStyle(element).position,
      }
    })
    expect(floatingAnchor.position).not.toBe('fixed')
    expect(Math.abs(floatingAnchor.height - before.height)).toBeLessThan(2)
    expect(Math.abs(floatingAnchor.top - before.top)).toBeLessThan(2)
    await page.screenshot({ path: info.outputPath(`mini-${mode}-stable.png`) })
    await page.getByRole('button', { name: '回到原位' }).click()
    await expect(viewport).not.toHaveClass(/is-mini/)
    await expect(anchor).toBeVisible()
    await expect
      .poll(() =>
        anchor.evaluate(element => (element as HTMLElement).style.height)
      )
      .toBe('')
    await leavePlayer()
    await expect(viewport).toHaveClass(/is-mini/)
    await page.getByRole('checkbox', { name: '启用小窗' }).uncheck()
    await expect(viewport).not.toHaveClass(/is-mini/)
    await expect
      .poll(() =>
        anchor.evaluate(element => (element as HTMLElement).style.height)
      )
      .toBe('')
    await page.getByRole('checkbox', { name: '启用小窗' }).check()
    await expect(viewport).toHaveClass(/is-mini/)
    await page.getByRole('button', { name: '卸载播放器' }).click()
    await expect(page.locator('#mount-state')).toHaveText('unmounted')
    await expect(page.locator('video')).toHaveCount(0)
    await expect(anchor).toHaveCount(0)
    const eventsAfterUnmount = await page.locator('#media-events').textContent()
    // 继续产生真实滚动，并跨越 IO 的异步通知，卸载后不能回写或重新出现小窗。
    await page.evaluate(async () => {
      window.scrollTo(0, 0)
      await new Promise(resolve => requestAnimationFrame(resolve))
      window.scrollTo(0, 1000)
      await new Promise(resolve => setTimeout(resolve, 1100))
    })
    await expect(page.locator('.is-mini')).toHaveCount(0)
    await expect(page.locator('#media-events')).toHaveText(eventsAfterUnmount!)
    await expect(page.locator('#media-errors')).toHaveText('0')
    expect(pageErrors).toEqual([])
    await info.attach('mini-player-metrics', {
      body: JSON.stringify({ mode, before, stability, floatingAnchor }),
      contentType: 'application/json',
    })
  })
}
