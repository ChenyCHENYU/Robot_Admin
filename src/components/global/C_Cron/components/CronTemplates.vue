<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\components\CronTemplates.vue
 * @Description: Cron 常用模板选择
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-templates">
    <div class="cron-templates__header">
      <C_Icon
        name="mdi:lightning-bolt"
        style="font-size: 16px"
      />
      <span>常用模板</span>
    </div>

    <NScrollbar style="max-height: 320px">
      <div class="cron-templates__grid">
        <div
          v-for="template in templates"
          :key="template.value"
          class="cron-templates__item"
          :class="{
            'cron-templates__item--active': template.value === currentValue,
          }"
          @click="$emit('select', template.value)"
        >
          <div class="cron-templates__item-icon">
            <C_Icon
              :name="template.icon || 'mdi:clock-outline'"
              style="font-size: 18px"
            />
          </div>
          <div class="cron-templates__item-content">
            <div class="cron-templates__item-label">{{ template.label }}</div>
            <div class="cron-templates__item-desc">{{
              template.description
            }}</div>
          </div>
          <NTag
            size="tiny"
            class="cron-templates__item-expr"
          >
            {{ template.value }}
          </NTag>
        </div>
      </div>
    </NScrollbar>
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
      margin-bottom: 8px;
      color: var(--text-color-1);
    }

    &__grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        background: var(--hover-color);
        border-color: var(--border-color);
      }

      &--active {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        border-color: var(--primary-color);
      }
    }

    &__item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--hover-color);
      flex-shrink: 0;
    }

    &__item-content {
      flex: 1;
      min-width: 0;
    }

    &__item-label {
      font-weight: 500;
      font-size: 13px;
      line-height: 1.4;
    }

    &__item-desc {
      font-size: 12px;
      color: var(--text-color-3);
      line-height: 1.3;
    }

    &__item-expr {
      flex-shrink: 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
    }
  }
</style>
