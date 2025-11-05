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
  ]

  const currentLanguage = ref(
    (typeof window !== 'undefined' &&
      window.localStorage.getItem('robot-admin')) ||
      'zh-cn'
  )

  const handleLanguageChange = (key: string) => {
    if (key === currentLanguage.value) return
    currentLanguage.value = key
    window.localStorage.setItem('robot-admin', key)
    window.location.reload()
  }

  onMounted(() => {
    const savedLang = window.localStorage.getItem('robot-admin')
    if (savedLang && savedLang !== currentLanguage.value) {
      currentLanguage.value = savedLang
    }
  })
</script>
