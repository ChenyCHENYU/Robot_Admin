<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\error-page\500.vue
 * @Description: 500 异常页入口，共享布局与恢复操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <ErrorPage code="500" />
</template>

<script setup lang="ts">
  import ErrorPage from './components/ErrorPage/index.vue'
  defineOptions({ name: 'Error500Page' })
</script>
