/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\e2e\demo-workspaces.pw.ts
 * @Description: 样式切页、离线图标与场景交互的正式产物回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('首次进入已有 UnoCSS 图标，断网与失效图片保留离线回退和正确尺寸', async ({
  page,
}) => {
  await page.route(
    /api\.iconify\.design|api\.simplesvg\.com|api\.unisvg\.com/,
    route => route.abort()
  )
  await page.goto('/#/demo/icon')
  const uno = page
    .locator('.demo-card')
    .filter({ has: page.locator('.card-badge', { hasText: /^unocss$/ }) })
  await expect(uno.locator('.c-icon--unocss')).toHaveCount(4)
  expect(
    await uno
      .locator('.c-icon--unocss > span')
      .evaluateAll(items =>
        items.every(item => getComputedStyle(item).maskImage !== 'none')
      )
  ).toBe(true)
  const sizes = await uno
    .locator('.c-icon')
    .evaluateAll(items => items.map(item => item.getBoundingClientRect().width))
  expect(sizes).toEqual([18, 24, 32, 18])
  const errors = page
    .locator('.demo-card')
    .filter({ has: page.locator('.card-badge', { hasText: /^error$/ }) })
  await expect(errors.locator('.c-icon--error svg')).toHaveCount(3, {
    timeout: 8000,
  })
})

test('连续切页与返回不改变侧栏可见性和正文颜色', async ({ page }) => {
  await page.goto('/#/home')
  const sidebar = page.locator('.menu-scroll-container')
  await expect(sidebar).toBeVisible()
  // 首页会从选中强调色切回普通色；取本链始终未选中的同一项判断样式污染。
  const unchangedMenu = page
    .locator('.n-menu-item-content-header')
    .filter({ hasText: /^仪表盘$/ })
    .first()
  const color = await unchangedMenu.evaluate(
    element => getComputedStyle(element).color
  )
  const pages = [
    ['/demo/steps', '.steps-demo'],
    ['/demo/date', '.date-demo'],
    ['/demo/city', '.city-demo-page'],
    ['/plugins/chat', '.conversation-workspace'],
    ['/plugins/timeline', '.release-journal'],
    ['/plugins/context-menu', '.resource-workspace'],
    ['/plugins/audio-player', '.sound-lab'],
    ['/home', '.project-homepage'],
  ]
  // 切页验证依赖前一个页面已完成，保持浏览器事件顺序。
  await pages.reduce(async (previous, [route, root]) => {
    await previous
    await page.evaluate(path => {
      location.hash = '#' + path
    }, route)
    await expect(page.locator(root)).toBeVisible()
    await expect(sidebar).toBeVisible()
    expect(
      await unchangedMenu.evaluate(element => getComputedStyle(element).color)
    ).toBe(color)
    await expect(page.locator('.driver-overlay,.n-modal-mask')).toHaveCount(0)
  }, Promise.resolve())
})

test('分配可实时预览、撤销和切换独立场景', async ({ page }) => {
  await page.goto('/#/demo/transfer')
  const count = page.locator('.selection-count b')
  const initial = await count.textContent()
  await page
    .locator('.c-transfer__panel')
    .first()
    .locator('.c-transfer__item:not(.is-disabled)')
    .first()
    .click()
  await page.getByRole('button', { name: '移至已选列表', exact: true }).click()
  await expect(count).not.toHaveText(initial!)
  await page.getByRole('button', { name: '撤销修改', exact: true }).click()
  await expect(count).toHaveText(initial!)
  await page.getByRole('button', { name: '模块装配' }).click()
  await expect(page.locator('.assignment-editor h2')).toHaveText('模块装配')
})

test('复制演示保留 JSON 格式、无效 JSON 回退、剪贴板读取和历史清除', async ({
  page,
}) => {
  await page.addInitScript(() => {
    let copied = ''
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied = text
        },
        readText: async () => copied,
      },
    })
  })
  await page.goto('/#/hooks/copy-text')
  const json = page.getByPlaceholder('输入 JSON 数据')
  const lastCopy = page.locator('.last-copied-content')
  await json.fill('{"status": 0}')
  await page.getByRole('button', { name: '格式化复制', exact: true }).click()
  await expect(lastCopy).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    '{\n  "status": 0\n}'
  )
  await json.fill('{"status":')
  await page.getByRole('button', { name: '格式化复制', exact: true }).click()
  await expect(lastCopy).toHaveText('{"status":')
  await page.getByRole('button', { name: '读取剪贴板', exact: true }).click()
  await expect(page.locator('.clipboard-result')).toContainText('{"status":')
  await page.getByRole('button', { name: '清除历史', exact: true }).click()
  await expect(lastCopy).toHaveCount(0)
})

