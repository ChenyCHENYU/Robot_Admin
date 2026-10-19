/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\e2e\video-resource-consumption.pw.ts
 * @Description: 正式视频组件同实例切源、清空恢复及真实媒体行为验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test('视频工作台使用正式组件切换本地源并释放空源，不依赖页面重挂载', async ({
  page,
}) => {
  await installMockAdminSession(page)
  // 使用已验证可解码的 VP9/WebM 样例映射公开源，响应 MIME 与实际容器一致。
  const response = await page.request.get('/menu-too-logo.webm')
  const sample = await response.body()
  await page.route('https://vjs.zencdn.net/v/oceans.mp4*', route =>
    route.fulfill({
      contentType: 'video/webm',
      body: sample,
      headers: { 'access-control-allow-origin': '*' },
    })
  )
  await page.route(
    'https://media.w3.org/2010/05/sintel/trailer_hd.mp4*',
    route =>
      route.fulfill({
        contentType: 'video/webm',
        body: sample,
        headers: { 'access-control-allow-origin': '*' },
      })
  )
  await page.goto('/#/plugins/video-player')
  const video = page.locator('.player-wrapper video')
  await expect(video).toHaveCount(1)
  await expect
    .poll(() =>
      video.evaluate(element => (element as HTMLVideoElement).readyState)
    )
    .toBeGreaterThanOrEqual(1)
  // 同源场景切换不应替换正在播放的原生媒体节点。
  await video.evaluate(element =>
    element.setAttribute('data-resource-instance', 'same-source')
  )
  await page.getByRole('button', { name: /在线教育全功能/ }).click()
  await expect(video).toHaveAttribute('data-resource-instance', 'same-source')
  await page.getByRole('button', { name: /基础播放/ }).click()
  await expect(video).toHaveAttribute('data-resource-instance', 'same-source')
  const select = page.getByLabel('演示视频源')
  await select.click()
  await page.getByText('项目内置视频（可离线）', { exact: true }).click()
  await expect
    .poll(() =>
      video.evaluate(element => (element as HTMLVideoElement).currentSrc)
    )
    .toContain('/menu-too-logo.webm')
  await expect
    .poll(() =>
      video.evaluate(element => (element as HTMLVideoElement).readyState)
    )
    .toBeGreaterThanOrEqual(1)
  await video.evaluate(element => {
    void (element as HTMLVideoElement).play()
  })
  await expect
    .poll(() => video.evaluate(element => (element as HTMLVideoElement).paused))
    .toBe(false)
  await page.getByRole('button', { name: '清空视频源', exact: true }).click()
  await expect(video).toHaveCount(0)
  await expect(page.locator('.player-empty')).toContainText('视频源已清空')
  await page.getByRole('button', { name: '恢复视频源', exact: true }).click()
  await expect(video).toHaveCount(1)
  await expect
    .poll(() =>
      video.evaluate(element => (element as HTMLVideoElement).currentSrc)
    )
    .toContain('/menu-too-logo.webm')
})
