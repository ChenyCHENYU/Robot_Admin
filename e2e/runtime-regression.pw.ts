/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\runtime-regression.pw.ts
 * @Description: 正式组件产物的大数据与反复挂载资源回归；耗时/内存仅报告
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  expect,
  test,
  type JSHandle,
  type Page,
  type TestInfo,
} from '@playwright/test'
import {
  installRuntimeResourceProbe,
  type RuntimeResources,
} from './runtime-resource-probe'

/* eslint-disable no-await-in-loop -- 挂载、交互、卸载必须串行，才能验证同一页面多轮资源释放。 */

const CYCLES = 12
const ITEM_COUNT = 1200
const FIELD_COUNT = 240
const WATERFALL_DOM_LIMIT = 120
const pageErrors = new WeakMap<Page, string[]>()
type Scene =
  '基础' | '瀑布流' | '大表单' | 'Markdown' | '富文本' | '音频' | '视频'

/** 等待 Vue 真正切换至目标场景。 */
async function selectScene(page: Page, scene: Scene): Promise<void> {
  await page
    .getByRole('navigation', { name: '测试场景' })
    .getByRole('button', { name: scene, exact: true })
    .click()
  await expect(page.locator('#current-scene')).toHaveText(scene)
}

/** 获取可复核的原生资源数据；不强制 GC。 */
async function resources(page: Page): Promise<RuntimeResources> {
  return page.evaluate(() => window.__runtimeResources())
}

/** 基础宿主按钮应不受按需载入的编辑器/媒体 CSS 影响。 */
async function hostStyle(page: Page): Promise<Record<string, string>> {
  return page.locator('#baseline-control').evaluate(element => {
    const style = getComputedStyle(element)
    return Object.fromEntries(
      [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'color',
        'backgroundColor',
        'borderTopWidth',
        'borderTopStyle',
        'paddingTop',
        'paddingLeft',
        'boxSizing',
      ].map(key => [key, Reflect.get(style, key)])
    )
  })
}

/** 卸载后观察目标、宿主所有的 Blob URL 与媒体节点必须回到基线。 */
async function expectReleased(
  page: Page,
  baseline: RuntimeResources
): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  )
  await expect
    .poll(async () => {
      const result = await resources(page)
      return {
        resizeTargets: result.resizeTargets,
        intersectionTargets: result.intersectionTargets,
        detachedTargets: result.detachedTargets,
        blobUrls: result.blobUrls,
        mediaNodes: result.mediaNodes,
        programmaticMediaActive: result.programmaticMediaActive,
      }
    })
    .toEqual({
      resizeTargets: baseline.resizeTargets,
      intersectionTargets: baseline.intersectionTargets,
      detachedTargets: baseline.detachedTargets,
      blobUrls: baseline.blobUrls,
      mediaNodes: baseline.mediaNodes,
      programmaticMediaActive: baseline.programmaticMediaActive,
    })
}

/** 同时查找 DOM 媒体和 new Audio() 创建的实际实例，不创建替代播放器。 */
async function activeMedia(
  page: Page,
  kind: 'audio' | 'video'
): Promise<JSHandle<HTMLMediaElement>> {
  await expect
    .poll(() =>
      page.evaluate(
        type =>
          window
            .__runtimeMediaElements(type)
            .filter(
              element =>
                !element.paused ||
                element.getAttribute('src') ||
                element.querySelector('source[src]') ||
                element.readyState !== HTMLMediaElement.HAVE_NOTHING ||
                element.networkState !== HTMLMediaElement.NETWORK_EMPTY
            ).length,
        kind
      )
    )
    .toBe(1)
  return page.evaluateHandle(type => {
    const element = window
      .__runtimeMediaElements(type)
      .find(
        current =>
          !current.paused ||
          current.getAttribute('src') ||
          current.querySelector('source[src]') ||
          current.readyState !== HTMLMediaElement.HAVE_NOTHING ||
          current.networkState !== HTMLMediaElement.NETWORK_EMPTY
      )
    if (!element) throw new Error(`没有加载资源的原生 ${type} 实例`)
    return element
  }, kind)
}

