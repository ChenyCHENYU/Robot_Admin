<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\components\CronPreview.vue
 * @Description: Cron 执行时间预览
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-preview">
    <div class="cron-preview__header">
      <C_Icon
        name="mdi:calendar-clock"
        style="font-size: 16px"
      />
      <span>未来 {{ count }} 次执行时间</span>
      <NSpin
        v-if="computing"
        :size="14"
      />
    </div>

    <NScrollbar style="max-height: 280px">
      <div
        v-if="nextExecutions.length > 0"
        class="cron-preview__list"
      >
        <div
          v-for="(date, index) in nextExecutions"
          :key="index"
          class="cron-preview__item"
        >
          <NTag
            size="tiny"
            type="info"
            round
            class="cron-preview__index"
          >
            {{ index + 1 }}
          </NTag>
          <span class="cron-preview__date">{{ formatDate(date) }}</span>
          <NTag
            size="tiny"
            round
          >
            {{ formatWeekDay(date) }}
          </NTag>
        </div>
      </div>
      <NEmpty
        v-else
        size="small"
        description="暂无匹配的执行时间"
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
      margin-bottom: 8px;
      color: var(--text-color-1);
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
      transition: background 0.2s;

      &:hover {
        background: var(--hover-color);
      }
    }

    &__index {
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }

    &__date {
      font-family: 'Courier New', Courier, monospace;
      flex: 1;
    }
  }
</style>
