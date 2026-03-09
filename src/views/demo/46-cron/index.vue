<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\46-cron\index.vue
 * @Description: Cron 表达式编辑器演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-demo-page">
    <NH1>Cron 表达式编辑器场景示例</NH1>
    <div class="demo-intro">
      Cron
      表达式是用于配置定时任务的标准时间格式，广泛应用于服务器定时任务、数据备份、报表生成、消息推送等场景。
      本组件提供可视化编辑界面，支持「秒 分 时 日 月
      周」六字段格式，让您无需手动编写复杂的 Cron 语法，
      通过点选和输入即可完成定时规则配置。
    </div>

    <!-- 1. 基础用法 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:clock-edit-outline"
          class="title-icon"
        />
        基础用法（完整六字段编辑器）
      </h2>
      <div class="section-desc">
        完整的 Cron 可视化编辑器，顶部分段式表达式栏一目了然地显示各字段当前值，
        点击任意字段段即可切换秒/分/时/日/月/周编辑面板；每字段支持「每」「范围」「步进」「指定」四种模式，
        通过卡片选择 + 可点选值网格完成配置；右侧提供 12
        个常用模板快速填入，以及未来执行时间预测。编辑器与输入框双向同步，实时校验并生成中文描述。
      </div>
      <div class="section-content">
        <C_Cron
          v-model="basicExpr"
          @change="onBasicChange"
          @validation-change="onValidation"
        />
        <div class="demo-output">
          <NTag type="info"> 当前表达式：{{ basicExpr }} </NTag>
          <NTag :type="basicValid ? 'success' : 'error'">
            {{ basicValid ? '✅ 合法' : '❌ 不合法' }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- 2. 隐藏秒字段 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:clock-minus-outline"
          class="title-icon"
        />
        隐藏秒字段（5 字段模式）
      </h2>
      <div class="section-desc">
        设置
        <code>show-second="false"</code>
        隐藏秒字段，仅显示「分/时/日/月/周」五个 Tab。
        适合不需要秒级精度的场景，如每日报表、定时备份等。
      </div>
      <div class="section-content">
        <C_Cron
          v-model="noSecExpr"
          :show-second="false"
        />
      </div>
    </div>

    <!-- 3. 精简模式 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:view-compact-outline"
          class="title-icon"
        />
        精简模式（无模板 + 无预览）
      </h2>
      <div class="section-desc">
        通过 <code>:show-templates="false"</code> 和
        <code>:show-preview="false"</code> 关闭右侧面板，
        仅保留核心字段编辑区域。适合表单内嵌、弹窗配置等空间有限的场景。
      </div>
      <div class="section-content">
        <C_Cron
          v-model="compactExpr"
          :show-templates="false"
          :show-preview="false"
        />
      </div>
    </div>

    <!-- 4. 编程控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:code-braces"
          class="title-icon"
        />
        编程控制（Expose API）
      </h2>
      <div class="section-desc">
        通过 <code>ref</code> 获取组件实例，调用 <code>setValue</code> /
        <code>getValue</code> / <code>reset</code> /
        <code>validate</code> 方法，
        实现外部程序对编辑器的控制，适合表单联动、批量配置等场景。
      </div>
      <div class="section-content">
        <C_Cron
          ref="programRef"
          v-model="programExpr"
        />
        <NSpace
          :size="8"
          style="margin-top: 12px"
        >
          <NButton
            type="primary"
            size="small"
            @click="programRef?.setValue('0 0 9 ? * 2-6')"
          >
            设为工作日 9:00
          </NButton>
          <NButton
            size="small"
            @click="programRef?.setValue('0 0/5 * * * ?')"
          >
            设为每 5 分钟
          </NButton>
          <NButton
            size="small"
            @click="handleGetValue"
          >
            获取当前值
          </NButton>
          <NButton
            size="small"
            @click="handleValidate"
          >
            手动校验
          </NButton>
          <NButton
            size="small"
            @click="programRef?.reset()"
          >
            重置
          </NButton>
        </NSpace>
      </div>
    </div>

    <!-- 5. 预览次数配置 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:calendar-clock"
          class="title-icon"
        />
        自定义预览次数
      </h2>
      <div class="section-desc">
        通过 <code>preview-count</code> 配置右侧预览面板显示未来执行的次数（1 ~
        50）， 方便确认定时规则是否符合预期。
      </div>
      <div class="section-content">
        <NSpace
          align="center"
          :size="12"
          style="margin-bottom: 12px"
        >
          <span>预览次数：</span>
          <NInputNumber
            v-model:value="previewN"
            :min="1"
            :max="50"
            size="small"
            style="width: 100px"
          />
        </NSpace>
        <C_Cron
          v-model="previewExpr"
          :preview-count="previewN"
          :show-templates="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    CronValidation,
    CronExpose,
  } from '@robot-admin/naive-ui-components'

  const message = useMessage()

  // ─── 基础用法 ──────────────────────────────────

  const basicExpr = ref('0 30 8 * * ?')
  const basicValid = ref(true)

  /** 表达式变更回调 */
  function onBasicChange(value: string) {
    console.log('[Cron] 表达式变更:', value)
  }

  /** 校验状态变更回调 */
  function onValidation(result: CronValidation) {
    basicValid.value = result.valid
  }

  // ─── 隐藏秒 ────────────────────────────────────

  const noSecExpr = ref('0 0 12 * * ?')

  // ─── 精简模式 ──────────────────────────────────

  const compactExpr = ref('0 0 0 * * ?')

  // ─── 编程控制 ──────────────────────────────────

  const programRef = ref<CronExpose>()
  const programExpr = ref('0 0 0 1 * ?')

  /** 获取当前值 */
  function handleGetValue() {
    const value = programRef.value?.getValue()
    message.success(`当前值：${value}`)
  }

  /** 手动校验 */
  function handleValidate() {
    const result = programRef.value?.validate()
    if (result?.valid) {
      message.success('校验通过')
    } else {
      message.error(`校验失败：${result?.message}`)
    }
  }

  // ─── 预览次数 ──────────────────────────────────

  const previewN = ref(20)
  const previewExpr = ref('0 0/30 * * * ?')
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