/** 实际解码并推进播放时间；不会替代 load/play 或伪造媒体事件。 */
async function playMedia(media: JSHandle<HTMLMediaElement>): Promise<void> {
  await expect
    .poll(() => media.evaluate(element => element.readyState))
    .toBeGreaterThanOrEqual(1)
  await media.evaluate(async element => {
    element.muted = true
    element.loop = true
    await element.play()
  })
  await expect.poll(() => media.evaluate(element => element.paused)).toBe(false)
  await expect
    .poll(() => media.evaluate(element => element.currentTime))
    .toBeGreaterThan(0)
}

/** 旧实例须停止、移除来源并清空媒体状态；currentSrc 可由浏览器保留为历史值。 */
async function expectMediaReleased(
  media: JSHandle<HTMLMediaElement>
): Promise<void> {
  await expect
    .poll(() =>
      media.evaluate(element => ({
        paused: element.paused,
        source: element.getAttribute('src') || '',
        childSources: element.querySelectorAll('source[src]').length,
        readyState: element.readyState,
        networkState: element.networkState,
      }))
    )
    .toEqual({
      paused: true,
      source: '',
      childSources: 0,
      readyState: 0,
      networkState: 0,
    })
}

/** 保存每个内核自己的数据，避免把观测耗时写成跨机器性能承诺。 */
async function report(
  page: Page,
  testInfo: TestInfo,
  data: Record<string, unknown>
): Promise<void> {
  await testInfo.attach('runtime-measurements', {
    body: JSON.stringify(
      {
        browser: testInfo.project.name,
        version: page.context().browser()?.version(),
        viewport: page.viewportSize(),
        ...data,
        final: await resources(page),
        limits:
          'DOM/observer/URL ownership are asserted. Heap and elapsed time are observations; no forced GC or heap-leak proof.',
      },
      null,
      2
    ),
    contentType: 'application/json',
  })
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  pageErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(installRuntimeResourceProbe)
  await page.goto('/')
  await expect(page.locator('#current-scene')).toHaveText('基础')
})

test.afterEach(async ({ page }, testInfo) => {
  await testInfo.attach('runtime-final-snapshot', {
    body: JSON.stringify(
      {
        resources: await resources(page),
        observers: await page.evaluate(() => window.__runtimeObserverDetails()),
        media: await page.evaluate(() =>
          (['audio', 'video'] as const).flatMap(kind =>
            window.__runtimeMediaElements(kind).map(element => ({
              kind,
              connected: element.isConnected,
              paused: element.paused,
              source: element.getAttribute('src'),
              currentSource: element.currentSrc,
              readyState: element.readyState,
              networkState: element.networkState,
            }))
          )
        ),
        pageErrors: pageErrors.get(page),
      },
      null,
      2
    ),
    contentType: 'application/json',
  })
  expect(pageErrors.get(page)).toEqual([])
})

