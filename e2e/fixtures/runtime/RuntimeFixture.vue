<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\RuntimeFixture.vue
 * @Description: 发布组件挂载/卸载与宿主样式隔离的真实浏览器实验夹具
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NConfigProvider>
    <NMessageProvider>
      <NDialogProvider>
        <main class="runtime-fixture">
          <nav aria-label="测试场景">
            <button
              v-for="entry in scenarios"
              :key="entry"
              type="button"
              @click="scene = entry"
              >{{ entry }}</button
            >
          </nav>
          <button
            id="baseline-control"
            type="button"
            >基础宿主按钮</button
          >
          <output id="current-scene">{{ scene }}</output>
          <section
            v-if="scene === '瀑布流'"
            aria-label="瀑布流实验"
          >
            <label
              ><input
                v-model="virtualScroll"
                type="checkbox"
              />窗口化</label
            >
            <button
              type="button"
              @click="gallery?.scrollToTop()"
              >回到顶部</button
            >
            <label
              ><input
                v-model="expandedDetails"
                type="checkbox"
              />展开卡片详情</label
            >
            <output id="last-selection">{{ selection }}</output>
            <div
              id="gallery-scroll"
              class="gallery-scroll"
            >
              <div style="overflow: auto">
                <WaterFall
                  ref="gallery"
                  :items="items"
                  :columns="4"
                  :virtual-scroll="virtualScroll"
                  :infinite="false"
                  :animation-duration="0"
                  @item-click="selectItem"
                >
                  <template #item="{ item, index, height }"
                    ><article
                      class="fixture-card"
                      :data-item-index="index"
                      :style="{
                        height: `${height + (expandedDetails && index % 3 === 0 ? 120 : 0)}px`,
                      }"
                      >{{ item.title
                      }}<p v-if="expandedDetails && index % 3 === 0"
                        >变高内容，验证观察后的列排布与窗口范围。</p
                      ><button
                        type="button"
                        style="display: none"
                        >隐藏操作</button
                      ></article
                    ></template
                  >
                </WaterFall>
              </div>
            </div>
          </section>
          <section
            v-else-if="scene === '大表单'"
            class="form-scroll"
          >
            <Form
              v-model="formModel"
              :options="fields"
              :config="{
                layout: 'grid',
                grid: { cols: 4 },
                showActions: false,
              }"
            />
          </section>
          <section
            v-else-if="scene === 'Markdown'"
            class="editor-host"
          >
            <Markdown
              v-model="markdownModel"
              editor-id="runtime-markdown"
              :height="420"
            />
          </section>
          <section
            v-else-if="scene === '富文本'"
            class="editor-host"
          >
            <Editor
              v-model="richText"
              editor-id="runtime-rich-text"
              :height="420"
            />
          </section>
          <MediaFixture
            v-else-if="scene === '音频' || scene === '视频'"
            :key="scene"
            :kind="scene"
          />
        </main>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, ref } from 'vue'
  import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
  import type {
    WaterFallExpose,
    WaterFallItem,
  } from '@robot-admin/naive-ui-components/C_WaterFall'
  import MediaFixture from './c_mediaFixture/index.vue'
  import { items, fields, markdown } from './data'

  defineOptions({ name: 'RuntimeRegressionFixture' })
  const WaterFall = defineAsyncComponent(async () => {
    await import('@robot-admin/naive-ui-components/C_WaterFall/style.css')
    return (await import('@robot-admin/naive-ui-components/C_WaterFall'))
      .C_WaterFall
  })
  const Form = defineAsyncComponent(async () => {
    await import('@robot-admin/naive-ui-components/C_Form/style.css')
    return (await import('@robot-admin/naive-ui-components/C_Form')).C_Form
  })
  const Markdown = defineAsyncComponent(async () => {
    await import('@robot-admin/naive-ui-components/C_Markdown/style.css')
    return (await import('@robot-admin/naive-ui-components/C_Markdown'))
      .C_Markdown
  })
  const Editor = defineAsyncComponent(async () => {
    await import('@robot-admin/naive-ui-components/C_Editor/style.css')
    return (await import('@robot-admin/naive-ui-components/C_Editor')).C_Editor
  })
  const scenarios = [
    '基础',
    '瀑布流',
    '大表单',
    'Markdown',
    '富文本',
    '音频',
    '视频',
  ] as const
  const scene = ref<(typeof scenarios)[number]>('基础')
  const virtualScroll = ref(true)
  const expandedDetails = ref(false)
  const gallery = ref<WaterFallExpose | null>(null)
  const selection = ref('')
  const formModel = ref<Record<string, unknown>>({})
  const markdownModel = ref(markdown)
  const richText = ref('<p>这段内容用于验证富文本实例生命周期。</p>')
  const selectItem = (item: WaterFallItem, index: number) => {
    selection.value = `${item.id}:${index}`
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
