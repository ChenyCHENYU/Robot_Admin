<template>
  <NTooltip
    placement="bottom"
    trigger="hover"
  >
    <template #trigger>
      <NButton
        text
        @click="startGuide"
      >
        <div class="i-mdi:sign-routes" />
      </NButton>
    </template>
    <span>功能引导</span>
  </NTooltip>
</template>

<script setup lang="ts">
  import { driver } from 'driver.js'
  import 'driver.js/dist/driver.css'

  const guideSteps = [
    {
      element: '#guide-menu-top',
      popover: {
        title: '导航菜单头部区域',
        description: '在这里可以设置头部logo/头部信息',
        side: 'right' as const,
      },
    },
    {
      element: '#guide-menu',
      popover: {
        title: '导航菜单',
        description: '点击这里展开/收起侧边多级导航菜单',
        side: 'right' as const,
      },
    },
    {
      element: '#guide-menu-collapse',
      popover: {
        title: '折叠菜单',
        description: '点击这里可以折叠导航菜单，右侧区域更宽裕哦',
        side: 'right' as const,
      },
    },
    {
      element: '#guide-breadcrumb',
      popover: {
        title: '位置导航/面包屑',
        description:
          '显示当前页面位置路径，可快速返回上级，也同步了菜单导航功能哦',
      },
    },
    {
      element: '#guide-tags-view',
      popover: {
        title: '快速切换标签栏',
        description:
          '在这里帮你快速标记你的查看标签哦，便于快速回到你关注的页面哈',
        side: 'bottom' as const,
      },
    },
    {
      element: '#guide-actions',
      popover: {
        title: '整体操作区域',
        description: '这里的操作区域，我就不一一介绍了哦，你自己慢慢了解哈亲',
        side: 'bottom' as const,
      },
    },
  ]

  const startGuide = () => {
    const driverObj = driver({
      popoverClass: 'driverjs-theme', // 使用官方主题类名
      animate: true,
      showProgress: true,
      doneBtnText: '完成',
      nextBtnText: '下一步',
      prevBtnText: '上一步',
    })

    driverObj.setSteps(guideSteps)
    driverObj.drive()
  }
</script>