test('1,200 项窗口化保持 DOM 有界、原始索引与滚动边界，允许关闭', async ({
  page,
}, testInfo) => {
  const baseline = await resources(page)
  const started = performance.now()
  await selectScene(page, '瀑布流')
  const cards = page.locator('.fixture-card')
  await expect(page.locator('[data-item-index="0"]')).toBeVisible()
  await expect.poll(() => cards.count()).toBeLessThan(WATERFALL_DOM_LIMIT)
  const topCount = await cards.count()
  const firstCard = page.locator('[data-waterfall-index="0"]')
  await firstCard.focus()
  await firstCard.press('Tab')
  await expect(page.locator('[data-waterfall-index="1"]')).toBeFocused()
  await page.locator('[data-waterfall-index="1"]').press('Shift+Tab')
  await expect(firstCard).toBeFocused()
  await firstCard.press('End')
  const lastCard = page.locator(`[data-waterfall-index="${ITEM_COUNT - 1}"]`)
  await expect(lastCard).toBeFocused()
  await lastCard.press('Home')
  await expect(firstCard).toBeFocused()
  await page.getByRole('checkbox', { name: '展开卡片详情' }).check()
  for (const width of [1120, 720, 420]) {
    await page.setViewportSize({ width, height: 960 })
    await expect.poll(() => cards.count()).toBeLessThan(WATERFALL_DOM_LIMIT)
    await expect
      .poll(() =>
        cards.evaluateAll(elements => {
          const columns = new Map<number, DOMRect[]>()
          for (const element of elements) {
            const rect = element.getBoundingClientRect()
            const key = Math.round(rect.left)
            const column = columns.get(key) ?? []
            column.push(rect)
            columns.set(key, column)
          }
          let overlaps = 0
          for (const column of columns.values()) {
            column.sort((left, right) => left.top - right.top)
            for (let index = 1; index < column.length; index++) {
              if (column[index].top < column[index - 1].bottom - 1) overlaps++
            }
          }
          return overlaps
        })
      )
      .toBe(0)
  }
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.getByRole('checkbox', { name: '展开卡片详情' }).uncheck()
  await page.locator('#gallery-scroll').evaluate(element => {
    element.scrollTop = element.scrollHeight
  })
  await expect(
    page.locator(`[data-item-index="${ITEM_COUNT - 1}"]`)
  ).toBeVisible()
  await expect.poll(() => cards.count()).toBeLessThan(WATERFALL_DOM_LIMIT)
  const bottomCount = await cards.count()
  await page.locator(`[data-item-index="${ITEM_COUNT - 1}"]`).click()
  await expect(page.locator('#last-selection')).toHaveText(
    `asset-${ITEM_COUNT - 1}:${ITEM_COUNT - 1}`
  )
  await page.getByRole('button', { name: '回到顶部' }).click()
  await expect
    .poll(() =>
      page.locator('#gallery-scroll').evaluate(element => element.scrollTop)
    )
    .toBe(0)
  await expect(page.locator('[data-item-index="0"]')).toBeVisible()
  await page.getByRole('checkbox', { name: '窗口化' }).uncheck()
  await expect(cards).toHaveCount(ITEM_COUNT)
  await page.getByRole('checkbox', { name: '窗口化' }).check()
  await expect.poll(() => cards.count()).toBeLessThan(WATERFALL_DOM_LIMIT)
  const mounted = await resources(page)
  await selectScene(page, '基础')
  await expect(cards).toHaveCount(0)
  await expectReleased(page, baseline)
  for (let cycle = 1; cycle < CYCLES * 2; cycle++) {
    await selectScene(page, '瀑布流')
    await expect(page.locator('[data-item-index="0"]')).toBeVisible()
    await expect.poll(() => cards.count()).toBeLessThan(WATERFALL_DOM_LIMIT)
    await selectScene(page, '基础')
    await expect(cards).toHaveCount(0)
    await expectReleased(page, baseline)
  }
  await report(page, testInfo, {
    items: ITEM_COUNT,
    mounts: CYCLES * 2,
    topCount,
    bottomCount,
    mounted,
    baseline,
    elapsedMs: performance.now() - started,
  })
})

test('240 字段首尾值跨挂载保留，24 次挂载不累积节点或观察目标', async ({
  page,
}, testInfo) => {
  const baseline = await resources(page)
  const samples: number[] = []
  let mounted: RuntimeResources | undefined
  for (let cycle = 0; cycle < CYCLES * 2; cycle++) {
    const started = performance.now()
    await selectScene(page, '大表单')
    await expect(page.locator('.form-scroll input')).toHaveCount(FIELD_COUNT)
    if (cycle === 0) {
      await page
        .getByRole('textbox', { name: '字段 0', exact: true })
        .fill('保留首字段')
      await page
        .getByRole('textbox', { name: '字段 239', exact: true })
        .fill('保留末字段')
      mounted = await resources(page)
    } else {
      await expect(
        page.getByRole('textbox', { name: '字段 0', exact: true })
      ).toHaveValue('保留首字段')
      await expect(
        page.getByRole('textbox', { name: '字段 239', exact: true })
      ).toHaveValue('保留末字段')
    }
    await selectScene(page, '基础')
    await expect(page.locator('.form-scroll')).toHaveCount(0)
    await expectReleased(page, baseline)
    samples.push(performance.now() - started)
  }
  await report(page, testInfo, {
    fields: FIELD_COUNT,
    mounts: samples.length,
    mounted,
    baseline,
    cycleElapsedMs: samples,
  })
})

