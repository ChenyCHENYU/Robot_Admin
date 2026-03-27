<script setup lang="ts">
  import {
    NConfigProvider,
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NMenu,
  } from 'naive-ui'
  import { useRouter, useRoute } from 'vue-router'
  import { computed } from 'vue'

  const router = useRouter()
  const route = useRoute()

  const menuOptions = [
    { label: '物流仪表盘', key: '/' },
    { label: '运单管理', key: '/waybill' },
  ]

  const activeKey = computed(() => route.path)

  /** 菜单项切换时路由跳转 */
  function handleMenuUpdate(key: string) {
    router.push(key)
  }
</script>

<template>
  <NConfigProvider>
    <NLayout
      has-sider
      style="height: 100vh"
    >
      <NLayoutSider
        bordered
        :width="200"
        content-style="padding: 12px;"
      >
        <h2 style="text-align: center; padding: 16px 0; font-weight: bold"
          >🚛 Logistics</h2
        >
        <NMenu
          :value="activeKey"
          :options="menuOptions"
          @update:value="handleMenuUpdate"
        />
      </NLayoutSider>
      <NLayoutContent content-style="padding: 24px;">
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>
