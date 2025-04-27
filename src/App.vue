<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:55:42
 * @FilePath: \Robot_Admin\src\App.vue
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<script setup lang="ts">
  import { RouterView } from 'vue-router'
</script>

<template>
  <NMessageProvider>
    <RouterView />
  </NMessageProvider>
</template>
