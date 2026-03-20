<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 19:06:26
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-27 09:20:21
 * @FilePath: \Robot_Admin\src\views\iframe\blank-docs.vue
 * @Description: 外链内嵌文档处理页面（勿改勿删☘️不想写守卫里面，就这里玩咯）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <div class="h-full p-4">
    <!-- 外部跳转提示（仅在禁用自动打开时显示） -->
    <div
      v-if="isExternal && !autoOpen"
      class="flex items-center justify-center h-full"
    >
      <div class="text-center">
        <div class="mb-4">
          <i class="mdi mdi-open-in-new text-4xl text-blue-500"></i>
        </div>
        <p class="text-lg mb-4">{{ routeTitle }}</p>
        <button
          @click="openExternal"
          class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <i class="mdi mdi-open-in-new mr-2"></i>
          打开页面
        </button>
        <p class="text-sm text-gray-500 mt-2 break-all">{{ frameSrc }}</p>
      </div>
    </div>

    <!-- 内嵌 iframe（仅在设置为非外部时显示） -->
    <iframe
      v-else-if="!isExternal && frameSrc"
      :src="frameSrc"
      class="w-full h-full border-0 rounded shadow-sm"
      frameborder="0"
      allowfullscreen
      :sandbox="sandboxRules"
      :title="routeTitle"
    />

    <!-- 无内容 -->
    <div
      v-else-if="!frameSrc"
      class="flex items-center justify-center h-full text-gray-500"
    >
      <div class="text-center">
        <i class="mdi mdi-file-question text-4xl mb-4"></i>
        <p>暂无内容</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const route = useRoute()
  const router = useRouter()

  const frameSrc = computed(() => {
    const link = route.meta?.link
    return typeof link === 'string' ? link : ''
  })

  // 路由标题的计算属性
  const routeTitle = computed(() => {
    const title = route.meta?.title
    return typeof title === 'string' ? title : '外部页面'
  })

  // 默认为外部页面，只有明确设置 external: false 才内嵌
  const isExternal = computed(() => {
    return route.meta?.external !== false
  })

  // 默认自动打开，只有明确设置 autoOpen: false 才显示按钮
  const autoOpen = computed(() => {
    return route.meta?.autoOpen !== false
  })

  // 处理自动跳转的函数
  const handleAutoRedirect = () => {
    if (isExternal.value && autoOpen.value && frameSrc.value) {
      const target = route.meta?.target
      const targetWindow = typeof target === 'string' ? target : '_blank'

      if (targetWindow === '_self') {
        // 同窗口跳转，直接替换当前页面
        window.location.replace(frameSrc.value)
      } else {
        // 新窗口打开
        window.open(frameSrc.value, targetWindow)

        // 自动返回上一页
        nextTick(() => {
          if (window.history.length > 1) {
            router.back()
          } else {
            router.push('/')
          }
        })
      }
    }
  }

  // 使用 watchEffect 只监听相关的响应式数据变化
  // 这样只有当这个组件的相关数据变化时才会触发
  watchEffect(() => {
    // 确保所有响应式数据都已就绪
    if (frameSrc.value && isExternal.value && autoOpen.value) {
      // 使用 nextTick 确保DOM更新完成
      nextTick(() => {
        handleAutoRedirect()
      })
    }
  })

  // 可配置的沙箱规则（仅用于内嵌iframe）
  const sandboxRules = computed(() => {
    const defaultRules =
      'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation'
    const sandbox = route.meta?.sandbox
    return typeof sandbox === 'string' ? sandbox : defaultRules
  })

  const openExternal = () => {
    if (frameSrc.value) {
      const target = route.meta?.target
      const targetWindow = typeof target === 'string' ? target : '_blank'
      window.open(frameSrc.value, targetWindow)
    }
  }
</script>
