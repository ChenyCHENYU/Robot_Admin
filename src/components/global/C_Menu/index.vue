<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 16:26:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-10 10:39:55
 * @FilePath: \Robot_Admin\src\components\global\C_Menu\index.vue
 * @Description: 菜单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NMenu
    ref="menuRef"
    :options="options"
    :expanded-keys="expandedKeys"
    :value="activeKey"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-width="collapsedWidth"
    :collapsed-icon-size="collapsedIconSize"
    :inverted="inverted"
    :theme-overrides="menuThemeOverrides"
    :dropdown-props="dropdownProps"
    :indent="24"
    :root-indent="16"
    style="
      --primary-color: var(--n-color-primary);
      --n-item-color-active: var(--primary-color);
    "
    @update:value="handleMenuClick"
    @update:expanded-keys="onExpandedKeysChange"
  />
</template>

<script setup lang="ts">
  import {
    type MenuOption,
    type MenuInst,
    type DropdownProps,
  } from 'naive-ui/es'
  import { useThemeStore } from '@/stores/theme'
  import { normalizeMenuOptions } from '@/utils/d_menu'
  import type { MenuOptions } from '@/types/modules/menu'

  const route = useRoute()
  const router = useRouter()
  const themeStore = useThemeStore()

  type MenuPropsWithData = {
    data: MenuOptions[]
    mode?: 'vertical' | 'horizontal'
    collapsed?: boolean
    collapsedWidth?: number
    collapsedIconSize?: number
    inverted?: boolean
    themeOverrides?: Record<string, any>
  }

  // 下拉菜单配置 - 用于折叠模式下的子菜单显示
  const dropdownProps: DropdownProps = {
    placement: 'right-start' as const,
    trigger: 'hover' as const,
    arrowStyle: {
      color: 'var(--n-color)',
    },
  }

  const props = withDefaults(defineProps<MenuPropsWithData>(), {
    mode: 'vertical',
    collapsed: false,
    collapsedWidth: 64,
    collapsedIconSize: 22,
    inverted: false,
  })

  // 菜单引用，用于调用showOption方法
  const menuRef = ref<MenuInst | null>(null)

  // 当前激活的菜单项 - 根据当前路由路径动态计算
  const activeKey = computed(() => route.path)

  // 展开的菜单项
  const expandedKeys = ref<string[]>([])

  const options = computed<MenuOption[]>(() => normalizeMenuOptions(props.data))

  // 菜单主题样式 - 优先使用传入的 themeOverrides，否则使用全局主题
  const menuThemeOverrides = computed(() => {
    if (props.themeOverrides) {
      return props.themeOverrides
    }
    return themeStore.themeOverrides.Menu || {}
  })

  // ⚡ 性能优化：缓存扁平化的菜单数据，避免每次点击都重新计算
  const flatMenuCache = computed(() => {
    const flatten = (items: MenuOptions[]): MenuOptions[] => {
      return items.reduce(
        (acc, item) => [
          ...acc,
          item,
          ...(item.children ? flatten(item.children) : []),
        ],
        [] as MenuOptions[]
      )
    }
    return flatten(props.data)
  })

  /**
   * * @description: 处理菜单项点击事件 - 优化版本
   * ? @param {*} key 菜单项key
   * ! @return {*} void
   */
  const handleMenuClick = (key: string) => {
    // 直接使用 key（已经是完整路径）进行跳转，无需查找
    // 菜单数据中的 key 已经被 normalizeMenuOptions 处理为完整路径
    if (key && key !== route.path) {
      router.push(key)
    }
  }

  /**
   * * @description: 获取父级菜单项的key
   * ! @return {*} string[] 父级菜单项的key数组
   */
  const findParentKeys = (
    items: MenuOptions[],
    targetPath: string,
    parentKeys: string[] = []
  ): string[] => {
    for (const item of items) {
      if (item.children?.length) {
        const currentKeys = [...parentKeys]
        // 添加当前父级菜单的key
        if (item.path) {
          const key = item.path.startsWith('/') ? item.path : `/${item.path}`
          currentKeys.push(key)
        }

        // 检查子菜单中是否包含目标路径
        const found = item.children.some(child => {
          const childPath = child.path || ''
          return (
            childPath === targetPath ||
            (child.children?.length &&
              findParentKeys(child.children, targetPath, currentKeys).length >
                0)
          )
        })

        if (found) {
          return currentKeys
        }

        // 递归查找
        const result = findParentKeys(item.children, targetPath, currentKeys)
        if (result.length > 0) {
          return result
        }
      }
    }
    return []
  }

  /**
   * * @description: 初始化展开的菜单项
   * ! @return {*}  void 初始化展开的菜单项
   */
  const initExpandedKeys = () => {
    const paths = route.path.split('/').filter(Boolean)
    const keys = new Set<string>()
    let currentPath = ''

    // 添加路径本身
    paths.forEach(path => {
      currentPath += `/${path}`
      const menuItem = flatMenuCache.value.find(item => {
        // 适配路径格式变化，同时处理path可能未定义的情况
        const itemPath = item.path || ''
        return itemPath === currentPath
      })

      if (menuItem) {
        // 使用与normalizeOptions相同的key计算逻辑
        const itemPath = menuItem.path || ''
        const key = itemPath.startsWith('/') ? itemPath : `/${itemPath}`
        keys.add(key)
      }
    })

    // 添加所有父级菜单的key
    const parentKeys = findParentKeys(props.data, route.path)
    parentKeys.forEach(key => keys.add(key))

    expandedKeys.value = Array.from(keys)
  }

  /**
   * * @description: 处理菜单展开状态变化
   * ? @param {*} keys 展开的菜单项key数组
   * ! @return {*} void 更新展开的菜单项
   */
  const onExpandedKeysChange = (keys: string[]) => (expandedKeys.value = keys)

  /**
   * * @description: 使用showOption方法展开当前路径菜单
   * ! @return {*}  void 展开当前路径菜单
   */
  const showCurrentOption = () => {
    // 使用当前路径作为key，确保当前选中菜单项可见
    if (menuRef.value) menuRef.value.showOption(activeKey.value)
  }

  // 监听路由变化，更新展开的菜单项，但不折叠现有展开的菜单
  watch(
    () => route.path,
    newPath => {
      // 获取当前路径需要展开的菜单项
      const paths = newPath.split('/').filter(Boolean)
      const currentPathKeys = new Set<string>()
      let currentPath = ''

      // 添加路径本身
      paths.forEach(path => {
        currentPath += `/${path}`
        const menuItem = flatMenuCache.value.find((item: MenuOptions) => {
          const itemPath = item.path || ''
          return itemPath === currentPath
        })

        if (menuItem) {
          const itemPath = menuItem.path || ''
          const key = itemPath.startsWith('/') ? itemPath : `/${itemPath}`
          currentPathKeys.add(key)
        }
      })

      // 添加所有父级菜单的key
      const parentKeys = findParentKeys(props.data, newPath)
      parentKeys.forEach(key => currentPathKeys.add(key))

      // 如果上面的菜单匹配没找到足够的展开项，用路径层级作为兜底
      const pathSegments = newPath.split('/').filter(Boolean)
      let fallbackPath = ''
      pathSegments.forEach(segment => {
        fallbackPath += `/${segment}`
        currentPathKeys.add(fallbackPath) // 直接按路径层级添加
      })

      // 合并现有展开的菜单和新路径需要的菜单
      const newKeys = new Set([
        ...expandedKeys.value,
        ...Array.from(currentPathKeys),
      ])
      expandedKeys.value = Array.from(newKeys)

      nextTick(() => {
        if (menuRef.value) {
          menuRef.value.showOption(newPath)
        }
      })
    },
    { immediate: true }
  )

  // 页面初始化时执行一次
  onMounted(() => {
    nextTick(() => {
      initExpandedKeys()
      showCurrentOption()
    })
  })
</script>
