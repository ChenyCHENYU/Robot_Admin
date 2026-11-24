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
              v-model:value="page.penColor"
              :show-alpha="false"
              :disabled="page.readonly"
              size="small" /></label
          ><label class="workspace-label"
            ><span>笔画粗细 · {{ page.penWidth }} px</span
            ><NSlider
              v-model:value="page.penWidth"
              :min="1"
              :max="8"
              :step="1"
              :disabled="page.readonly" /></label
          ><label class="workspace-label"
            ><span>橡皮尺寸 · {{ page.eraserSize }} px</span
            ><NSlider
              v-model:value="page.eraserSize"
              :min="10"
              :max="80"
              :step="5"
              :disabled="page.readonly || page.exporting"
              aria-label="橡皮尺寸" /></label
          ><p class="workspace-hint"
            >选择工具栏中的橡皮擦使用；调整尺寸不会改变已经擦除的笔迹。</p
          ><label class="workspace-label"
            ><NCheckbox v-model:checked="page.watermark"
              >添加演示水印</NCheckbox
            ></label
          ><label class="workspace-label"
            ><NCheckbox v-model:checked="page.readonly"
              >只读预览</NCheckbox
            ></label
          ><p class="workspace-hint"
            >只读模式可查看和导出，不能改动笔迹。</p
          ></section
        ><section class="workspace-section"
          ><h2>输出格式</h2
          ><NSelect
            v-model:value="page.format"
            :options="SIGNATURE_FORMATS"
            size="small"
          /><p
            >PNG 适合清晰留存，JPEG 便于通用分享；SVG
            嵌入当前画布图片，保留橡皮擦与水印效果。</p
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>签名画布</h2
            ><small
              >{{ page.strokes.length }} 笔 ·
              {{ page.readonly ? '只读模式' : '可编辑' }}</small
            ></div
          ><div class="workspace-actions"
            ><NButton
              size="tiny"
              :disabled="!page.strokes.length"
              @click="page.save"
              >保存笔迹快照</NButton
            ><NButton
              size="tiny"
              :disabled="!page.saved || page.readonly"
              @click="page.restore"
              >恢复快照</NButton
            ><NButton
              size="tiny"
              :disabled="!page.strokes.length || page.readonly"
              @click="page.clear"
              >清空画布</NButton
            ></div
          ></header
        ><div class="signature-canvas"
          ><C_Signature
            ref="signatureRef"
            width="100%"
            :height="330"
            :readonly="page.readonly"
            :disabled="page.exporting"
            :pen-config="{ color: page.penColor, width: page.penWidth }"
            :eraser-config="{ size: page.eraserSize }"
            :watermark="{
              show: page.watermark,
              text: 'Robot Admin · 演示签名',
            }"
            background-color="#ffffff"
            @change="page.changed"
        /></div>
        <footer class="workspace-footer"
          ><span>鼠标、触控笔与触摸均可书写 · 工具栏支持撤销、恢复和橡皮擦</span
          ><NButton
            size="small"
            type="primary"
            :loading="page.exporting"
            :disabled="!page.strokes.length"
            @click="page.generate"
            >生成签名图片</NButton
          ></footer
        >
        <section class="signature-output"
          ><header
            ><h2>输出预览</h2
            ><NTag
              size="small"
              :bordered="false"
              :type="
                page.stale ? 'warning' : page.result ? 'success' : 'default'
              "
              >{{
                page.stale
                  ? '需要重新生成'
                  : page.result
                    ? '已生成'
                    : '尚未生成'
              }}</NTag
            ></header
          ><div
            v-if="page.result"
            class="signature-result"
            ><img
              :src="page.result"
              alt="生成的签名图片" /></div
          ><div
            v-else
            class="workspace-empty"
            >书写后点击“生成签名图片”，在这里确认输出效果</div
          ><div class="workspace-actions"
            ><NButton
              size="small"
              :disabled="!page.result || page.stale"
              @click="page.download"
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
  const controller = useSignatureWorkspace()
  const page = proxyRefs(controller)
  const { signatureRef } = controller
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
