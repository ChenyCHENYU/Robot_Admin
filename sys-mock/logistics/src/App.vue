<!--
 * @Description: 物流管理系统 - 根组件
 * @Author: Robot Admin
 * @Date: 2025-12-24
-->
<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
  >
    <NMessageProvider>
      <NNotificationProvider>
        <NDialogProvider>
          <div
            class="logistics-app"
            :data-theme="appStore.theme.mode"
          >
            <!-- 公共头部 - 样式复用主应用 -->
            <AppHeader v-if="!isMicroApp" />

            <!-- 主内容区 -->
            <div class="app-main">
              <RouterView v-slot="{ Component }">
                <Transition
                  name="fade"
                  mode="out-in"
                >
                  <component
                    :is="Component"
                    v-if="Component"
                  />
                  <div
                    v-else
                    class="loading-fallback"
                  >
                    <h2>加载中...</h2>
                  </div>
                </Transition>
              </RouterView>
            </div>
          </div>
        </NDialogProvider>
      </NNotificationProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
  import { useAppStore } from './stores/app'
  import AppHeader from './components/AppHeader.vue'

  const appStore = useAppStore()

  // 判断是否在微前端环境中
  const isMicroApp = ref(!!window.__MICRO_APP_ENVIRONMENT__)

  onMounted(() => {
    console.log('📦 物流应用已挂载，微前端环境:', isMicroApp.value)
  })

  // Naive UI 主题
  const naiveTheme = computed(() => {
    return appStore.theme.isDark ? darkTheme : null
  })

  // 主题覆盖配置
  const themeOverrides = computed<GlobalThemeOverrides>(() => ({
    common: {
      primaryColor: '#5B8FF9',
      primaryColorHover: '#4A7FE8',
      primaryColorPressed: '#3969D4',
      primaryColorSuppl: '#6EA8FE',
    },
  }))

  // 监听主题变化
  watch(
    () => appStore.theme.mode,
    mode => {
      document.documentElement.setAttribute('data-theme', mode)
    },
    { immediate: true }
  )
</script>

<style lang="scss">
  .logistics-app {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--app-bg-color);
    transition: background 0.3s ease;

    .app-main {
      flex: 1;
      overflow: hidden;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