test('头像场景切换同步人员与各自的溢出操作', async ({ page }) => {
  await page.route('https://i.pravatar.cc/**', route => route.abort())
  await page.goto('/#/demo/avatar-group')
  const preview = page.locator('.avatar-preview')
  const log = page.locator('.click-log__item').first()
  await expect(preview.locator('.c-avatar-group__overflow')).toHaveText('+3')
  await page.getByText('任务分配', { exact: true }).click()
  await preview.locator('.c-avatar-group__item').first().click()
  await expect(log).toContainText('前端小组')
  await page.getByText('项目贡献者', { exact: true }).click()
  const overflow = preview.locator('.c-avatar-group__overflow')
  await expect(overflow).toHaveText('+7')
  await overflow.click()
  await expect(log).toContainText('还有 7 人')
})

test('拖拽反馈记录移动坐标并在松手时累计次数', async ({ page }) => {
  await page.goto('/#/directives/drag-direct')
  const box = page.getByText('动态配置', { exact: true })
  await box.hover()
  const bounds = (await box.boundingBox())!
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await page.mouse.down()
  await expect(page.getByText('拖拽状态: 拖拽中')).toBeVisible()
  await page.mouse.move(x + 50, y + 32, { steps: 5 })
  await expect(page.getByText(/位置: \(-?\d+,\s*-?\d+\)/)).toBeVisible()
  await page.mouse.up()
  await expect(page.getByText('拖拽状态: 拖拽完成')).toBeVisible()
  await expect(page.getByText('拖拽次数: 1')).toBeVisible()
})

test('脚本助手展示预设回复，会话标题正确且支持本地附件下载', async ({
  page,
}) => {
  await page.goto('/#/plugins/chat')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'sample.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('local attachment'),
  })
  const download = page.waitForEvent('download')
  await page.locator('.c-chat__msg-file').click()
  expect((await download).suggestedFilename()).toBe('sample.txt')
  await page.getByRole('button', { name: '脚本助手', exact: true }).click()
  await expect(page.locator('.c-chat__header')).toContainText('脚本助手')
  await page.locator('.conversation-starters button').first().click()
  await expect(page.locator('.c-chat__messages')).toContainText(
    '预设的演示回复'
  )
})

test('时间线从真实发布记录切换为验证流程定义', async ({ page }) => {
  await page.goto('/#/plugins/timeline')
  await expect(page.locator('.journal-source')).toContainText('CHANGELOG.md')
  await page.getByRole('button', { name: '验证流程' }).click()
  await expect(page.locator('.journal-content')).toContainText('bun run')
  await expect(page.locator('.journal-source')).toContainText(
    '不表示这些步骤正在执行'
  )
  await page.getByRole('button', { name: '发布记录' }).click()
  await page
    .getByRole('button', { name: '展开详情', exact: true })
    .first()
    .click()
  await expect(page.locator('.journal-controls')).toContainText('收起详情')
})

test('资源菜单支持右键、键盘调用、创建副本和撤销移除', async ({ page }) => {
  await page.goto('/#/plugins/context-menu')
  const rows = page.locator('.resource-row')
  await rows.first().click({ button: 'right' })
  await page.getByText('创建副本', { exact: true }).click()
  await expect(rows).toHaveCount(5)
  await rows.last().focus()
  await page.keyboard.press('Shift+F10')
  await page.getByText('移除本地副本', { exact: true }).click()
  await expect(rows).toHaveCount(4)
  await page.getByRole('button', { name: '撤销移除', exact: true }).click()
  await expect(rows).toHaveCount(5)
  await rows.first().click({ button: 'right' })
  const copy = page.getByText('复制', { exact: true }).locator('..')
  await copy.focus()
  await copy.press('ArrowRight')
  const copyName = page.getByText('复制文件名', { exact: true }).locator('..')
  await expect(copyName).toBeFocused()
  await copyName.press('ArrowLeft')
  await expect(copy).toBeFocused()
  await copy.press('Escape')
  await expect(page.locator('.c-context-menu')).toHaveCount(0)
})

