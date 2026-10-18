<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 图片裁剪工作台，素材、场景、编辑与输出形成完整路径
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="crop-workspace">
    <header class="crop-heading"
      ><div
        ><span>IMAGE STUDIO / LOCAL FIRST</span><h1>图片裁剪工作台</h1
        ><p
          >从头像到内容封面，选好用途，调整画面，得到可直接使用的图片。</p
        ></div
      ><NButton
        size="small"
        :disabled="exporting"
        @click="fileRef?.click()"
        ><template #icon><span class="i-mdi:upload" /></template
        >选择本地图片</NButton
      ></header
    >
    <nav
      class="crop-flow"
      aria-label="裁剪步骤"
      ><span><b>01</b> 选择素材与用途</span><i /><span
        ><b>02</b> 调整裁剪区域</span
      ><i /><span><b>03</b> 预览并下载</span></nav
    >
    <div
      class="crop-presets"
      aria-label="裁剪用途"
    >
      <button
        v-for="item in CROP_PRESETS"
        :key="item.key"
        type="button"
        :aria-pressed="preset === item.key"
        :disabled="exporting"
        @click="applyPreset(item.key)"
        ><span :class="item.icon" /><span
          ><strong>{{ item.label }}</strong
          ><small>{{ item.note }}</small></span
        ><span
          class="crop-presets__check"
          aria-hidden="true"
          >{{ preset === item.key ? '✓' : '' }}</span
        ></button
      >
    </div>
    <div class="crop-layout">
      <section class="crop-editor">
        <header class="crop-source"
          ><img
            :src="src"
            alt="当前素材缩略图"
          /><div
            ><strong>{{ fileName }}</strong
            ><span
              >{{ sourceInfo.width }} × {{ sourceInfo.height }} px
              <template v-if="sourceInfo.size"
                >· {{ formatFileSize(sourceInfo.size) }}</template
              ></span
            ></div
          ><NButton
            size="tiny"
            :disabled="!ready || exporting"
            @click="modalRef?.open(src)"
            >弹窗编辑</NButton
          ></header
        >
        <div
          class="crop-stage"
          :class="{ 'is-dropping': dropping }"
          @dragover.prevent="dropping = true"
          @dragleave.prevent="dropping = false"
          @drop.prevent="onDrop"
          @pointerup="markStale"
          @wheel.passive="markStale"
        >
          <C_ImageCropper
            ref="cropperRef"
            :src="src"
            :aspect-ratio="ratio"
            :output-format="format"
            :output-quality="quality / 100"
            :max-output-width="maxWidth || 0"
            :show-toolbar="false"
            :show-preview="false"
            :disabled="exporting"
            :height="440"
            @ready="onReady"
            @error="onError"
          />
          <div
            v-if="dropping"
            class="crop-stage__drop"
            >松开以替换图片</div
          >
        </div>
        <div class="crop-tools"
          ><C_ActionBar
            :actions="transformActions"
            :config="{ size: 'tiny', wrap: true }"
        /></div>
        <footer class="crop-editor__footer"
          ><span><i />拖动画面调整位置，拖动裁剪框改变范围</span
          ><span>图片仅在本地处理</span></footer
        >
      </section>
      <aside class="crop-output">
        <section class="crop-output__settings"
          ><header><span>输出设置</span><small>EXPORT</small></header>
          <label
            >文件格式<NSelect
              v-model:value="format"
              :options="FORMAT_OPTIONS"
              size="small"
              :disabled="exporting"
              aria-label="输出文件格式"
          /></label>
          <label
            >最大输出宽度
            <NInputNumber
              v-model:value="maxWidth"
              :min="64"
              :max="4096"
              :step="64"
              size="small"
              :disabled="exporting"
              aria-label="最大输出宽度"
              ><template #suffix>px</template></NInputNumber
            ><small>保持裁剪比例，原图较小时不放大。</small></label
          >
          <label
            v-if="format !== 'png'"
            class="crop-quality"
            ><span
              >图片质量 <strong>{{ quality }}%</strong></span
            ><NSlider
              v-model:value="quality"
              :min="30"
              :max="100"
              :step="5"
              :disabled="exporting"
              aria-label="图片质量"
          /></label>
          <p
            v-else
            class="crop-output__note"
            >PNG 保留透明背景，适合 Logo 与需要透明边缘的素材。</p
          >
          <NCheckbox
            v-model:checked="circular"
            :disabled="exporting"
            >圆形预览</NCheckbox
          >
          <NButton
            block
            type="primary"
            size="small"
            :disabled="!ready"
            :loading="exporting"
            @click="exportCrop"
            ><template #icon><span class="i-mdi:crop" /></template
            >生成裁剪结果</NButton
          >
        </section>
        <section
          class="crop-result"
          aria-label="输出预览"
          ><header
            ><span>输出预览</span
            ><NTag
              v-if="result"
              size="small"
              :type="stale ? 'warning' : 'success'"
              :bordered="false"
              >{{ stale ? '需要重新生成' : '已生成' }}</NTag
            ></header
          >
          <div
            class="crop-result__canvas"
            :class="{ 'is-circular': circular }"
            ><img
              v-if="result"
              :src="result.base64"
              alt="裁剪输出结果"
            /><div
              v-else
              class="crop-result__empty"
              ><span class="i-mdi:image-outline" /><strong
                >成片会显示在这里</strong
              ><p>调整好画面后，点击上方生成按钮</p></div
            ></div
          >
          <template v-if="result"
            ><div class="crop-result__meta"
              ><span>{{ result.width }} × {{ result.height }} px</span
              ><span
                >{{ result.format.toUpperCase() }} ·
                {{ formatFileSize(result.blob.size) }}</span
              ></div
            ><NButton
              block
              size="small"
              :disabled="stale || exporting"
              @click="download"
              ><template #icon><span class="i-mdi:download" /></template
              >下载图片</NButton
            ></template
          >
          <small
            v-if="circular"
            class="crop-result__hint"
            >圆形仅用于预览，文件保留矩形画布。</small
          >
        </section>
      </aside>
    </div>
    <section class="crop-samples"
      ><div
        ><h2>先用示例试一试</h2
        ><p>内置品牌素材，无需上传即可体验完整流程。</p></div
      ><button
        v-for="sample in SAMPLE_IMAGES"
        :key="sample.key"
        type="button"
        :disabled="exporting"
        @click="selectSample(sample)"
        ><img
          :src="sample.src"
          alt=""
        /><span>{{ sample.label }}</span></button
      ><small>支持 PNG / JPEG / WebP，单张不超过 15 MB</small></section
    >
    <input
      ref="fileRef"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      class="crop-file-input"
      aria-label="上传裁剪图片"
      @change="onFileChange"
    />
    <C_ImageCropper
      ref="modalRef"
      modal
      modal-title="放大编辑图片"
      :aspect-ratio="ratio"
      :output-format="format"
      :output-quality="quality / 100"
      :max-output-width="maxWidth || 0"
      :circular="circular"
      @confirm="acceptModalResult"
      @error="onError"
    />
  </div>
