/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-31
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\mini.ts
 * @Description: 使用真实组件包及本地视频的流式锚点、小窗开关和卸载夹具
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import '@robot-admin/naive-ui-components/C_VideoPlayer/style.css'
import { createApp, h, ref } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { C_VideoPlayer } from '@robot-admin/naive-ui-components/C_VideoPlayer'
import { videoUrl } from './data'

const fluid = new URLSearchParams(location.search).get('mode') === 'fluid'
const enabled = ref(true)
const mounted = ref(true)
const events = ref(0)
const errors = ref(0)
const recordEvent = () => {
  events.value += 1
}

createApp({
  name: 'RuntimeMiniPlayerFixture',
  render: () =>
    h(NConfigProvider, null, {
      default: () =>
        h('main', [
          h('header', { class: 'mini-toolbar' }, [
            h('strong', fluid ? '自适应视频' : '固定高度 360px'),
            h('label', [
              h('input', {
                type: 'checkbox',
                checked: enabled.value,
                onChange: (event: Event) => {
                  enabled.value = (event.target as HTMLInputElement).checked
                },
              }),
              '启用小窗',
            ]),
            h(
              'button',
              {
                type: 'button',
                onClick: () => {
                  mounted.value = !mounted.value
                },
              },
              mounted.value ? '卸载播放器' : '挂载播放器'
            ),
            h(
              'output',
              { id: 'mount-state' },
              mounted.value ? 'mounted' : 'unmounted'
            ),
            h('output', { id: 'media-events' }, String(events.value)),
            h('output', { id: 'media-errors' }, String(errors.value)),
          ]),
          h(
            'section',
            {
              id: 'player-host',
              style: { width: fluid ? '720px' : '640px' },
            },
            mounted.value
              ? h(C_VideoPlayer, {
                  url: videoUrl,
                  width: '100%',
                  height: 360,
                  fluid,
                  autoplay: false,
                  keyboard: false,
                  pip: false,
                  miniPlayer: enabled.value,
                  onReady: recordEvent,
                  onStateChange: recordEvent,
                  onError: () => {
                    errors.value += 1
                    recordEvent()
                  },
                })
              : h('p', '播放器已卸载')
          ),
          h('div', { class: 'mini-scroll-space', 'aria-hidden': 'true' }),
        ]),
    }),
}).mount('#app')
