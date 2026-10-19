/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @FilePath: \Robot_Admin\e2e\component-release-recovery.pw.ts
 * @Description: 正式组件包的展开表间距、文档清空、真实媒体与跨日消费验收
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1100 })
})

test('展开表功能列保持紧凑，全部展开、子表清空和密度切换真实生效', async ({
  page,
}, info) => {
  await page.goto('/#/demo/table-manage/table-expand')
  const table = page.locator('.table-expand-demo .c-table-wrapper')
  await expect(table).toHaveClass(/c-table-wrapper--compact/)
  await expect(table.locator('tbody tr').first()).toBeVisible()
  const widths = await table
    .locator('thead')
    .first()
    .locator('th')
    .evaluateAll(cells =>
      cells.slice(0, 3).map(cell => cell.getBoundingClientRect().width)
    )
  for (const [index, expected] of [40, 40, 50].entries())
    expect(Math.abs(widths[index] - expected)).toBeLessThanOrEqual(1)
  await page.getByRole('button', { name: '全部展开', exact: true }).click()
  const details = table.locator('.nested-table-detail')
  await expect.poll(() => details.count()).toBeGreaterThan(0)
  const detail = details.first()
  expect(
    await detail.evaluate(element => getComputedStyle(element).paddingTop)
  ).toBe('8px')
  const child = detail.locator('.n-data-table')
  const childWidths = await child
    .locator('thead th')
    .evaluateAll(cells =>
      cells.slice(0, 2).map(cell => cell.getBoundingClientRect().width)
    )
  for (const [index, expected] of [40, 50].entries())
    expect(Math.abs(childWidths[index] - expected)).toBeLessThanOrEqual(1)
  // 选择格始终为零内边距；密度留白取实际业务格，避免把功能列当正文测量。
  const compactPadding = await child
    .locator('tbody td[data-col-key="project"]')
    .first()
    .evaluate(element => getComputedStyle(element).paddingTop)
  expect(compactPadding).toBe(
    await table
      .locator('tbody td[data-col-key="name"]')
      .first()
      .evaluate(element => getComputedStyle(element).paddingTop)
  )
  const firstCheck = child.locator('tbody').getByRole('checkbox').first()
  await firstCheck.click()
  await expect(firstCheck).toBeChecked()
  await page.getByRole('button', { name: '清空所有选择', exact: true }).click()
  await expect(firstCheck).not.toBeChecked()
  await page
    .locator('label.n-radio-button')
    .filter({ has: page.getByRole('radio', { name: '舒适', exact: true }) })
    .click()
  await expect(table).toHaveClass(/c-table-wrapper--comfortable/)
  const comfortablePadding = await child
    .locator('tbody td[data-col-key="project"]')
    .first()
    .evaluate(element => getComputedStyle(element).paddingTop)
  expect(parseFloat(comfortablePadding)).toBeGreaterThan(
    parseFloat(compactPadding)
  )
  expect(comfortablePadding).toBe(
    await table
      .locator('tbody td[data-col-key="name"]')
      .first()
      .evaluate(element => getComputedStyle(element).paddingTop)
  )
  const indexTitleLines = await child
    .locator('thead th[data-col-key="_index"]')
    .evaluate(header => {
      const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        if (node.textContent?.trim() === '序号') {
          const range = document.createRange()
          range.selectNodeContents(node)
          return range.getClientRects().length
        }
        node = walker.nextNode()
      }
      throw new Error('缺少子表序号标题')
    })
  expect(indexTitleLines).toBe(1)
  await page
    .locator('.table-expand-demo')
    .screenshot({ path: info.outputPath('expand-spacing.png') })
  await page.getByRole('button', { name: '全部折叠', exact: true }).click()
  await expect(details).toHaveCount(0)
})

test('文档工作台无刷新切源，清空后旧正文退出并能恢复', async ({ page }) => {
  await page.goto('/#/plugins/file-preview')
  const preview = page.locator('.document-preview')
  await expect(preview).toContainText(
    '把需求、设计与交付放在同一条清晰的协作路径中'
  )
  await preview
    .locator('.c-file-preview-wrapper')
    .evaluate(element => element.setAttribute('data-instance', 'retained'))
  await page.getByRole('button', { name: /迭代交付计划.xlsx/ }).click()
  await expect(preview).toContainText('需求梳理')
  await expect(preview.locator('[data-instance="retained"]')).toHaveCount(1)
  await page.getByRole('button', { name: '清空文件库', exact: true }).click()
  await expect(preview).toContainText('暂无预览文件')
  await expect(preview).not.toContainText('需求梳理')
  await expect(preview.locator('[data-instance="retained"]')).toHaveCount(1)
  await page.getByRole('button', { name: '恢复示例文件', exact: true }).click()
  await expect(preview).toContainText(
    '把需求、设计与交付放在同一条清晰的协作路径中'
  )
})

