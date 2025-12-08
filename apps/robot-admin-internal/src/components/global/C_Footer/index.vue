<template>
  <NLayoutFooter
    bordered
    :class="[
      'layout-footer',
      themeStore.isDark ? 'dark-theme' : 'light-theme',
      'h-50px px-20px flex items-center justify-center',
    ]"
  >
    <!-- 底部内容 -->
    Copyright MIT © 2025 by CHENY
  </NLayoutFooter>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'

  defineOptions({ name: 'C_Footer' })

  const themeStore = useThemeStore()
</script>
