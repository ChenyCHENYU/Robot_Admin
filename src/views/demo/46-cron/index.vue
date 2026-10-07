<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 单实例调度工作台，交互与预览由 C_Cron 统一提供
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->
<template>
  <div class="cron-demo-page">
    <header class="cron-demo-page__intro"
      ><div
        ><span class="cron-demo-page__eyebrow">AUTOMATION / SCHEDULE</span
        ><h1>让每一次执行，都有明确的计划。</h1
        ><p
          >从常用计划开始，直观配置执行时间，检查接下来会在哪些时刻运行。</p
        ></div
      ><div class="cron-demo-page__badge"
        ><C_Icon
          name="mdi:calendar-clock-outline"
          :size="24"
        /><span
          >调度规则实验室<small>六字段 Cron · 本地时间预览</small></span
        ></div
      ></header
    >
    <C_Cron
      v-model="expression"
      :config="config"
    />
    <footer class="cron-demo-page__footer"
      ><div
        ><strong>适用范围</strong
        ><p
          >支持数字、范围、间隔与指定值；日 / 星期用 ? 互斥。星期 1–7
          对应周日–周六，不支持 L、W、# 扩展。</p
        ></div
      ><details
        ><summary>精简接入方式</summary
        ><code>&lt;C_Cron v-model="expression" :config="config" /&gt;</code
        ><p>配置模板与预览次数即可；校验、互斥和预览由组件处理。</p></details
      ></footer
    >
  </div>
</template>
<script setup lang="ts">
  import { INITIAL_PLAN, cronConfig } from './data'
  defineOptions({ name: 'Demo46Cron' })
  const expression = ref(INITIAL_PLAN)
  const config = cronConfig
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
