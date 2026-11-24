<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-02
 * @FilePath: \Robot_Admin\src\views\demo\19-download-all\index.vue
 * @Description: 通用文件下载场景示例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="plugin-workspace download-demo">
    <header class="workspace-heading"
      ><div
        ><small>DOWNLOAD CENTER</small><h1>文件下载工作台</h1
        ><p>选择合适的格式，让数据交付更简单。</p></div
      ><NTag
        size="small"
        :bordered="false"
        >{{ downloads.history.length }} 条本次下载记录</NTag
      ></header
    >
    <div class="download-formats"
      ><article
        v-for="type in QUICK_DOWNLOAD_TYPES"
        :key="type"
        ><C_Icon
          class="download-format-icon"
          :name="DOWNLOAD_FORMATS[type].icon"
          :size="30" /><small>{{ DOWNLOAD_FORMATS[type].extension }}</small
        ><h2>{{ DOWNLOAD_FORMATS[type].name }}</h2
        ><p>{{ DOWNLOAD_FORMATS[type].description }}</p
        ><NButton
          size="small"
          :loading="downloads.pending.has(type)"
          @click="downloads.downloadQuick(type)"
          >{{ DOWNLOAD_FORMATS[type].action
          }}<template #icon
            ><span class="i-mdi-download" /></template></NButton></article
    ></div>
    <nav
      class="file-tool-tabs"
      aria-label="下载方式"
      ><button
        type="button"
        :aria-pressed="downloadMode === 'custom'"
        @click="downloadMode = 'custom'"
        ><span class="i-mdi-wrench-settings" /><span
          ><strong>自定义下载</strong><small>名称、格式与附加参数</small></span
        ></button
      ><button
        type="button"
        :aria-pressed="downloadMode === 'batch'"
        @click="downloadMode = 'batch'"
        ><span class="i-mdi-download-multiple-outline" /><span
          ><strong>批量下载</strong><small>一次准备多份交付文件</small></span
        ></button
      ></nav
    >
    <div class="demo-content">
      <div class="file-tool-layout"
        ><div class="file-tool-main">
          <!-- 自定义下载区域 -->
          <NCard
            v-show="downloadMode === 'custom'"
            title="自定义下载"
            class="demo-card demo-section"
          >
            <template #header-extra>
              <span class="i-mdi-wrench-settings text-purple-500"></span>
            </template>

            <C_Form
              v-model="downloads.form"
              :options="CUSTOM_DOWNLOAD_FIELDS"
              :config="downloads.formConfig"
            >
              <template #action="{ submit, submitting }">
                <NButton
                  type="primary"
                  :loading="submitting"
                  :disabled="
                    !downloads.form.fileName || !downloads.form.fileType
                  "
                  @click="submit"
                >
                  <template #icon
                    ><span class="i-mdi-cloud-download-outline"
                  /></template>
                  自定义下载
                </NButton>
              </template>
            </C_Form>
          </NCard>

          <!-- 批量下载区域 -->
          <NCard
            v-show="downloadMode === 'batch'"
            title="批量下载"
            class="demo-card demo-section"
          >
            <template #header-extra>
              <span class="i-mdi-folder text-green-500"></span>
            </template>

            <div class="batch-controls">
              <NCheckboxGroup v-model:value="downloads.selected">
                <div class="checkbox-grid">
                  <NCheckbox
                    v-for="type in BATCH_DOWNLOAD_TYPES"
                    :key="type"
                    :value="type"
                    :label="DOWNLOAD_FORMATS[type].name + type"
                  />
                </div>
              </NCheckboxGroup>

              <div class="batch-actions">
                <C_ActionBar :actions="downloads.batchActions" />
              </div>
            </div>
          </NCard> </div
        ><aside class="file-output"
          ><h2>下载说明</h2
          ><span class="file-output__icon i-mdi-cloud-download-outline" /><h3>{{
            downloadMode === 'custom'
              ? downloads.form.fileName || '为文件起个名字'
              : `已选择 ${downloads.selected.length} 份文件`
          }}</h3
          ><p>{{
            downloadMode === 'custom'
              ? '按选定格式生成示例文件。JSON 和系统日志会包含输入参数。'
              : '各文件会分别触发浏览器下载；请选择需要的内容后执行。'
          }}</p
          ><ul
            ><li><span class="i-mdi-check-circle-outline" />真实文件下载</li
            ><li
              ><span
                class="i-mdi-shield-check-outline"
              />演示数据，不连接业务后台</li
            ></ul
          ><p
            >下载完成后，可在浏览器下载列表查看。历史仅保留当前页面最近 10
            次操作。</p
          ></aside
        ></div
      >
      <!-- 下载历史 -->
      <NCard
        title="下载历史"
        class="file-history"
      >
        <template #header-extra>
          <span class="i-mdi-clock-time-four-outline text-indigo-500"></span>
        </template>

        <C_Table
          :columns="historyColumns"
          :data="downloads.history"
          :config="{
            toolbar: { show: false },
            pagination: {
              showSizePicker: false,
              showQuickJumper: false,
              pageSize: 5,
            },
            display: { striped: false, size: 'small' },
          }"
        />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { setupFileUtils } from '@/plugins/file-utils'
  import {
    BATCH_DOWNLOAD_TYPES,
    DOWNLOAD_FORMATS,
    QUICK_DOWNLOAD_TYPES,
    historyColumns,
  } from './data'
  import { CUSTOM_DOWNLOAD_FIELDS, useDownloadDemo } from './useDownloadDemo'

  defineOptions({ name: 'Demo19DownloadAll' })

  setupFileUtils()
  const downloadMode = ref('custom')
  const downloads = useDownloadDemo()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
