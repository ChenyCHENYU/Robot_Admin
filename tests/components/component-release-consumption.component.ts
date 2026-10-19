/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @FilePath: \Robot_Admin\tests\components\component-release-consumption.component.ts
 * @Description: 演示控制器与正式安装组件包的资源切换消费回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider } from 'naive-ui'
import { C_AudioPlayer } from '@robot-admin/naive-ui-components/C_AudioPlayer'
import { C_FilePreview } from '@robot-admin/naive-ui-components/C_FilePreview'
import { useAudioWorkspace } from '@/views/demo/54-audio-player/useAudioWorkspace'
import { useDocumentWorkspace } from '@/views/demo/32-file-preview/useDocumentWorkspace'

/** 用有真实消息上下文的宿主挂载消费控制器。 */
const provide = (component: ReturnType<typeof defineComponent>) =>
  mount(
    defineComponent({
      setup: () => () =>
        h(NMessageProvider, null, { default: () => h(component) }),
    }),
    { global: { stubs: { C_Icon: true } } }
  )

afterEach(() => vi.unstubAllGlobals())

test('音频页面原地切换音源、清空和恢复直接驱动正式组件，主题切换保留实例', async () => {
  const media: AudioMock[] = []
  /** 保留浏览器媒体协议，用可观察实例验证资源退出。 */
  class AudioMock extends EventTarget {
    src: string
    paused = true
    volume = 1
    currentTime = 0
    duration = 12
    /** 建立独立媒体资源。 */
    constructor(src: string) {
      super()
      this.src = src
      media.push(this)
    }
    /** 模拟已被浏览器允许的播放。 */
    play() {
      this.paused = false
      return Promise.resolve()
    }
    /** 暂停当前音频。 */
    pause() {
      this.paused = true
    }
    /** 释放源。 */
    removeAttribute(name: string) {
      if (name === 'src') this.src = ''
    }
    /** 模拟停止媒体加载。 */
    load() {}
  }
  vi.stubGlobal('Audio', AudioMock)
  let workspace!: ReturnType<typeof useAudioWorkspace>
  const wrapper = provide(
    defineComponent({
      /** 连接正式播放器与页面控制器。 */
      setup() {
        workspace = useAudioWorkspace()
        return () =>
          h(C_AudioPlayer, {
            tracks: workspace.tracks.value,
            initialIndex: workspace.activeIndex.value,
            theme: workspace.theme.value,
            onPlay: workspace.handlePlay,
            onError: workspace.handleError,
          })
      },
    })
  )
  await wrapper.get('button.is-play').trigger('click')
  await flushPromises()
  const initial = media[0]
  workspace.theme.value = 'minimal'
  await flushPromises()
  expect(media).toHaveLength(1)
  expect(initial.paused).toBe(false)
  workspace.replaceSource()
  await flushPromises()
  expect(initial.paused).toBe(true)
  expect(media.at(-1)?.src).toBe(workspace.activeTrack.value.src)
  workspace.clearTracks()
  await flushPromises()
  expect(media.every(item => item.paused)).toBe(true)
  expect(wrapper.text()).toContain('未选择曲目')
  expect(workspace.playing.value).toBe(false)
  workspace.restoreTracks()
  await flushPromises()
  expect(workspace.tracks.value).toHaveLength(3)
  expect(media.at(-1)?.paused).toBe(true)
})

test('文档工作台在同一组件中清空源，释放 PDF，随后恢复本地文档', async () => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:consumer-document')
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  let workspace!: ReturnType<typeof useDocumentWorkspace>
  const wrapper = provide(
    defineComponent({
      /** 连接正式预览器与页面文件库。 */
      setup() {
        workspace = useDocumentWorkspace()
        workspace.addFiles([
          new File(['%PDF-1.4'], 'consumer.pdf', { type: 'application/pdf' }),
        ])
        return () =>
          h(C_FilePreview, {
            inline: true,
            file: workspace.selected.value?.file,
            url: workspace.selected.value?.url,
            fileName: workspace.selected.value?.name,
          })
      },
    })
  )
  await flushPromises()
  expect(wrapper.find('iframe').exists()).toBe(true)
  workspace.clearDocuments()
  await flushPromises()
  expect(wrapper.text()).toContain('暂无预览文件')
  expect(wrapper.find('iframe').exists()).toBe(false)
  expect(revoke).toHaveBeenCalledWith('blob:consumer-document')
  workspace.addFiles([
    new File(['%PDF-1.4'], 'next.pdf', { type: 'application/pdf' }),
  ])
  await flushPromises()
  expect(wrapper.find('iframe').exists()).toBe(true)
})
