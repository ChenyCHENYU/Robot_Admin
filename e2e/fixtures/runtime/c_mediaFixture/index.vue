<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\c_mediaFixture\index.vue
 * @Description: 真实媒体实例及其宿主 Blob 所有权
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section class="media-host">
    <button
      type="button"
      @click="replaceSource"
      >替换媒体源</button
    >
    <Audio
      v-if="kind === '音频'"
      :tracks="tracks"
      :autoplay="false"
      :show-cover="false"
    />
    <Video
      v-else
      :url="source"
      :autoplay="false"
      :height="360"
      :keyboard="false"
      :pip="false"
    />
  </section>
</template>
<script setup lang="ts">
  import { computed, defineAsyncComponent, onBeforeUnmount, ref } from 'vue'
  import { createAudioBlob, videoUrl } from '../data'

  defineOptions({ name: 'RuntimeMediaFixture' })
  const props = defineProps<{ kind: '音频' | '视频' }>()
  const Audio = defineAsyncComponent(async () => {
    await import('@robot-admin/naive-ui-components/C_AudioPlayer/style.css')
    return (await import('@robot-admin/naive-ui-components/C_AudioPlayer'))
      .C_AudioPlayer
  })
  const Video = defineAsyncComponent(async () => {
    await import('@robot-admin/naive-ui-components/C_VideoPlayer/style.css')
    return (await import('@robot-admin/naive-ui-components/C_VideoPlayer'))
      .C_VideoPlayer
  })
  const source = ref(
    props.kind === '音频' ? URL.createObjectURL(createAudioBlob()) : videoUrl
  )
  const tracks = computed(() => [
    { id: 'track', title: '本地 PCM 回归音频', src: source.value },
  ])
  const replaceSource = () => {
    const previous = source.value
    source.value =
      props.kind === '音频'
        ? URL.createObjectURL(createAudioBlob())
        : `${videoUrl}?source=${Date.now()}`
    if (previous.startsWith('blob:')) URL.revokeObjectURL(previous)
  }
  onBeforeUnmount(() => {
    if (source.value.startsWith('blob:')) URL.revokeObjectURL(source.value)
  })
</script>