test('真实音频切源后释放旧媒体，清空停止，恢复后等待用户播放', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const media: HTMLAudioElement[] = []
    Object.assign(window, { __componentAudio: media })
    window.Audio = new Proxy(window.Audio, {
      /** 观测真实 Audio 实例，保留浏览器原生播放行为。 */
      construct(target, args) {
        const audio = Reflect.construct(target, args) as HTMLAudioElement
        media.push(audio)
        return audio
      },
    })
  })
  await page.goto('/#/plugins/audio-player')
  const player = page.locator('.sound-player .c-audio-player')
  await player.locator('button.is-play').click()
  await expect(page.locator('.playback-state')).toContainText('正在播放')
  await page.getByRole('button', { name: '切换当前音源', exact: true }).click()
  await expect(player.locator('.c-audio-player__title')).toHaveText('脉冲节奏')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const media = (
          window as unknown as { __componentAudio: HTMLAudioElement[] }
        ).__componentAudio
        return media.length >= 2 && media[0].paused && !media.at(-1)!.paused
      })
    )
    .toBe(true)
  await player.evaluate(element =>
    element.setAttribute('data-instance', 'retained')
  )
  await page
    .locator('label.n-radio-button')
    .filter({ has: page.getByRole('radio', { name: '迷你', exact: true }) })
    .click()
  await expect(player).toHaveAttribute('data-instance', 'retained')
  await page.getByRole('button', { name: '清空播放列表', exact: true }).click()
  await expect(player).toContainText('未选择曲目')
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { __componentAudio: HTMLAudioElement[] }
      ).__componentAudio.every(audio => audio.paused)
    )
  ).toBe(true)
  await page.getByRole('button', { name: '恢复示例曲目', exact: true }).click()
  await expect(player.locator('button.is-play')).toHaveAttribute(
    'title',
    '播放'
  )
  await expect(page.locator('.playback-state')).toContainText('等待播放')
})

test('工作台跨日和全天事件仅改标题时完整保留起止与全天状态', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const now = new Date()
    const date = (offset: number, hour = 0) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour)
    const day = (value: Date) =>
      `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
    localStorage.setItem(
      'robot-admin:calendar-workspace:v2',
      JSON.stringify({
        schemaVersion: 1,
        events: [
          {
            id: 'multi',
            title: '跨日回归日程',
            category: 'meeting',
            location: '',
            description: '',
            allDay: false,
            start: date(0, 9).toISOString(),
            end: date(2, 17).toISOString(),
            color: '#5486e8',
          },
          {
            id: 'whole',
            title: '全天回归日程',
            category: 'delivery',
            location: '',
            description: '',
            allDay: true,
            start: day(date(0)),
            end: day(date(3)),
            color: '#9a78dc',
          },
        ],
      })
    )
  })
  await page.goto('/#/plugins/calendar')
  const original = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('robot-admin:calendar-workspace:v2')!)
        .events
  )
  await original.reduce(
    async (
      previous: Promise<void>,
      event: {
        id: string
        title: string
        start: string
        end: string
        allDay: boolean
      }
    ) => {
      await previous
      await page
        .locator('.calendar-agenda__event')
        .filter({ hasText: event.title })
        .click()
      const editor = page.locator('.calendar-editor')
      await editor
        .getByPlaceholder('例如：产品方案评审')
        .fill(event.title + '已修改')
      await editor
        .getByRole('button', { name: '保存日程', exact: true })
        .click()
      await expect(editor).toBeHidden()
      const stored = await page.evaluate(
        id =>
          JSON.parse(
            localStorage.getItem('robot-admin:calendar-workspace:v2')!
          ).events.find((item: { id: string }) => item.id === id),
        event.id
      )
      expect(stored).toMatchObject({
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        title: event.title + '已修改',
      })
    },
    Promise.resolve()
  )
})