test('菜单忽略打开前的滚动通知和无关区域滚动，目标真正移动时关闭', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/#/plugins/context-menu')
  // 通过真实点击确认启动遮罩已消失，目标在可交互的视口中。
  await page.locator('.resource-row').first().click()
  await page.evaluate(() => {
    const container = document.querySelector<HTMLElement>(
      '.n-layout-content > .n-layout-scroll-container'
    )!
    const row = document.querySelector<HTMLElement>('.resource-row')!
    const rect = row.getBoundingClientRect()
    row.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + 30,
        clientY: rect.top + 20,
      })
    )
    // 模拟位置已经改变、通知晚于打开菜单到达的浏览器事件顺序。
    container.dispatchEvent(new Event('scroll'))
    document
      .querySelector('.menu-scroll-container')
      ?.dispatchEvent(new Event('scroll'))
  })
  await expect(page.locator('.c-context-menu').first()).toBeVisible()
  await page.evaluate(() => {
    const container = document.querySelector<HTMLElement>(
      '.n-layout-content > .n-layout-scroll-container'
    )!
    container.scrollTop = container.scrollTop > 0 ? 0 : 40
    container.dispatchEvent(new Event('scroll'))
  })
  await expect(page.locator('.c-context-menu')).toHaveCount(0)
})

test('音频不自动播放，支持定位、切曲，离开页面后实际暂停', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.Audio
    const audios: HTMLAudioElement[] = []
    Object.assign(window, { __robotTestAudios: audios })
    window.Audio = new Proxy(Original, {
      /** 仅在测试上下文观测真实 Audio 实例。 */
      construct(target, args) {
        const audio = new target(...args)
        audios.push(audio)
        return audio
      },
    })
  })
  await page.goto('/#/plugins/audio-player')
  await expect(page.getByTitle('播放', { exact: true })).toBeVisible()
  expect(
    await page.evaluate(() =>
      (Reflect.get(window, '__robotTestAudios') as HTMLAudioElement[]).every(
        audio => audio.paused
      )
    )
  ).toBe(true)
  await page.getByTitle('播放', { exact: true }).click()
  await expect(page.getByTitle('暂停', { exact: true })).toBeVisible()
  const progress = page.getByRole('slider', { name: '播放进度' })
  await progress.focus()
  await page.keyboard.press('ArrowRight')
  await expect(progress).toHaveAttribute('aria-valuenow', /^[5-9]/)
  await page.getByTitle('下一曲', { exact: true }).click()
  await expect(page.locator('.sound-identity h2')).toHaveText('脉冲节奏')
  await page.evaluate(() => {
    location.hash = '#/home'
  })
  await expect(page.locator('.project-homepage')).toBeVisible()
  expect(
    await page.evaluate(() =>
      (Reflect.get(window, '__robotTestAudios') as HTMLAudioElement[]).every(
        audio => audio.paused
      )
    )
  ).toBe(true)
})

test('成本台账最后一页不跳高，分厂下钻和导出口径一致', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/#/large-screen/production-cost')
  await expect(page.locator('.cost-ledger tbody')).toBeVisible()
  const { height } = (await page.locator('.cost-table-scroll').boundingBox())!
  await page.getByLabel('下一页台账').click()
  await page.getByLabel('下一页台账').click()
  await page.getByLabel('下一页台账').click()
  expect(
    Math.abs(
      (await page.locator('.cost-table-scroll').boundingBox())!.height - height
    )
  ).toBeLessThan(2)
  await page.locator('.plant-list button').first().click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出当前范围', exact: true }).click()
  const content = JSON.parse(
    await readFile((await (await download).path())!, 'utf8')
  )
  expect(content.source).toBe('deterministic-demo')
  expect(content.rows).toHaveLength(1)
  expect(content.summary.actual).toBe(content.rows[0].actual)
  expect(content.summary.unit).toBe(
    content.rows[0].actual / content.rows[0].quantity
  )
})
