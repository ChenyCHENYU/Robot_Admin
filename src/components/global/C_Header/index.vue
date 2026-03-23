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
        <div class="flex items-center h-full gap-12px">
          <!-- 折叠按钮 -->
          <NTooltip
            v-if="props.showCollapse"
            id="guide-menu-collapse"
            placement="bottom"
          >
            <template #trigger>
              <button
                class="collapse-trigger"
                :class="{ 'is-collapsed': isCollapsed }"
                @click="handleCollapsedChange(!isCollapsed)"
              >
                <i
                  :class="[
                    'text-18px transition-transform duration-300 ease-in-out',
                    isCollapsed ? 'i-ri:side-bar-fill' : 'i-ri:side-bar-line',
                  ]"
                ></i>
              </button>
            </template>
            {{ isCollapsed ? '展开菜单' : '收起菜单' }}
          </NTooltip>

          <!-- 分隔线（折叠按钮和面包屑之间） -->
          <div
            v-if="props.showCollapse && props.showBreadcrumb"
            class="h-16px w-1px bg-gray-200 dark:bg-gray-700 op-60"
          ></div>

          <!-- 面包屑导航（左侧模式，主应用布局用） -->
          <div
            v-if="props.showCollapse && props.showBreadcrumb"
            v-show="settingsStore.showBreadcrumb"
            class="flex-1 min-w-0 h-full flex items-center"
          >
            <C_Breadcrumb
              :label-formatter="translateRouteTitle"
              :show-icon="settingsStore.showBreadcrumbIcon"
              @select="router.push"
            />
          </div>

          <!-- Logo 标识 -->
          <div
            v-if="props.showLogo"
            class="header-logo-icon flex items-center justify-center"
            style="cursor: pointer"
            @click="showSystemDrawer = true"
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
            <span class="title-text">{{ platformTitle.main }}</span>
            <span class="title-subtitle">{{ platformTitle.subtitle }}</span>
          </div>
        </div>

        <!-- 中间：面包屑导航（居中模式，门户/微应用容器用） -->
        <div
          v-if="!props.showCollapse && props.showBreadcrumb"
          class="flex-1 min-w-0"
          :style="{
            visibility: settingsStore.showBreadcrumb ? 'visible' : 'hidden',
          }"
        >
          <C_Breadcrumb
            :label-formatter="translateRouteTitle"
            :show-icon="settingsStore.showBreadcrumbIcon"
            @select="router.push"
          />
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
      <C_TagsView :label-formatter="translateRouteTitle" />
    </div>

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
  import { s_themeStore } from '@/stores/theme'
  import { s_settingsStore } from '@/stores/settings'
  import { s_permissionStore } from '@/stores/permission'
  import { s_favoritesStore } from '@/stores/favorites'
  import { MESSAGE_TYPES } from '@shared/constants'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'
  import { getSystemTitle } from '@/config/systemTitles'
  import C_NavbarRight from '@/components/global/C_NavbarRight/index.vue'
  import C_Favorites from '@/components/global/C_Favorites/index.vue'
  import { systemList, mockSystemMenus, type SystemMenu } from './data'

  defineOptions({ name: 'C_Header' })

  // 定义可选的显示控制 props
  interface Props {
    showCollapse?: boolean
    showBreadcrumb?: boolean
    showTagsView?: boolean
    showNavbarRight?: boolean
    fullWidth?: boolean
    showLogo?: boolean
    showPortalButton?: boolean
    showPlatformTitle?: boolean
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
  const route = useRoute()
  const themeStore = s_themeStore()
  const settingsStore = s_settingsStore()

  // 动态平台标题 - 根据当前路由自动切换
  const platformTitle = computed(() => getSystemTitle(route.path))

  // 设置面板状态
  const showSettings = ref(false)

  // 系统菜单抽屉状态
  const showSystemDrawer = ref(false)
  const activeSystemId = ref('security')
  const searchKeyword = ref('')

  // 使用 favorites store 管理收藏状态
  const favStore = s_favoritesStore()

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

  // 递归处理菜单项
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
    const menuList = permissionStore.showMenuListGet || []

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
        menuGroups: [],
      },
      'robot-admin': getSystemMenus(),
      ...mockSystemMenus,
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
    if (!item.path) return

    showSystemDrawer.value = false
    await nextTick()

    const path = item.path.startsWith('/') ? item.path : `/${item.path}`

    // 判断是否在微前端子应用中（iframe 环境）
    const isInMicroApp = window !== window.parent

    if (isInMicroApp) {
      window.parent.postMessage(
        {
          type: MESSAGE_TYPES.MICRO_APP_NAVIGATE,
          payload: { path },
        },
        '*'
      )
    } else {
      await router.push(path)
    }
  }

  // 跳转到工作台
  const handleGoToPortal = () => {
    router.replace('/portal')
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
