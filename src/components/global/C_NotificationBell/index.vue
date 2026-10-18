<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 顶部消息预览与完整消息中心共用领域状态
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="notification-bell"
    data-testid="notification-bell"
  >
    <C_NotificationCenter
      :controller="controller"
      :data-mode="store.mode"
      @view-all="openInbox()"
    />
  </div>
</template>

<script setup lang="ts">
  import { useNotificationBell } from './data'

  defineOptions({ name: 'NotificationBell' })
  const { controller, store, openInbox } = useNotificationBell()
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
