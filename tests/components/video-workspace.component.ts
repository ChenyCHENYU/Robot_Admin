/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\tests\components\video-workspace.component.ts
 * @Description: 视频页面保持组件身份、切源与同源场景状态的消费契约回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider, NSelect } from 'naive-ui'
import VideoPage from '@/views/demo/37-video-player/index.vue'
import { DEMO_SOURCES } from '@/views/demo/37-video-player/data'

const pause = vi.fn()
const seek = vi.fn()
/** 消费契约探针只替换播放器运行时，验证页面没有靠 key 重挂载。 */
const PlayerProbe = defineComponent({
  name: 'C_VideoPlayer',
  props: [
    'url',
    'sourceType',
    'qualityList',
    'quizzes',
    'chapters',
    'subtitles',
  ],
  emits: ['ready', 'stateChange', 'timeUpdate', 'progressUpdate'],
  /** 暴露页面实际调用的公开方法。 */
  setup(props, { expose }) {
    expose({
      pause,
      seek,
      getProgressData: () => ({
        currentTime: 7,
        duration: 100,
        completionPercent: 5,
      }),
    })
    return () => h('div', { class: 'player-probe' }, props.url)
  },
})
/** 使用实际页面和消息 Provider，隔离无关图标与 API 表格。 */
const mountPage = () =>
  mount(
    defineComponent({
      /** 保持与应用相同的消息上下文。 */
      setup: () => () =>
        h(NMessageProvider, null, { default: () => h(VideoPage) }),
    }),
    {
      global: {
        stubs: {
          C_VideoPlayer: PlayerProbe,
          C_Icon: true,
          C_Table: true,
          c_vTitle: true,
        },
      },
    }
  )

/** 点击场景卡片，触发真实页面绑定。 */
const selectScene = async (
  wrapper: ReturnType<typeof mountPage>,
  title: string
) => {
  await wrapper
    .findAll('.scene-card')
    .find(button => button.text().includes(title))!
    .trigger('click')
  await flushPromises()
}

test('同 URL 场景切换保留进度与播放状态，HLS 切换才重置展示数据', async () => {
  const wrapper = mountPage()
  const player = wrapper.getComponent(PlayerProbe)
  const identity = player.vm.$.uid
  player.vm.$emit('stateChange', 'playing')
  player.vm.$emit('timeUpdate', 35, 100)
  player.vm.$emit('progressUpdate', { completionPercent: 12 })
  await selectScene(wrapper, '在线教育')
  expect(player.props('url')).toBe(DEMO_SOURCES.mp4)
  expect(player.props('quizzes')).toHaveLength(2)
  expect(wrapper.getComponent(PlayerProbe).vm.$.uid).toBe(identity)
  expect(wrapper.get('.status-grid').text()).toContain('playing')
  expect(wrapper.get('.status-grid').text()).toContain('00:35')
  await selectScene(wrapper, 'HLS')
  expect(player.props('url')).toBe(DEMO_SOURCES.hls)
  expect(player.props('sourceType')).toBe('hls')
  expect(wrapper.getComponent(PlayerProbe).vm.$.uid).toBe(identity)
  expect(wrapper.get('.status-grid').text()).toContain('00:00')
  expect(wrapper.get('.status-grid').text()).toContain('idle')
})

test('清空与恢复保留 C_VideoPlayer 实例，备用和本地源不携带原视频的测验', async () => {
  const wrapper = mountPage()
  await selectScene(wrapper, '在线教育')
  const player = wrapper.getComponent(PlayerProbe)
  const identity = player.vm.$.uid
  wrapper.getComponent(NSelect).vm.$emit('update:value', 'alternate')
  await flushPromises()
  expect(player.props('url')).toBe(DEMO_SOURCES.mp4Alt)
  expect(player.props('sourceType')).toBe('mp4')
  expect(player.props('qualityList')).toBeUndefined()
  expect(player.props('quizzes')).toBeUndefined()
  wrapper.getComponent(NSelect).vm.$emit('update:value', 'local')
  await flushPromises()
  expect(player.props('url')).toBe('/menu-too-logo.webm')
  expect(player.props('sourceType')).toBeUndefined()
  await wrapper
    .findAll('button')
    .find(button => button.text() === '清空视频源')!
    .trigger('click')
  expect(player.props('url')).toBe('')
  expect(wrapper.get('.player-empty').text()).toContain('视频源已清空')
  expect(
    wrapper
      .findAll('button')
      .find(button => button.text() === '从头播放')!
      .attributes('disabled')
  ).toBeDefined()
  await wrapper
    .findAll('button')
    .find(button => button.text() === '恢复视频源')!
    .trigger('click')
  expect(player.props('url')).toBe('/menu-too-logo.webm')
  expect(wrapper.getComponent(PlayerProbe).vm.$.uid).toBe(identity)
})

test('从头播放使用公开暂停与 seek 方法，保持同一个资源身份', async () => {
  pause.mockClear()
  seek.mockClear()
  const wrapper = mountPage()
  const player = wrapper.getComponent(PlayerProbe)
  const identity = player.vm.$.uid
  player.vm.$emit('timeUpdate', 35, 100)
  await wrapper
    .findAll('button')
    .find(button => button.text() === '从头播放')!
    .trigger('click')
  expect(pause).toHaveBeenCalledOnce()
  expect(seek).toHaveBeenCalledWith(0)
  expect(wrapper.getComponent(PlayerProbe).vm.$.uid).toBe(identity)
  expect(wrapper.get('.status-grid').text()).toContain('00:00')
  expect(wrapper.get('.event-log-panel').text()).toContain('答题和书签记录保留')
})
