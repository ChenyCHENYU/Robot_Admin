<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-08 21:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 21:00:00
 * @FilePath: \Robot_Admin\src\components\local\c_vTitle\index.vue
 * @Description: 页面标题组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="v-title">
    <div class="v-title__content">
      <div class="v-title__icon">
        <Icon :icon="icon" />
      </div>
      <div class="v-title__text">
        <NH1>{{ title }}</NH1>
        <NText
          v-if="description"
          depth="3"
          class="v-title__desc"
        >
          {{ description }}
        </NText>
      </div>
    </div>
    <div class="v-title__decoration">
      <span class="decoration-dot" />
      <span class="decoration-line" />
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      title: string
      description?: string
      icon?: string
    }>(),
    {
      icon: 'mdi:file-document-outline',
    }
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
