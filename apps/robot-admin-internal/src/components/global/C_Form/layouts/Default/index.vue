<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 16:58:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 21:54:14
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Default\index.vue
 * @Description:  卡片布局 - 基础默认布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="c-form-default">
    <template
      v-for="item in formItems"
      :key="item.key"
    >
      <component :is="item" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  interface Props {
    formItems: VNode[]
    layoutConfig?: any
    options?: any[]
  }

  defineProps<Props>()
</script>

<style scoped>
  .c-form-default {
    width: 100%;
  }
</style>
