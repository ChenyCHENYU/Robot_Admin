<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 可调整分区的代码文本与高亮工作台
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace code-editor-demo"
    ><header class="workspace-heading"
      ><div
        ><small>CODE READING ROOM</small><h1>Code编辑器组件场景示例</h1
        ><p>编辑文本、即时查看高亮，拖动分隔线调整阅读空间。</p></div
      ><div class="workspace-actions"
        ><NButton
          size="small"
          @click="reset"
          >恢复当前示例</NButton
        ><NButton
          size="small"
          type="primary"
          :disabled="!code"
          @click="download"
          >下载当前文件</NButton
        ></div
      ></header
    >
    <div class="workspace-grid"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>示例文件</h2
          ><button
            v-for="file in CODE_FILES"
            :key="file.language"
            type="button"
            class="workspace-choice"
            :aria-pressed="language === file.language"
            @click="language = file.language"
            ><span
              ><strong>{{ file.name }}</strong
              ><small>{{ file.language }}</small></span
            ></button
          ></section
        ><section class="workspace-section"
          ><h2>阅读设置</h2
          ><label class="workspace-label"
            ><NCheckbox v-model:checked="lineNumbers"
              >显示行号</NCheckbox
            ></label
          ><label class="workspace-label"
            ><NCheckbox v-model:checked="wrap">自动换行</NCheckbox></label
          ><p
            >每份文件的修改在当前页面分别保留。此工作台只编辑与高亮文本，不执行代码。</p
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ current.name }}</h2
            ><small
              >{{ code.split('\n').length }} 行 · {{ code.length }} 字符</small
            ></div
          ><span class="workspace-hint">{{
            loading ? '正在加载语法…' : status
          }}</span></header
        ><div class="code-split"
          ><C_SplitPane
            v-model:size="splitSize"
            :direction="width < 1200 ? 'vertical' : 'horizontal'"
            :min-size="25"
            :max-size="75"
            :min-first-size="180"
            :min-second-size="180"
            aria-label="代码编辑与高亮分区"
            ><template #first
              ><section class="code-pane"
                ><h3>编辑文本</h3
                ><NInput
                  v-model:value="code"
                  type="textarea"
                  :input-props="{ 'aria-label': '代码文本', spellcheck: false }"
                  :resizable="false" /></section></template
            ><template #second
              ><section class="code-pane"
                ><h3>语法预览</h3
                ><C_Code
                  :code="code"
                  :language="language"
                  :title="current.name"
                  :show-line-numbers="lineNumbers"
                  :word-wrap="wrap"
                  :max-height="600"
                  :show-fullscreen="
                    true
                  " /></section></template></C_SplitPane></div
        ><footer class="workspace-footer"
          ><span>支持分隔线拖动与键盘方向键调整</span
          ><span>复制和全屏操作位于高亮预览工具栏</span></footer
        ></main
      ></div
    >
  </div>
</template>
<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { useCodeWorkspace } from './useCodeWorkspace'
  defineOptions({ name: 'Demo14CodeEditor' })
  const { width } = useWindowSize()
  const splitSize = ref(50)
  const {
    CODE_FILES,
    language,
    lineNumbers,
    wrap,
    loading,
    status,
    current,
    code,
    reset,
    download,
  } = useCodeWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
