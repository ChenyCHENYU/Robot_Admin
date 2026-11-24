<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\error-page\401.vue
 * @Description: 401 异常页入口，共享布局与恢复操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <ErrorPage code="401" />
</template>

<script setup lang="ts">
  import ErrorPage from './components/ErrorPage/index.vue'
  defineOptions({ name: 'Error401Page' })
</script>
