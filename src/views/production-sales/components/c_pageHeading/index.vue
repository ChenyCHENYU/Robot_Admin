<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\components\c_pageHeading\index.vue
 * @Description: 产销业务页面标题与操作区
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <header class="business-page-heading">
    <div class="business-page-heading__identity">
      <span class="business-page-heading__icon"
        ><C_Icon
          type="svg"
          :svg-path="PAGE_ICON"
          :size="24"
          aria-hidden="true"
      /></span>
      <div
        ><div class="business-page-heading__eyebrow">{{ eyebrow }}</div
        ><div class="business-page-heading__title"
          ><h1>{{ title }}</h1
          ><NTag
            size="small"
            :bordered="false"
            round
            type="info"
            >{{ badge }}</NTag
          ></div
        ><p>{{ description }}</p></div
      >
    </div>
    <div class="business-page-heading__actions"><slot /></div>
  </header>
</template>
<script setup lang="ts">
  import { PAGE_ICON } from '../../shared/presentation'
  interface Props {
    title: string
    eyebrow: string
    description: string
    badge?: string
  }
  defineOptions({ name: 'ProductionSalesPageHeading' })
  withDefaults(defineProps<Props>(), { badge: '本地业务演示' })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
