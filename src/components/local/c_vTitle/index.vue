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
      <div
        class="v-title__icon"
        aria-hidden="true"
      >
        <Icon
          :icon="
            DEMO_TITLE_ICONS[icon] ||
            DEMO_TITLE_ICONS['mdi:file-document-outline']
          "
        />
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
    <div
      v-if="$slots.extra"
      class="v-title__actions"
      ><slot name="extra"
    /></div>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { DEMO_TITLE_ICONS } from '@/utils/d_demoTitleIcons'
  defineOptions({ name: 'VerticalTitle' })
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