test('Markdown 与富文本各 12 次交替挂载释放编辑器，宿主按钮样式不变', async ({
  page,
}, testInfo) => {
  const baseline = await resources(page)
  const baselineStyle = await hostStyle(page)
  const samples: {
    scene: string
    elapsedMs: number
    mounted: RuntimeResources
  }[] = []
  for (let cycle = 0; cycle < CYCLES; cycle++) {
    for (const scene of ['Markdown', '富文本'] as const) {
      const started = performance.now()
      await selectScene(page, scene)
      if (scene === 'Markdown') {
        await expect(page.locator('.md-editor .cm-editor')).toBeVisible()
        await expect(page.locator('.md-editor .cm-content')).toContainText(
          '第 1 节'
        )
      } else {
        await expect(
          page.locator('.w-e-text-container [contenteditable="true"]')
        ).toBeVisible()
        await expect(page.locator('.w-e-text-container')).toContainText(
          '验证富文本实例生命周期'
        )
      }
      const mounted = await resources(page)
      await selectScene(page, '基础')
      await expect(
        page.locator('.md-editor,.cm-editor,.w-e-text-container')
      ).toHaveCount(0)
      await expectReleased(page, baseline)
      expect(await hostStyle(page)).toEqual(baselineStyle)
      samples.push({ scene, elapsedMs: performance.now() - started, mounted })
    }
  }
  await report(page, testInfo, {
    mounts: samples.length,
    baseline,
    samples,
    hostStyleUnchanged: true,
  })
})

test('本地音视频各 12 次换源并卸载，媒体停止、src 清空且 Blob 所有权闭环', async ({
  page,
}, testInfo) => {
  const baseline = await resources(page)
  const baselineStyle = await hostStyle(page)
  const capabilities = await page.evaluate(() => ({
    audio: document.createElement('audio').canPlayType('audio/wav'),
    video: document
      .createElement('video')
      .canPlayType('video/webm; codecs="vp9"'),
  }))
  const samples: {
    scene: string
    decoded: boolean
    elapsedMs: number
    mounted: RuntimeResources
    replacedInstance: boolean
  }[] = []
  for (let cycle = 0; cycle < CYCLES; cycle++) {
    for (const scene of ['音频', '视频'] as const) {
      const started = performance.now()
      await selectScene(page, scene)
      const kind: 'audio' | 'video' = scene === '音频' ? 'audio' : 'video'
      // Audio 按真实公开按钮懒创建实例；它不必插入 DOM。
      if (kind === 'audio')
        await page
          .locator('.c-audio-player')
          .getByTitle('播放', { exact: true })
          .click()
      const media = await activeMedia(page, kind)
      const decodeSupported = Boolean(
        scene === '音频' ? capabilities.audio : capabilities.video
      )
      await expect
        .poll(() => media.evaluate(element => element.getAttribute('src')))
        .toBeTruthy()
      const originalSource = await media.evaluate(element =>
        element.getAttribute('src')
      )
      if (decodeSupported) await playMedia(media)
      const mounted = await resources(page)
      await page.getByRole('button', { name: '替换媒体源' }).click()
      await expect
        .poll(() =>
          page.evaluate(
            (type: 'audio' | 'video') =>
              window
                .__runtimeMediaElements(type)
                .map(element => element.getAttribute('src'))
                .filter(Boolean),
            kind
          )
        )
        .not.toContain(originalSource)
      const replacement = await activeMedia(page, kind)
      const replacedInstance = await media.evaluate(
        (element, next) => element !== next,
        replacement
      )
      if (replacedInstance) await expectMediaReleased(media)
      if (decodeSupported) await playMedia(replacement)
      await selectScene(page, '基础')
      await expect(page.locator('audio,video')).toHaveCount(0)
      await expectMediaReleased(replacement)
      await media.dispose()
      await replacement.dispose()
      await expectReleased(page, baseline)
      samples.push({
        scene,
        decoded: decodeSupported,
        elapsedMs: performance.now() - started,
        mounted,
        replacedInstance,
      })
    }
  }
  await report(page, testInfo, {
    mounts: samples.length,
    baseline,
    capabilities,
    samples,
    decodingScope:
      'Only canPlayType-supported local PCM WAV and VP9 WebM; no remote streaming, DRM or broad codec claim.',
    mediaObservation:
      'DOM nodes and programmatic Audio instances are counted separately. Weak references do not force retention; temporary test handles verify explicit pause/source cleanup before disposal. Live-object counts are observations, not GC/leak assertions.',
  })
  expect(await hostStyle(page)).toEqual(baselineStyle)
})

/* eslint-enable no-await-in-loop */
