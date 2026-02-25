<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\components\CronPreview.vue
 * @Description: Cron 执行时间预览（紧凑布局）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-preview">
    <div class="cron-preview__header">
      <C_Icon
        name="mdi:calendar-clock"
        style="font-size: 15px"
      />
      <span>未来执行</span>
      <NSpin
        v-if="computing"
        :size="14"
      />
    </div>

    <NScrollbar style="max-height: 220px">
      <div
        v-if="nextExecutions.length > 0"
        class="cron-preview__list"
      >
        <div
          v-for="(date, index) in nextExecutions"
          :key="index"
          class="cron-preview__item"
        >
          <span class="cron-preview__idx">{{ index + 1 }}</span>
          <span class="cron-preview__date">{{ formatDate(date) }}</span>
          <span class="cron-preview__week">{{ formatWeekDay(date) }}</span>
        </div>
      </div>
      <NEmpty
        v-else
        size="small"
        description="暂无匹配"
      />
    </NScrollbar>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    nextExecutions: Date[]
    computing: boolean
    count: number
    formatDate: (date: Date) => string
    formatWeekDay: (date: Date) => string
  }

  defineProps<Props>()
</script>

<style lang="scss" scoped>
  .cron-preview {
    &__header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 6px;
      color: var(--text-color-1);
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 4px;
      border-radius: 4px;
      font-size: 12px;
      transition: background 0.2s;

      &:hover {
        background: var(--hover-color);
      }
    }

    &__idx {
      width: 16px;
      text-align: center;
      color: var(--text-color-3);
      flex-shrink: 0;
      font-size: 11px;
    }

    &__date {
      font-family: 'Courier New', Courier, monospace;
      flex: 1;
      font-size: 12px;
    }

    &__week {
      color: var(--text-color-3);
      font-size: 12px;
      flex-shrink: 0;
    }
  }
</style>