</template>
<script setup lang="ts">
  import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
  import { CROP_PRESETS, SAMPLE_IMAGES, FORMAT_OPTIONS } from './data'
  import { useCropWorkspace } from './useCropWorkspace'
  defineOptions({ name: 'Demo45ImageCropper' })
  const {
    cropperRef,
    modalRef,
    fileRef,
    src,
    fileName,
    sourceInfo,
    preset,
    ratio,
    format,
    quality,
    maxWidth,
    ready,
    exporting,
    result,
    circular,
    stale,
    dropping,
    markStale,
    selectSample,
    onFileChange,
    onDrop,
    applyPreset,
    transform,
    exportCrop,
    download,
    onReady,
    onError,
    acceptModalResult,
    formatFileSize,
  } = useCropWorkspace()
  const transformActions = computed<ActionItem[]>(() =>
    [
      {
        key: 'rotate-left',
        label: '左转',
        icon: 'mdi:rotate-left',
        onClick: () => transform('left'),
      },
      {
        key: 'rotate-right',
        label: '右转',
        icon: 'mdi:rotate-right',
        onClick: () => transform('right'),
      },
      {
        key: 'zoom-in',
        label: '放大',
        icon: 'mdi:magnify-plus-outline',
        onClick: () => transform('zoom-in'),
      },
      {
        key: 'zoom-out',
        label: '缩小',
        icon: 'mdi:magnify-minus-outline',
        onClick: () => transform('zoom-out'),
      },
      {
        key: 'flip-x',
        label: '水平翻转',
        icon: 'mdi:flip-horizontal',
        onClick: () => transform('flip-x'),
      },
      {
        key: 'flip-y',
        label: '垂直翻转',
        icon: 'mdi:flip-vertical',
        onClick: () => transform('flip-y'),
      },
      { key: 'reset', label: '重置', onClick: () => transform('reset') },
    ].map(item => ({ ...item, disabled: !ready.value || exporting.value }))
  )
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
