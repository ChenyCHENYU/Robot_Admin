<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-05-24
 * @FilePath: \Robot_Admin\src\components\global\C_MenuGrouped\index.vue
 * @Description: 分组菜单 + 右侧展开面板
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    ref="sidebarRef"
    class="mg"
    :class="{
      'mg--collapsed': collapsed,
      'mg--light': !inverted,
      'mg--signature': menuTheme === 'signature',
    }"
  >
    <template
      v-for="(group, gIdx) in groupedMenus"
      :key="group.label"
    >
      <!-- 分组标题 -->
      <div
        v-if="!collapsed"
        class="mg__group"
        :style="{ '--group-dot-color': getGroupColor(gIdx) }"
      >
        {{ fmtLabel(group) }}
      </div>
      <div
        v-else
        class="mg__group-dot"
        :style="{ background: getGroupColor(gIdx) }"
      ></div>

      <!-- 菜单项 -->
      <div
        v-for="menu in group.items"
        :key="fullPath(menu)"
        class="mg__item"
        :class="{
          'mg__item--active': isActive(menu),
          'mg__item--expanded': expandedKey === fullPath(menu),
        }"
        @click="onItemClick(menu)"
      >
        <C_Icon
          v-if="menu.meta?.icon"
          :name="menu.meta.icon"
          :size="collapsed ? 20 : 17"
          class="mg__icon"
        />
        <template v-if="!collapsed">
          <span class="mg__label">{{ fmtLabel(menu) }}</span>
          <C_Icon
            v-if="menu.children?.length"
            name="mdi:chevron-right"
            :size="14"
            class="mg__arrow"
            :class="{ 'mg__arrow--open': expandedKey === fullPath(menu) }"
          />
        </template>
      </div>
    </template>
  </div>

  <!-- 右侧展开面板 -->
  <Teleport to="body">
    <Transition name="mg-slide">
      <div
        v-if="expandedMenu"
        class="mg-panel"
        :class="{ 'mg-panel--signature': menuTheme === 'signature' }"
        :style="panelPos"
        @click.stop
      >
        <!-- 面板头部 -->
        <div class="mg-panel__hd">
          <span class="mg-panel__icon">
            <C_Icon
              v-if="expandedMenu.meta?.icon"
              :name="expandedMenu.meta.icon"
              :size="18"
            />
          </span>
          <span class="mg-panel__title">{{ fmtLabel(expandedMenu) }}</span>
          <NTag
            class="mg-panel__count"
            size="tiny"
            round
            :bordered="false"
            >{{ flatChildren.length }}</NTag
          >
          <span
            class="mg-panel__close"
            @click="closePanel"
          >
            <C_Icon
              name="mdi:close"
              :size="16"
            />
          </span>
        </div>

        <!-- 子菜单内容 -->
        <div class="mg-panel__bd">
          <!-- 有分类的子菜单（多子项的分组 + 散落项） -->
          <template v-if="hasCategories">
            <!-- 散落项（单子项 / 叶子）放在顶部扁平网格 -->
            <div
              v-if="categorizedChildren.loose.length"
              class="mg-panel__grid mg-panel__grid--top"
            >
              <div
                v-for="item in categorizedChildren.loose"
                :key="fullPath(item)"
                class="mg-panel__cell"
                :class="{
                  'mg-panel__cell--active': route.path === fullPath(item),
                }"
                @click="navigateTo(item)"
              >
                <C_Icon
                  v-if="item.meta?.icon"
                  :name="item.meta.icon"
                  :size="18"
                  class="mg-panel__cell-icon"
                />
                <span class="mg-panel__cell-text">{{ fmtLabel(item) }}</span>
              </div>
            </div>
            <!-- 分类区块 -->
            <div
              v-for="cat in categorizedChildren.cats"
              :key="cat.label"
              class="mg-panel__cat"
            >
              <div class="mg-panel__cat-label">
                <C_Icon
                  v-if="cat.icon"
                  :name="cat.icon"
                  :size="14"
                />
                {{ cat.label }}
              </div>
              <div class="mg-panel__grid">
                <div
                  v-for="leaf in cat.items"
                  :key="fullPath(leaf)"
                  class="mg-panel__cell"
                  :class="{
                    'mg-panel__cell--active': route.path === fullPath(leaf),
                  }"
                  @click="navigateTo(leaf)"
                >
                  <C_Icon
                    v-if="leaf.meta?.icon"
                    :name="leaf.meta.icon"
                    :size="18"
                    class="mg-panel__cell-icon"
                  />
                  <span class="mg-panel__cell-text">{{ fmtLabel(leaf) }}</span>
                </div>
              </div>
            </div>
          </template>
          <!-- 全部扁平子菜单（无分类） -->
          <div
            v-else
            class="mg-panel__grid"
          >
            <div
              v-for="child in flatChildren"
              :key="fullPath(child)"
              class="mg-panel__cell"
              :class="{
                'mg-panel__cell--active': route.path === fullPath(child),
              }"
              @click="navigateTo(child)"
            >
              <C_Icon
                v-if="child.meta?.icon"
                :name="child.meta.icon"
                :size="18"
                class="mg-panel__cell-icon"
              />
              <span class="mg-panel__cell-text">{{ fmtLabel(child) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import type { MenuOptions } from '@robot-admin/layout'
  import {
    DEFAULT_MENU_GROUPS,
    OTHER_GROUP_LABEL,
    GROUP_COLORS,
    type MenuGroupConfig,
  } from './data'

  defineOptions({ name: 'C_MenuGrouped' })

  const props = withDefaults(
    defineProps<{
      /** 菜单数据 */
      routes: MenuOptions[]
      /** 是否折叠 */
      collapsed?: boolean
      /** 是否反色（暗色侧边栏） */
      inverted?: boolean
      /** 菜单主题 */
      menuTheme?: 'signature' | 'standard'
      /** 分组配置 */
      groups?: MenuGroupConfig[]
      /** 标签格式化 */
      labelFormatter?: (title: string) => string
    }>(),
    {
      collapsed: false,
      inverted: false,
      menuTheme: 'standard',
      groups: () => DEFAULT_MENU_GROUPS,
    }
  )

  const emit = defineEmits<{
    select: [path: string]
  }>()

  const route = useRoute()
  const router = useRouter()

  // ============ DOM ============
  const sidebarRef = ref<HTMLElement>()

  // ============ 分组 ============
  interface MenuGroup {
    label: string
    items: MenuOptions[]
  }

  const isMatch = (cfg: MenuGroupConfig, p: string, t: string): boolean => {
    if (cfg.paths?.some(x => p === x || p.endsWith(`/${x}`))) return true
    if (cfg.keywords?.some(kw => t.includes(kw))) return true
    return false
  }

  /** 将菜单分配到对应分组桶中 */
  const assignMenus = (
    menus: MenuOptions[],
    buckets: MenuGroup[],
    other: MenuGroup
  ) => {
    for (const menu of menus) {
      const p = menu.path || menu.key || ''
      const t = menu.meta?.title || menu.name || ''
      const i = props.groups.findIndex(c => isMatch(c, p, t))
      if (i >= 0) buckets[i].items.push(menu)
      else other.items.push(menu)
    }
  }

  const groupedMenus = computed<MenuGroup[]>(() => {
    const menus = props.routes
    if (!menus?.length) return []
    const buckets: MenuGroup[] = props.groups.map(g => ({
      label: g.label,
      items: [],
    }))
    const other: MenuGroup = { label: OTHER_GROUP_LABEL, items: [] }
    assignMenus(menus, buckets, other)
    const out = buckets.filter(g => g.items.length > 0)
    if (other.items.length > 0) out.push(other)
    return out
  })

  // ============ 展开面板 ============
  const expandedKey = ref<string | null>(null)
  const expandedMenu = ref<MenuOptions | null>(null)
  const panelPos = ref<Record<string, string>>({})

  /** 面板打开时计算所有子菜单（扁平 + 分类） */
  const flatChildren = computed<MenuOptions[]>(() => {
    if (!expandedMenu.value?.children) return []
    const result: MenuOptions[] = []
    const walk = (items: MenuOptions[]) => {
      for (const item of items) {
        if (item.children?.length) walk(item.children)
        else result.push(item)
      }
    }
    walk(expandedMenu.value.children)
    return result
  })

  /** 是否有二级分类（children 中存在有多个子项的项） */
  const hasCategories = computed(() => {
    return (
      expandedMenu.value?.children?.some(
        c => c.children && c.children.length > 1
      ) ?? false
    )
  })

  /**
   * 按子分类组织（去重：单个同名子项不作为分类展示，归入扁平区域）
   */
  const categorizedChildren = computed(() => {
    if (!expandedMenu.value?.children) return { cats: [], loose: [] }
    const cats: { label: string; icon?: string; items: MenuOptions[] }[] = []
    const loose: MenuOptions[] = []

    for (const cat of expandedMenu.value.children) {
      if (cat.children && cat.children.length > 1) {
        // 有多个子项 → 作为分类
        cats.push({
          label: fmtLabel(cat),
          icon: cat.meta?.icon,
          items: cat.children,
        })
      } else if (cat.children?.length === 1) {
        // 只有1个子项 → 如果子项同名则只保留子项，否则保留子项
        loose.push(cat.children[0])
      } else {
        // 叶子节点 → 归入扁平区域
        loose.push(cat)
      }
    }
    return { cats, loose }
  })

  const getSidebarElement = () => {
    const el = sidebarRef.value
    if (!el) return null
    return el.closest(
      '.layout-sidebar, .n-layout-sider, [class*="sider"]'
    ) as HTMLElement | null
  }

  const getPanelStyle = () => {
    const menuRect = sidebarRef.value?.getBoundingClientRect()
    const rect = getSidebarElement()?.getBoundingClientRect()
    const left = rect ? rect.right : 220
    const top = menuRect ? menuRect.top : (rect?.top ?? 0)
    const height = menuRect
      ? menuRect.height
      : (rect?.height ?? window.innerHeight)
    return {
      left: `${left}px`,
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  const openPanel = (menu: MenuOptions) => {
    expandedKey.value = fullPath(menu)
    expandedMenu.value = menu
    nextTick(() => {
      panelPos.value = getPanelStyle()
    })
  }

  const updatePanelStyle = () => {
    if (!expandedMenu.value) return
    panelPos.value = getPanelStyle()
  }

  const closePanel = () => {
    expandedKey.value = null
    expandedMenu.value = null
  }

  // ============ 导航 ============
  const fullPath = (m: MenuOptions): string => {
    const p = m.path || m.key || '/'
    return p.startsWith('/') ? p : `/${p}`
  }

  const isActive = (menu: MenuOptions): boolean => {
    const cur = route.path
    const mp = fullPath(menu)
    if (cur === mp) return true
    if (menu.children?.some(c => cur === fullPath(c))) return true
    if (mp !== '/' && cur.startsWith(mp + '/')) return true
    return false
  }

  const fmtLabel = (item: MenuOptions | MenuGroup | any): string => {
    const title = item.meta?.title || item.label || item.name || ''
    return props.labelFormatter ? props.labelFormatter(title) : title
  }

  const getGroupColor = (i: number) => GROUP_COLORS[i % GROUP_COLORS.length]

  const onItemClick = (menu: MenuOptions) => {
    if (menu.children?.length) {
      // 有子菜单 → 展开/收起面板
      if (expandedKey.value === fullPath(menu)) {
        closePanel()
      } else {
        openPanel(menu)
      }
      return
    }
    // 无子菜单 → 导航
    const path = fullPath(menu)
    emit('select', path)
    router.push(path)
    closePanel()
  }

  const navigateTo = (child: MenuOptions) => {
    const path = fullPath(child)
    emit('select', path)
    router.push(path)
    closePanel()
  }

  // 路由变化时关闭面板
  watch(
    () => route.path,
    () => closePanel()
  )

  // ESC 关闭
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closePanel()
  }
  onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('resize', updatePanelStyle)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown)
    window.removeEventListener('resize', updatePanelStyle)
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>

<style lang="scss">
  @use './panel.scss';
</style>
