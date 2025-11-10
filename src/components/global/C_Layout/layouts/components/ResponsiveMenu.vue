<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-10 08:34:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-10 11:25:07
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\layouts\components\ResponsiveMenu.vue
 * @Description: 响应式水平菜单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    ref="menuContainerRef"
    class="responsive-menu-container"
  >
    <!-- 可见的菜单项 -->
    <div
      ref="visibleMenuRef"
      class="visible-menu"
    >
      <C_Menu
        v-if="visibleMenuItems.length > 0"
        :data="visibleMenuItems"
        mode="horizontal"
        :collapsed="false"
        :inverted="false"
        :theme-overrides="topMenuThemeOverrides"
      />
    </div>

    <!-- 更多菜单下拉 -->
    <NDropdown
      v-if="hiddenMenuItems.length > 0"
      :options="dropdownOptions"
      placement="bottom-end"
      trigger="hover"
      @select="handleMenuSelect"
    >
      <div class="more-menu-trigger">
        <NButton
          text
          class="more-btn"
          :style="moreButtonStyle"
        >
          <span class="i-mdi:dots-horizontal text-20px"></span>
        </NButton>
      </div>
    </NDropdown>
  </div>
</template>

<script setup lang="ts">
  import type { MenuOptions } from '@/types/modules/menu'
  import type { DropdownOption } from 'naive-ui/es/dropdown/src/interface'
  import { PRIMARY_COLORS } from '@/config/theme/tokens'
  import { useThemeStore } from '@/stores/theme'

  interface Props {
    data: MenuOptions[]
  }

  const props = defineProps<Props>()
  const router = useRouter()
  const themeStore = useThemeStore()

  // 根据当前主题选择对应的主题覆盖配置
  const isDarkMode = computed(() => themeStore.isDark)

  /**
   * * @description: 顶部导航菜单的局部主题覆盖（亮色主题）
   * * 只影响顶部导航的菜单样式，不污染全局配置
   * ! @return {*} 主题覆盖对象
   */
  const lightMenuThemeOverrides = {
    // 菜单项文字颜色
    itemTextColor: 'rgba(0, 0, 0, 0.85)',
    itemTextColorHover: 'rgba(0, 0, 0, 0.95)',
    itemTextColorActive: PRIMARY_COLORS.default,
    itemTextColorActiveHover: PRIMARY_COLORS.hover,
    itemTextColorChildActive: PRIMARY_COLORS.default,

    // 菜单项图标颜色
    itemIconColor: 'rgba(0, 0, 0, 0.65)',
    itemIconColorHover: 'rgba(0, 0, 0, 0.85)',
    itemIconColorActive: PRIMARY_COLORS.default,
    itemIconColorActiveHover: PRIMARY_COLORS.hover,
    itemIconColorChildActive: PRIMARY_COLORS.default,

    // 菜单项背景色
    itemColorHover: 'rgba(99, 102, 241, 0.08)',
    itemColorActive: 'rgba(99, 102, 241, 0.05)',
    itemColorActiveHover: 'rgba(99, 102, 241, 0.12)',
    itemColorActiveCollapsed: 'rgba(99, 102, 241, 0.05)',

    // 箭头颜色（用于有子菜单的项）
    arrowColor: 'rgba(0, 0, 0, 0.45)',
    arrowColorHover: 'rgba(0, 0, 0, 0.65)',
    arrowColorActive: PRIMARY_COLORS.default,
    arrowColorChildActive: PRIMARY_COLORS.default,

    // 菜单项高度和内边距
    itemHeight: '40px',
    itemPadding: '0 20px',
    itemBorderRadius: '8px',
  }

  /**
   * * @description: 顶部导航菜单的局部主题覆盖（暗色主题）
   * * 暗色主题下使用白色文字和图标
   * ! @return {*} 主题覆盖对象
   */
  const darkMenuThemeOverrides = {
    // 菜单项文字颜色 - 白色
    itemTextColor: 'rgba(255, 255, 255, 0.85)',
    itemTextColorHover: 'rgba(255, 255, 255, 0.95)',
    itemTextColorActive: '#8b5cf6', // 暗色主题使用紫色
    itemTextColorActiveHover: '#a78bfa',
    itemTextColorChildActive: '#8b5cf6',

    // 菜单项图标颜色 - 白色
    itemIconColor: 'rgba(255, 255, 255, 0.65)',
    itemIconColorHover: 'rgba(255, 255, 255, 0.85)',
    itemIconColorActive: '#8b5cf6',
    itemIconColorActiveHover: '#a78bfa',
    itemIconColorChildActive: '#8b5cf6',

    // 菜单项背景色
    itemColorHover: 'rgba(139, 92, 246, 0.08)',
    itemColorActive: 'rgba(139, 92, 246, 0.05)',
    itemColorActiveHover: 'rgba(139, 92, 246, 0.12)',
    itemColorActiveCollapsed: 'rgba(139, 92, 246, 0.05)',

    // 箭头颜色 - 白色
    arrowColor: 'rgba(255, 255, 255, 0.45)',
    arrowColorHover: 'rgba(255, 255, 255, 0.65)',
    arrowColorActive: '#8b5cf6',
    arrowColorChildActive: '#8b5cf6',

    // 菜单项高度和内边距
    itemHeight: '40px',
    itemPadding: '0 20px',
    itemBorderRadius: '8px',
  }

  // 根据主题动态选择主题覆盖配置
  const topMenuThemeOverrides = computed(() => {
    return isDarkMode.value ? darkMenuThemeOverrides : lightMenuThemeOverrides
  })

  /**
   * * @description: "..."按钮的动态样式，与菜单项保持一致
   * ! @return {*} 样式对象
   */
  const moreButtonStyle = computed(() => {
    const overrides = topMenuThemeOverrides.value
    return {
      color: overrides.itemTextColor,
      '--hover-color': overrides.itemTextColorHover,
      '--hover-bg': overrides.itemColorHover,
    }
  })

  const menuContainerRef = ref<HTMLElement>()
  const visibleMenuItems = ref<MenuOptions[]>([])
  const hiddenMenuItems = ref<MenuOptions[]>([])

  /**
   * * @description: 转换菜单数据为下拉选项
   * ! @return {*} DropdownOption[]
   */
  const dropdownOptions = computed<DropdownOption[]>(() => {
    return hiddenMenuItems.value.map(item => ({
      key: item.path || '',
      label: item.meta?.title || item.name || '',
      icon: item.meta?.icon
        ? () =>
            h(resolveComponent('C_Icon'), {
              name: item.meta?.icon,
              size: 18,
            })
        : undefined,
      // 只有当菜单项有子菜单时才添加 children 属性
      children: item.children?.length
        ? item.children.map(child => ({
            key: child.path || '',
            label: child.meta?.title || child.name || '',
            icon: child.meta?.icon
              ? () =>
                  h(resolveComponent('C_Icon'), {
                    name: child.meta?.icon,
                    size: 16,
                  })
              : undefined,
          }))
        : undefined,
    }))
  })

  /**
   * * @description: 处理下拉菜单选择
   * ? @param {string} key 菜单项key
   * ! @return {*} void
   */
  const handleMenuSelect = (key: string) => {
    if (key) {
      router.push(key)
    }
  }

  /**
   * * @description: 估算单个菜单项的宽度
   * ? @param {MenuOptions} item 菜单项
   * ! @return {number} 菜单项宽度
   */
  const estimateItemWidth = (item: MenuOptions): number => {
    // 参考 TopLayout.scss 中的菜单项样式
    const ITEM_PADDING = 40 // 左右 padding: 0 20px = 40px
    const ITEM_MARGIN = 8 // 左右 margin: 0 4px = 8px
    const CHAR_WIDTH = 15 // 稍微增加字符宽度，更保守的估算
    const ICON_WIDTH = 26 // 图标宽度（18px + 8px margin-right）

    const title = item.meta?.title || item.name || ''
    const textWidth = title.length * CHAR_WIDTH
    const iconWidth = item.meta?.icon ? ICON_WIDTH : 0

    return textWidth + iconWidth + ITEM_PADDING + ITEM_MARGIN
  }

  /**
   * * @description: 计算可以显示的菜单项数量
   * ? @param {number} containerWidth 容器宽度
   * ! @return {number} 可见菜单项数量
   */
  const calculateVisibleCount = (containerWidth: number): number => {
    if (!props.data.length) return 0

    const MORE_BUTTON_WIDTH = 80 // "..."按钮的宽度（包含 padding 和 margin）
    const SAFETY_MARGIN = 10 // 减小安全边距

    // 计算所有菜单项的总宽度
    let totalWidthWithoutMore = 0
    for (const item of props.data) {
      totalWidthWithoutMore += estimateItemWidth(item)
    }

    // 如果所有菜单项都能放下（不需要"..."按钮），直接返回全部
    if (totalWidthWithoutMore + SAFETY_MARGIN <= containerWidth) {
      return props.data.length
    }

    // 否则，需要显示"..."按钮，计算可以显示多少个菜单项
    let totalWidth = 0
    let count = 0
    const availableWidth = containerWidth - MORE_BUTTON_WIDTH - SAFETY_MARGIN

    for (const item of props.data) {
      const itemWidth = estimateItemWidth(item)
      // 检查添加这个菜单项后是否会超出可用宽度
      if (totalWidth + itemWidth <= availableWidth) {
        totalWidth += itemWidth
        count++
      } else {
        // 超出了就不再添加
        break
      }
    }

    // 至少显示一个菜单项（即使很挤）
    return Math.max(count, 1)
  }

  /**
   * * @description: 计算可见和隐藏的菜单项
   * ! @return {*} void
   */
  const calculateVisibleItems = () => {
    if (!menuContainerRef.value || !props.data.length) return

    const containerWidth = menuContainerRef.value.offsetWidth

    // 如果容器宽度为 0（可能还未渲染完成），延迟计算
    if (containerWidth === 0) {
      nextTick(() => {
        calculateVisibleItems()
      })
      return
    }

    const visibleCount = calculateVisibleCount(containerWidth)

    visibleMenuItems.value = props.data.slice(0, visibleCount)
    hiddenMenuItems.value = props.data.slice(visibleCount)
  }

  // 防抖函数
  let resizeTimer: number | null = null
  const debouncedCalculate = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = window.setTimeout(() => {
      calculateVisibleItems()
    }, 100) // 100ms 防抖
  }

  // 监听容器大小变化
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    // 延迟计算，确保 DOM 完全渲染
    nextTick(() => {
      calculateVisibleItems()
    })

    if (menuContainerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        debouncedCalculate()
      })
      resizeObserver.observe(menuContainerRef.value)
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
  })

  // 监听菜单数据变化
  watch(
    () => props.data,
    () => {
      nextTick(() => {
        calculateVisibleItems()
      })
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .responsive-menu-container {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0;
  }

  .visible-menu {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .more-menu-trigger {
    flex-shrink: 0;
    margin-left: 4px;
  }

  .more-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 20px !important;
    border-radius: 8px !important;
    background-color: transparent !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* 隐藏 NButton 的边框 */
    &::before,
    :deep(.n-button__border),
    :deep(.n-button__state-border) {
      display: none !important;
    }

    &:hover {
      color: var(--hover-color) !important;
      background-color: var(--hover-bg) !important;
    }
  }
</style>
