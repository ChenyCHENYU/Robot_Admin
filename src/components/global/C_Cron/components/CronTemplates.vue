<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\components\CronTemplates.vue
 * @Description: Cron 常用模板（底部卡片网格）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-templates">
    <div class="cron-templates__header">
      <C_Icon
        name="mdi:lightning-bolt"
        style="font-size: 15px"
      />
      <span>常用模板</span>
    </div>

    <div class="cron-templates__cards">
      <div
        v-for="template in templates"
        :key="template.value"
        class="cron-templates__card"
        :class="{
          'cron-templates__card--active': template.value === currentValue,
        }"
        @click="$emit('select', template.value)"
      >
        <div class="cron-templates__card-name">{{ template.label }}</div>
        <div class="cron-templates__card-expr">{{ template.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CronTemplate } from '@/types/modules/cron'

  interface Props {
    templates: CronTemplate[]
    currentValue: string
  }

  defineProps<Props>()
  defineEmits<{
    select: [value: string]
  }>()
</script>

<style lang="scss" scoped>
  .cron-templates {
    &__header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 10px;
      color: var(--text-color-1);
    }

    &__cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
    }

    &__card {
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 4%, transparent);
      }

      &--active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 8%, transparent);
      }
    }

    &__card-name {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
    }

    &__card-expr {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: var(--text-color-3);
      margin-top: 2px;
    }
  }
</style>
