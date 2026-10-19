<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 单画布签名工作台，笔迹、快照和输出形成完整路径
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace signature-workspace"
    ><header class="workspace-heading"
      ><div
        ><small>SIGNATURE STUDIO</small><h1>电子签名场景示例</h1
        ><p>写下笔迹，保留快照，生成可下载的签名图片。</p></div
      ><NTag
        size="small"
        :bordered="false"
        >笔迹只保留在当前页面</NTag
      ></header
    >
    <div class="workspace-grid"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>画笔与画布</h2
          ><label class="workspace-label"
            ><span>画笔颜色</span
            ><NColorPicker
              v-model:value="penColor"
              :show-alpha="false"
              :disabled="readonly"
              size="small" /></label
          ><label class="workspace-label"
            ><span>笔画粗细 · {{ penWidth }} px</span
            ><NSlider
              v-model:value="penWidth"
              :min="1"
              :max="8"
              :step="1"
              :disabled="readonly" /></label
          ><label class="workspace-label"
            ><NCheckbox v-model:checked="watermark"
              >添加演示水印</NCheckbox
            ></label
          ><label class="workspace-label"
            ><NCheckbox v-model:checked="readonly">只读预览</NCheckbox></label
          ><p class="workspace-hint"
            >只读模式可查看和导出，不能改动笔迹。</p
          ></section
        ><section class="workspace-section"
          ><h2>输出格式</h2
          ><NSelect
            v-model:value="format"
            :options="SIGNATURE_FORMATS"
            size="small"
          /><p
            >PNG 适合清晰留存，JPEG 便于通用分享，SVG 保留矢量笔迹。</p
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>签名画布</h2
            ><small
              >{{ strokes.length }} 笔 ·
              {{ readonly ? '只读模式' : '可编辑' }}</small
            ></div
          ><div class="workspace-actions"
            ><NButton
              size="tiny"
              :disabled="!strokes.length"
              @click="save"
              >保存笔迹快照</NButton
            ><NButton
              size="tiny"
              :disabled="!saved || readonly"
              @click="restore"
              >恢复快照</NButton
            ><NButton
              size="tiny"
              :disabled="!strokes.length || readonly"
              @click="clear"
              >清空画布</NButton
            ></div
          ></header
        ><div class="signature-canvas"
          ><C_Signature
            ref="signatureRef"
            width="100%"
            :height="330"
            :readonly="readonly"
            :disabled="exporting"
            :pen-config="{ color: penColor, width: penWidth }"
            :watermark="{ show: watermark, text: 'Robot Admin · 演示签名' }"
            background-color="#ffffff"
            @change="changed"
        /></div>
        <footer class="workspace-footer"
          ><span>鼠标、触控笔与触摸均可书写 · 工具栏支持撤销、恢复和橡皮擦</span
          ><NButton
            size="small"
            type="primary"
            :loading="exporting"
            :disabled="!strokes.length"
            @click="generate"
            >生成签名图片</NButton
          ></footer
        >
        <section class="signature-output"
          ><header
            ><h2>输出预览</h2
            ><NTag
              size="small"
              :bordered="false"
              :type="stale ? 'warning' : result ? 'success' : 'default'"
              >{{
                stale ? '需要重新生成' : result ? '已生成' : '尚未生成'
              }}</NTag
            ></header
          ><div
            v-if="result"
            class="signature-result"
            ><img
              :src="result"
              alt="生成的签名图片" /></div
          ><div
            v-else
            class="workspace-empty"
            >书写后点击“生成签名图片”，在这里确认输出效果</div
          ><div class="workspace-actions"
            ><NButton
              size="small"
              :disabled="!result || stale"
              @click="download"
              >下载签名图片</NButton
            ><span class="workspace-hint"
              >修改笔迹、水印或格式后需重新生成。</span
            ></div
          ></section
        ></main
      ></div
    >
  </div>
</template>
<script setup lang="ts">
  import { SIGNATURE_FORMATS } from './data'
  import { useSignatureWorkspace } from './useSignatureWorkspace'
  defineOptions({ name: 'Demo42Signature' })
  const {
    signatureRef,
    penColor,
    penWidth,
    watermark,
    readonly,
    format,
    strokes,
    saved,
    result,
    stale,
    exporting,
    changed,
    save,
    restore,
    clear,
    generate,
    download,
  } = useSignatureWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
