<template>
  <NLayoutHeader
    bordered
    :position="props.fullWidth ? 'static' : 'absolute'"
    :class="[
      'layout-header',
      themeStore.isDark ? 'dark-theme' : 'light-theme',
      'px-20px flex flex-col items-center top-0 z-1000',
      props.fullWidth ? '' : 'left-0 right-0',
    ]"
    :style="{
      height: `${settingsStore.headerHeight + (settingsStore.showTagsView ? settingsStore.tagsViewHeight : 0)}px`,
    }"
  >
    <!--* 头部 - 上方 -->
    <div
      class="header-top w-full"
      :style="{ height: `${settingsStore.headerHeight}px` }"
    >
      <div
        class="header-content w-full h-full flex items-center justify-between"
      >
        <!-- 左侧：折叠菜单或 Logo -->
        <div class="flex items-center">
          <!-- 折叠按钮 -->
          <div
            v-if="props.showCollapse"
            id="guide-menu-collapse"
          >
            <NTooltip>
              <template #trigger>
                <NButton
                  text
                  @click="handleCollapsedChange(!isCollapsed)"
                >
                  <i
                    :class="[
                      'transition-all duration-300 ease-in-out',
                      isCollapsed
                        ? 'i-ri:menu-fold-4-fill rotate-0'
                        : 'i-ri:menu-fold-3-fill rotate-360',
                    ]"
                  ></i>
                </NButton>
              </template>
              折叠菜单
            </NTooltip>
          </div>

          <!-- Logo 标识 -->
          <div
            v-if="props.showLogo"
            class="header-logo-icon flex items-center justify-center"
            @click="showSystemDrawer = true"
            style="cursor: pointer"
          >
            <i
              class="i-ri:apps-2-line text-20px"
              style="color: #5b8ff9"
            ></i>
          </div>

          <!-- 平台标题 -->
          <div
            v-if="props.showPlatformTitle"
            class="platform-title"
          >
            <span class="title-text">Robot Admin</span>
            <span class="title-subtitle">工业互联网平台</span>
          </div>
        </div>

        <!-- 中间：面包屑导航 -->
        <div
          v-if="props.showBreadcrumb"
          class="flex-1 min-w-0"
          :style="{
            visibility: settingsStore.showBreadcrumb ? 'visible' : 'hidden',
          }"
        >
          <C_Breadcrumb />
        </div>

        <!-- 右侧：统一操作区 -->
        <div class="flex items-center gap-3">
          <!-- 工作台按钮 - 玻璃质感设计 -->
          <button
            v-if="props.showPortalButton"
            class="portal-button"
            @click="handleGoToPortal"
          >
            <i class="i-ri:computer-line"></i>
            <span>工作台</span>
          </button>

          <C_NavbarRight
            v-if="props.showNavbarRight"
            v-model:show-settings="showSettings"
          />
        </div>
      </div>
    </div>

    <!--* 头部 - 下方 -->
    <div
      v-if="props.showTagsView && settingsStore.showTagsView"
      class="header-bottom w-full flex items-end"
      :style="{ height: `${settingsStore.tagsViewHeight}px` }"
    >
      <C_TagsView />
    </div>

    <!-- 设置面板 -->
    <C_Settings v-model:show="showSettings" />

    <!-- 系统菜单抽屉 -->
    <NDrawer
      v-model:show="showSystemDrawer"
      :width="1200"
      placement="left"
      class="system-drawer"
    >
      <NDrawerContent
        title="系统菜单"
        closable
        class="system-drawer-content"
      >
        <div class="drawer-layout">
          <!-- 左侧系统列表 -->
          <div class="system-list">
            <div class="search-box">
              <NInput
                v-model:value="searchKeyword"
                placeholder="请输入搜索关键字"
                clearable
              >
                <template #prefix>
                  <i class="i-ri:search-line"></i>
                </template>
              </NInput>
            </div>
            <div class="system-items">
              <template
                v-for="system in systemList"
                :key="system.id"
              >
                <div
                  v-if="system.isGroup"
                  class="system-item group-title"
                >
                  <C_Icon
                    :name="system.icon.replace('i-', '')"
                    :size="16"
                  />
                  <span>{{ system.name }}</span>
                </div>
                <div
                  v-else
                  class="system-item"
                  :class="{
                    active: activeSystemId === system.id,
                    'child-item': system.parent,
                  }"
                  @mouseenter="handleSystemHover(system)"
                >
                  <C_Icon
                    :name="system.icon.replace('i-', '')"
                    :size="16"
                  />
                  <span>{{ system.name }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- 右侧菜单内容 -->
          <div class="menu-content">
            <div class="content-header">
              <C_Icon
                v-if="activeSystem?.icon"
                :name="activeSystem.icon.replace('i-', '')"
                :size="20"
              />
              <span class="system-name">{{ activeSystem?.name }}</span>
            </div>

            <!-- 收藏卡片网格 -->
            <div v-if="activeSystemId === 'favorite'">
              <C_Favorites />
            </div>

            <!-- 普通菜单列表 -->
            <div
              v-else
              class="menu-groups"
            >
              <div
                v-for="group in activeSystem?.menuGroups"
                :key="group.title"
                class="menu-group"
              >
                <div class="group-title">{{ group.title }}</div>
                <div class="menu-items">
                  <!-- 递归渲染菜单项 -->
                  <template
                    v-for="item in group.items"
                    :key="item.name"
                  >
                    <!-- 二级分组 -->
                    <div
                      v-if="item.isGroup"
                      class="sub-group"
                    >
                      <div class="sub-group-title">
                        <i
                          v-if="item.icon"
                          :class="item.icon"
                          class="text-14px"
                        ></i>
                        <span>{{ item.name }}</span>
                      </div>
                      <div class="sub-group-items">
                        <!-- 三级子项或三级分组 -->
                        <template
                          v-for="subItem in item.children"
                          :key="subItem.name"
                        >
                          <!-- 三级分组 -->
                          <div
                            v-if="subItem.isSubGroup"
                            class="third-level-group"
                          >
                            <div class="third-level-title">{{
                              subItem.name
                            }}</div>
                            <div
                              v-for="thirdItem in subItem.children"
                              :key="thirdItem.name"
                              class="menu-item third-level"
                              @click="handleMenuClick(thirdItem)"
                            >
                              <span class="item-dot"></span>
                              <span class="item-name">{{
                                thirdItem.name
                              }}</span>
                              <i
                                :class="[
                                  isFavorite(thirdItem.path)
                                    ? 'i-ri:star-fill'
                                    : 'i-ri:star-line',
                                  'favorite-icon',
                                  { 'is-favorite': isFavorite(thirdItem.path) },
                                ]"
                                @click="toggleFavorite(thirdItem, $event)"
                              ></i>
                            </div>
                          </div>
                          <!-- 三级叶子节点 -->
                          <div
                            v-else
                            class="menu-item sub-item"
                            @click="handleMenuClick(subItem)"
                          >
                            <span class="item-dot"></span>
                            <span class="item-name">{{ subItem.name }}</span>
                            <i
                              :class="[
                                isFavorite(subItem.path)
                                  ? 'i-ri:star-fill'
                                  : 'i-ri:star-line',
                                'favorite-icon',
                                { 'is-favorite': isFavorite(subItem.path) },
                              ]"
                              @click="toggleFavorite(subItem, $event)"
                            ></i>
                          </div>
                        </template>
                      </div>
                    </div>
                    <!-- 普通菜单项 -->
                    <div
                      v-else
                      class="menu-item"
                      @click="handleMenuClick(item)"
                    >
                      <span class="item-name">{{ item.name }}</span>
                      <i
                        :class="[
                          isFavorite(item.path)
                            ? 'i-ri:star-fill'
                            : 'i-ri:star-line',
                          'favorite-icon',
                          { 'is-favorite': isFavorite(item.path) },
                        ]"
                        @click="toggleFavorite(item, $event)"
                      ></i>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NDrawerContent>
    </NDrawer>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  import { useSettingsStore } from '@/stores/settings'
  import { s_permissionStore } from '@/stores/permission'
  import { useRouter } from 'vue-router'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import { systemList, mockSystemMenus, type SystemMenu } from './data'
  import { s_favoritesStore } from '@/stores/favorites'
  import C_Favorites from '@/components/global/C_Favorites/index.vue'

  defineOptions({ name: 'C_Header' })

  // 定义可选的显示控制 props
  interface Props {
    showCollapse?: boolean // 是否显示折叠按钮
    showBreadcrumb?: boolean // 是否显示面包屑
    showTagsView?: boolean // 是否显示标签页
    showNavbarRight?: boolean // 是否显示右侧工具栏
    fullWidth?: boolean // 是否占据全宽（无侧边栏场景）
    showLogo?: boolean // 是否显示 Logo（门户等页面使用）
    showPortalButton?: boolean // 是否显示工作台按钮
    showPlatformTitle?: boolean // 是否显示平台标题
  }

  const props = withDefaults(defineProps<Props>(), {
    showCollapse: true,
    showBreadcrumb: true,
    showTagsView: true,
    showNavbarRight: true,
    fullWidth: false,
    showLogo: false,
    showPortalButton: false,
    showPlatformTitle: false,
  })

  const router = useRouter()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()

  // 设置面板状态
  const showSettings = ref(false)

  // 系统菜单抽屉状态
  const showSystemDrawer = ref(false)
  const activeSystemId = ref('security')
  const searchKeyword = ref('')

  // 使用 favorites store 管理收藏状态
  const favStore = s_favoritesStore()
  onMounted(() => {
    favStore.load()
  })

  const isFavorite = (path: string) => favStore.isFavorite(path)
  const toggleFavorite = (item: any, event: Event) => {
    event.stopPropagation()
    favStore.toggle(item.path)
  }

  // 提取：构建菜单项的基础数据
  const createMenuItem = (item: any) => ({
    name: item.meta?.title || item.label || item.name,
    path: item.path || item.key,
    icon: item.meta?.icon,
  })

  // 提取：构建叶子节点菜单项
  const createLeafItem = (item: any) => ({
    ...createMenuItem(item),
    isLeaf: true,
  })

  // 提取：构建带子菜单的菜单项
  const createGroupItem = (item: any, level: number, children: any[]) => ({
    ...createMenuItem(item),
    [level === 1 ? 'isGroup' : 'isSubGroup']: true,
    children,
  })

  // 递归处理菜单项 - 简化版
  const processMenuItems = (items: any[], level = 1): any[] => {
    return items.map((item: any) => {
      const hasChildren = item.children?.length > 0

      if (hasChildren) {
        const children = processMenuItems(item.children, level + 1)
        return createGroupItem(item, level, children)
      }

      return createLeafItem(item)
    })
  }

  // 提取：构建单个菜单组
  const createMenuGroup = (menu: any) => {
    const hasChildren = menu.children?.length > 0
    const items = hasChildren
      ? processMenuItems(menu.children)
      : [createLeafItem(menu)]

    return {
      title: menu.meta?.title || menu.name,
      items,
    }
  }

  // 系统菜单数据 - 使用 showMenuListGet（已处理好的菜单数据）
  const getSystemMenus = (): SystemMenu => {
    const permissionStore = s_permissionStore()
    // 🔥 关键：使用 showMenuListGet，它是经过 getShowMenuList 处理的菜单
    // 路径已经正确处理，可以直接用于跳转
    const menuList = permissionStore.showMenuListGet || []

    // 构建 Robot Admin 的菜单结构（支持三级菜单）
    const menuGroups = menuList
      .map(createMenuGroup)
      .filter(group => group.items.length > 0)

    return {
      id: 'robot-admin',
      name: 'Robot Admin 框架系统',
      icon: 'i-ri:robot-line',
      menuGroups,
    }
  }

  // 使用动态菜单
  const systemMenus = computed(() => {
    const menus: Record<string, SystemMenu> = {
      favorite: {
        id: 'favorite',
        name: '我的收藏',
        icon: 'i-ri:star-line',
        menuGroups: [], // 收藏使用卡片显示，不用 menuGroups
      },
      'robot-admin': getSystemMenus(),
      ...mockSystemMenus, // 使用导入的模拟菜单数据
    }

    return menus
  })

  // 当前选中的系统菜单
  const activeSystem = computed(() => {
    return (
      systemMenus.value[activeSystemId.value] ||
      systemMenus.value['robot-admin']
    )
  })

  // 处理系统悬停
  const handleSystemHover = (system: any) => {
    if (system.isGroup) return
    activeSystemId.value = system.id
  }

  // 处理菜单点击
  const handleMenuClick = async (item: any) => {
    if (item.path) {
      showSystemDrawer.value = false
      await nextTick()
      await router.push(item.path)
    }
  }

  // 跳转到工作台
  const handleGoToPortal = () => {
    router.push('/portal')
  }

  interface MenuCollapse {
    isCollapsed: Ref<boolean>
    handleCollapsedChange: (collapsed: boolean) => void
  }

  const { isCollapsed, handleCollapsedChange } =
    inject<MenuCollapse>('menuCollapse')!
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
