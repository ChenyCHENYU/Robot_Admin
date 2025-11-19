<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-19 08:18:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-19 11:03:54
 * @FilePath: \Robot_Admin\src\components\global\C_Language\index.vue
 * @Description: 语言切换组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NDropdown
    size="small"
    trigger="hover"
    :options="languageOptions"
    :value="currentLanguage"
    @select="handleLanguageChange"
  >
    <NButton text>
      <div class="flex items-center">
        <span class="i-mdi:language"></span>
      </div>
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
  defineOptions({ name: 'C_Language' })

  const languageOptions = [
    {
      key: 'zh-cn',
      label: '简体中文',
      icon: () => h('span', { class: 'i-mdi:alpha-c' }),
    },
    {
      key: 'en',
      label: 'English',
      icon: () => h('span', { class: 'i-mdi:alpha-u' }),
    },
    {
      key: 'ja',
      label: '日本語',
      icon: () => h('span', { class: 'i-mdi:alpha-j' }),
    },
    {
      key: 'ko',
      label: '한국어',
      icon: () => h('span', { class: 'i-mdi:alpha-k' }),
    },
  ]

  // 从 localStorage 读取当前语言
  const currentLanguage = ref(
    (typeof window !== 'undefined' &&
      window.localStorage.getItem('robot_admin')) ||
      'zh-cn'
  )

  const handleLanguageChange = (key: string) => {
    if (key === currentLanguage.value) return

    // 更新状态和存储
    currentLanguage.value = key
    window.localStorage.setItem('robot_admin', key)

    // 调用全局语言切换函数（更新 $t.locale）
    if ((window as any).$changeLang) {
      ;(window as any).$changeLang(key)
    }

    // 刷新页面以应用新语言
    window.location.reload()
  }
</script>
