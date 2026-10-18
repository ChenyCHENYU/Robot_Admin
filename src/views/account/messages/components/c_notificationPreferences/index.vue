<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 通知分类、通道和免打扰偏好的持久化编辑
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NCard
    title="通知偏好"
    :bordered="false"
    class="notification-preferences"
  >
    <NResult
      v-if="!store.capabilities.preferences"
      status="403"
      title="当前消息服务未开放通知偏好"
      description="此能力需要服务端授权，收件功能不受影响。"
    />
    <NSpin
      v-else
      :show="loading"
    >
      <NAlert
        v-if="error"
        type="error"
        class="preferences-alert"
        >{{ error }}
        <NButton
          text
          type="primary"
          @click="load"
          >重新加载</NButton
        ></NAlert
      >
      <p class="preference-intro"
        >分类和通道偏好影响提醒与投递，不删除历史收件。重要业务仍以完整消息中心为准。</p
      >
      <div class="preference-groups">
        <section
          ><h3>关注的消息分类</h3
          ><div
            v-for="option in CATEGORY_OPTIONS"
            :key="option.value"
            class="preference-row"
            ><span>{{ option.label }}</span
            ><NSwitch
              v-model:value="
                draft.categories[option.value as NotificationCategory]
              "
              :disabled="saving || loading"
              :aria-label="option.label" /></div
        ></section>
        <section
          ><h3>允许的通知通道</h3
          ><div
            v-for="option in CHANNEL_OPTIONS"
            :key="option.value"
            class="preference-row"
            ><span>{{ option.label }}</span
            ><NSwitch
              v-model:value="
                draft.channels[option.value as NotificationChannel]
              "
              :disabled="saving || loading"
              :aria-label="option.label" /></div
        ></section>
      </div>
      <NDivider />
      <section
        ><div class="preference-row"
          ><div
            ><h3>免打扰时段</h3
            ><NText depth="3"
              >按当前设备时区计算，允许跨天；消息仍会保存，可随时查看。</NText
            ></div
          ><NSwitch
            v-model:value="draft.quietHours.enabled"
            :disabled="saving || loading"
            aria-label="开启免打扰" /></div
        ><div class="quiet-hours"
          ><NTimePicker
            v-model:formatted-value="draft.quietHours.start"
            format="HH:mm"
            value-format="HH:mm"
            :disabled="!draft.quietHours.enabled || saving || loading"
            :clearable="false"
            aria-label="免打扰开始时间" /><span>至</span
          ><NTimePicker
            v-model:formatted-value="draft.quietHours.end"
            format="HH:mm"
            value-format="HH:mm"
            :disabled="!draft.quietHours.enabled || saving || loading"
            :clearable="false"
            aria-label="免打扰结束时间" /></div
      ></section>
      <NSpace class="preferences-footer"
        ><NButton
          type="primary"
          :loading="saving"
          :disabled="loading || !!error"
          @click="save"
          >保存偏好</NButton
        ><NButton
          :disabled="saving || loading"
          @click="restore"
          >放弃修改</NButton
        ></NSpace
      >
    </NSpin>
  </NCard>
</template>

<script setup lang="ts">
  import type {
    NotificationCategory,
    NotificationChannel,
  } from '@/api/notifications.contract'
  import { useNotificationPreferences } from './useNotificationPreferences'

  defineOptions({ name: 'AccountNotificationPreferences' })

  const {
    store,
    draft,
    loading,
    saving,
    error,
    restore,
    load,
    save,
    CATEGORY_OPTIONS,
    CHANNEL_OPTIONS,
  } = useNotificationPreferences()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
