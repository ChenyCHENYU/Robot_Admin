<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-10 08:34:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-12 20:30:40
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
   * * @description: 顶部导航菜单的局部主题覆盖（亮色主题）- 优化版
   * * 使用透明背景和精致的玻璃质感效果
   * ! @return {*} 主题覆盖对象
   */
  const lightMenuThemeOverrides = {
    // 菜单项文字颜色 - 使用深蓝灰色，更柔和
    itemTextColor: 'rgba(51, 65, 85, 0.85)',
    itemTextColorHover: 'rgba(30, 64, 175, 0.95)',
    itemTextColorActive: 'rgba(30, 64, 175, 1)',
    itemTextColorActiveHover: 'rgba(30, 64, 175, 1)',
    itemTextColorChildActive: 'rgba(30, 64, 175, 1)',

    // 菜单项图标颜色
    itemIconColor: 'rgba(51, 65, 85, 0.7)',
    itemIconColorHover: 'rgba(30, 64, 175, 0.85)',
    itemIconColorActive: 'rgba(30, 64, 175, 1)',
    itemIconColorActiveHover: 'rgba(30, 64, 175, 1)',
    itemIconColorChildActive: 'rgba(30, 64, 175, 1)',

    // 菜单项背景色 - 使用透明和玻璃质感
    itemColorHover: 'rgba(30, 64, 175, 0.06)',
    itemColorActive: 'rgba(30, 64, 175, 0.1)',
    itemColorActiveHover: 'rgba(30, 64, 175, 0.12)',
    itemColorActiveCollapsed: 'rgba(30, 64, 175, 0.1)',

    // 箭头颜色
    arrowColor: 'rgba(51, 65, 85, 0.6)',
    arrowColorHover: 'rgba(30, 64, 175, 0.8)',
    arrowColorActive: 'rgba(30, 64, 175, 1)',
    arrowColorChildActive: 'rgba(30, 64, 175, 1)',

    // 菜单项高度和内边距 - 优化尺寸
    itemHeight: '42px',
    itemPadding: '0 18px',
    itemBorderRadius: '10px',

    // 分组标题颜色
    groupTextColor: 'rgba(51, 65, 85, 0.65)',
  }

  /**
   * * @description: 顶部导航菜单的局部主题覆盖（暗色主题）- 优化版
   * * 增强对比度和视觉层次
   * ! @return {*} 主题覆盖对象
   */
  const darkMenuThemeOverrides = {
    // 菜单项文字颜色 - 提高对比度
    itemTextColor: 'rgba(226, 232, 240, 0.85)',
    itemTextColorHover: 'rgba(255, 255, 255, 0.95)',
    itemTextColorActive: 'rgba(147, 197, 253, 1)',
    itemTextColorActiveHover: 'rgba(147, 197, 253, 1)',
    itemTextColorChildActive: 'rgba(147, 197, 253, 1)',

    // 菜单项图标颜色
    itemIconColor: 'rgba(226, 232, 240, 0.7)',
    itemIconColorHover: 'rgba(255, 255, 255, 0.85)',
    itemIconColorActive: 'rgba(147, 197, 253, 1)',
    itemIconColorActiveHover: 'rgba(147, 197, 253, 1)',
    itemIconColorChildActive: 'rgba(147, 197, 253, 1)',

    // 菜单项背景色 - 使用蓝色调
    itemColorHover: 'rgba(59, 130, 246, 0.1)',
    itemColorActive: 'rgba(59, 130, 246, 0.15)',
    itemColorActiveHover: 'rgba(59, 130, 246, 0.18)',
    itemColorActiveCollapsed: 'rgba(59, 130, 246, 0.15)',

    // 箭头颜色
    arrowColor: 'rgba(226, 232, 240, 0.5)',
    arrowColorHover: 'rgba(255, 255, 255, 0.7)',
    arrowColorActive: 'rgba(147, 197, 253, 1)',
    arrowColorChildActive: 'rgba(147, 197, 253, 1)',

    // 菜单项高度和内边距
    itemHeight: '42px',
    itemPadding: '0 18px',
    itemBorderRadius: '10px',

    // 分组标题颜色
    groupTextColor: 'rgba(226, 232, 240, 0.6)',
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
      '--active-bg': overrides.itemColorActive,
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
    // 参考优化后的菜单项样式和实际DOM测量结果
    const ITEM_PADDING = 36 // 左右 padding: 0 18px = 36px
    const ITEM_MARGIN = 8 // 左右 margin: 0 4px = 8px
    const CHAR_WIDTH = 12 // 字符宽度（根据实际测量优化：中文字符约11-12px）
    const ICON_WIDTH = 26 // 图标宽度（18px + 8px margin-right）
    const EXTRA_SPACE = 5 // 额外安全空间（减小到 5px，避免过度保守）

    const title = item.meta?.title || item.name || ''
    const textWidth = title.length * CHAR_WIDTH
    const iconWidth = item.meta?.icon ? ICON_WIDTH : 0

    return textWidth + iconWidth + ITEM_PADDING + ITEM_MARGIN + EXTRA_SPACE
  }

  /**
   * * @description: 计算可以显示的菜单项数量
   * ? @param {number} containerWidth 容器宽度
   * ! @return {number} 可见菜单项数量
   */
  const calculateVisibleCount = (containerWidth: number): number => {
    if (!props.data.length) return 0

    const MORE_BUTTON_WIDTH = 80 // "..."按钮的宽度（包含 padding 和 margin）
    const SAFETY_MARGIN = 15 // 安全边距（减小到 15px，避免过度保守）

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

    // 深度样式：去除菜单的背景色
    :deep(.n-menu) {
      background-color: transparent !important;

      .n-menu-item {
        position: relative;
        font-weight: 500;
        letter-spacing: 0.01em;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        // 添加微妙的底部边框效果（仅活跃状态）
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            currentColor,
            transparent
          );
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.n-menu-item--selected::after {
          transform: translateX(-50%) scaleX(1);
          opacity: 0.5;
        }

        // 悬停时轻微上移
        &:hover {
          transform: translateY(-1px);
        }

        // 添加细腻的阴影
        &.n-menu-item--selected {
          box-shadow:
            0 2px 8px -2px rgba(30, 64, 175, 0.15),
            0 1px 3px rgba(30, 64, 175, 0.1);
        }
      }
    }
  }

  .more-menu-trigger {
    flex-shrink: 0;
    margin-left: 4px;
  }

  .more-btn {
    min-width: 42px;
    height: 42px;
    padding: 0 18px !important;
    border-radius: 10px !important;
    background-color: transparent !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    /* 隐藏 NButton 的边框 */
    &::before,
    :deep(.n-button__border),
    :deep(.n-button__state-border) {
      display: none !important;
    }

    &:hover {
      color: var(--hover-color) !important;
      background-color: var(--hover-bg) !important;
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px -2px rgba(30, 64, 175, 0.12),
        0 1px 3px rgba(30, 64, 175, 0.08);
    }

    &:active {
      background-color: var(--active-bg) !important;
      transform: translateY(0);
    }
  }
</style>
