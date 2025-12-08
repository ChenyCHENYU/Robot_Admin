<template>
  <div class="robot-search-palette">
    <!-- 搜索触发按钮 -->
    <div
      class="robot-search-trigger"
      :class="{ 'trigger-dark': isDark }"
      @click="openDialog"
    >
      <div class="i-mdi:search robot-trigger-icon" />
      <span class="robot-trigger-text">搜索</span>
      <span class="robot-trigger-shortcut">Ctrl K</span>
    </div>

    <!-- 搜索对话框 -->
    <Teleport to="body">
      <Transition name="robot-dialog">
        <div
          v-if="showDialog"
          class="robot-dialog-overlay"
          @click="closeDialog"
          @keydown.esc="closeDialog"
        >
          <div
            class="robot-dialog-container"
            :class="{ 'dialog-dark': isDark }"
            @click.stop
          >
            <!-- 搜索头部 -->
            <div class="robot-search-header">
              <div class="i-mdi:magnify robot-search-icon" />
              <input
                ref="searchInputRef"
                v-model="searchValue"
                type="text"
                placeholder="搜索导航菜单..."
                class="robot-search-input"
                @keydown.esc="closeDialog"
                @keydown.enter="handleEnter"
                @keydown.arrow-down="focusNext"
                @keydown.arrow-up="focusPrev"
              />
              <button
                class="robot-close-btn"
                @click="closeDialog"
              >
                <div class="i-mdi:close" />
              </button>
            </div>

            <!-- 搜索内容 -->
            <div class="robot-search-content">
              <!-- 空状态 -->
              <div
                v-if="!hasContent"
                class="robot-empty-state"
              >
                <div class="i-mdi:magnify robot-empty-icon" />
                <p>输入关键词搜索菜单</p>
              </div>

              <!-- 搜索历史 -->
              <template
                v-else-if="!searchValue.trim() && displayHistory.length > 0"
              >
                <div class="robot-search-results">
                  <div class="robot-result-group">
                    <div class="robot-group-title">
                      <div
                        class="i-mdi:clock-time-four-outline robot-group-icon"
                      />
                      最近搜索
                      <span class="robot-group-count">{{
                        displayHistory.length
                      }}</span>
                      <button
                        class="robot-clear-history"
                        @click="clearHistory"
                        title="清空历史"
                      >
                        <div class="i-mdi:delete-outline" />
                      </button>
                    </div>
                    <div class="robot-group-items">
                      <div
                        v-for="(historyItem, index) in displayHistory"
                        :key="`history-${index}`"
                        :class="getItemClasses(index, true)"
                        @click="selectHistoryItem(historyItem)"
                        @mouseenter="selectedIndex = index"
                      >
                        <component
                          v-if="historyItem.menuItem?.icon"
                          :is="historyItem.menuItem.icon"
                          class="robot-item-icon"
                        />
                        <div
                          v-else
                          class="robot-item-icon robot-default-icon"
                        >
                          <div class="i-mdi:file-document-outline" />
                        </div>
                        <div class="robot-item-content">
                          <div class="robot-item-label">{{
                            historyItem.query
                          }}</div>
                          <div class="robot-item-desc">
                            {{
                              formatMenuPath(historyItem.menuItem?.key || '')
                            }}
                          </div>
                        </div>
                        <button
                          class="robot-history-delete"
                          @click.stop="removeHistoryItem(index)"
                          title="删除此记录"
                        >
                          <div class="i-mdi:close" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 搜索结果 -->
              <template v-else-if="searchValue.trim()">
                <div class="robot-search-results">
                  <!-- 无结果状态 -->
                  <div
                    v-if="!hasResults"
                    class="robot-empty-state"
                  >
                    <div class="i-mdi:magnify robot-empty-icon" />
                    <p>未找到 "{{ searchValue }}" 相关内容</p>
                  </div>

                  <!-- 菜单搜索结果 -->
                  <div
                    v-else
                    class="robot-result-group"
                  >
                    <div class="robot-group-title">
                      <div class="i-mdi:menu robot-group-icon" />
                      菜单导航
                      <span class="robot-group-count">{{
                        filteredMenuItems.length
                      }}</span>
                    </div>
                    <div class="robot-group-items">
                      <div
                        v-for="(item, index) in filteredMenuItems"
                        :key="item.key"
                        :class="getItemClasses(index, false)"
                        @click="selectItem(item)"
                        @mouseenter="selectedIndex = index"
                      >
                        <component
                          v-if="item.icon"
                          :is="item.icon"
                          class="robot-item-icon"
                        />
                        <div
                          v-else
                          class="robot-item-icon robot-default-icon"
                        >
                          <div class="i-mdi:file-document-outline" />
                        </div>
                        <div class="robot-item-content">
                          <div
                            class="robot-item-label"
                            v-html="highlightMatch(item.label, searchValue)"
                          ></div>
                          <div class="robot-item-desc">{{
                            formatMenuPath(item.key)
                          }}</div>
                        </div>
                        <div
                          v-if="item.children?.length"
                          class="robot-item-badge"
                        >
                          {{ item.children.length }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- 搜索底部 -->
            <div class="robot-search-footer">
              <div class="robot-footer-actions">
                <div class="robot-action-item">
                  <kbd>↵</kbd><span>选择</span>
                </div>
                <div class="robot-action-item">
                  <kbd>↑↓</kbd><span>导航</span>
                </div>
                <div class="robot-action-item">
                  <kbd>esc</kbd><span>关闭</span>
                </div>
              </div>
              <div
                v-if="hasContent"
                class="robot-footer-info"
              >
                <span v-if="searchValue.trim() && hasResults">
                  共 {{ filteredMenuItems.length }} 项结果
                </span>
                <span
                  v-else-if="!searchValue.trim() && displayHistory.length > 0"
                >
                  {{ displayHistory.length }} 条历史记录
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  import { s_permissionStore } from '@/stores/permission'
  import { normalizeMenuOptions } from '@/utils/d_menu'
  import type { MenuOption } from 'naive-ui/es'

  interface SearchMenuItem {
    key: string
    label: string
    icon?: any
    children?: MenuOption[]
  }

  // 简化历史记录接口，避免递归类型问题
  interface HistoryItem {
    query: string
    menuItem: {
      key: string
      label: string
      icon?: any
      children?: any[]
    } | null
    timestamp: number
  }

  const router = useRouter()
  const themeStore = useThemeStore()
  const permissionStore = s_permissionStore()

  // 响应式数据
  const showDialog = ref(false)
  const searchValue = ref('')
  const selectedIndex = ref(0)
  const searchInputRef = ref<HTMLInputElement>()
  const searchHistory = ref<HistoryItem[]>([])

  // 计算属性
  const isDark = computed(() => themeStore.isDark)
  const menuData = computed(() => permissionStore.showMenuListGet)

  // 处理菜单数据
  const searchMenuItems = computed<SearchMenuItem[]>(() => {
    if (!menuData.value?.length) return []

    const normalizedMenu = normalizeMenuOptions(menuData.value)
    const flattenItems = (items: MenuOption[]): SearchMenuItem[] => {
      const result: SearchMenuItem[] = []
      items.forEach(item => {
        if (item.key && item.label) {
          result.push({
            key: item.key as string,
            label: item.label as string,
            icon: item.icon,
            children: item.children,
          })
        }
        if (item.children?.length) {
          result.push(...flattenItems(item.children))
        }
      })
      return result
    }
    return flattenItems(normalizedMenu)
  })

  // 过滤搜索结果
  const filteredMenuItems = computed(() => {
    if (!searchValue.value.trim()) return []
    const query = searchValue.value.toLowerCase()
    return searchMenuItems.value.filter(
      item =>
        item.label.toLowerCase().includes(query) ||
        formatMenuPath(item.key).toLowerCase().includes(query)
    )
  })

  // 显示的搜索历史（最近5条）
  const displayHistory = computed(() => searchHistory.value.slice(0, 5))
  const hasResults = computed(() => filteredMenuItems.value.length > 0)
  const hasContent = computed(
    () => hasResults.value || displayHistory.value.length > 0
  )

  // 工具函数
  const getItemClasses = (index: number, isHistory: boolean) => [
    'robot-result-item',
    isHistory && 'robot-history-item',
    { 'robot-result-item-selected': selectedIndex.value === index },
  ]

  const highlightMatch = (text: string, search: string): string => {
    if (!search) return text
    const regex = new RegExp(`(${search})`, 'gi')
    return text.replace(regex, '<mark class="robot-highlight">$1</mark>')
  }

  const formatMenuPath = (key: string): string =>
    key.replace(/^\//, '').replace(/\//g, ' > ') || '首页'

  // 搜索历史管理
  const addToHistory = (menuItem: SearchMenuItem) => {
    if (!menuItem.label.trim()) return

    const query = menuItem.label
    const timestamp = Date.now()

    // 移除重复项
    const filtered = searchHistory.value.filter(
      (item: HistoryItem) =>
        !(item.query === query && item.menuItem?.key === menuItem.key)
    )

    // 添加到开头，限制最多10条
    searchHistory.value = [{ query, menuItem, timestamp }, ...filtered].slice(
      0,
      10
    )

    // 保存到本地存储
    localStorage.setItem(
      'robot-search-history',
      JSON.stringify(searchHistory.value)
    )
  }

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('robot-search-history')
      if (saved) {
        const parsed = JSON.parse(saved)
        searchHistory.value = parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { query: item, menuItem: null, timestamp: 0 }
          }
          return item
        })
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }

  const clearHistory = () => {
    searchHistory.value = []
    localStorage.removeItem('robot-search-history')
  }

  const removeHistoryItem = (index: number) => {
    searchHistory.value.splice(index, 1)
    localStorage.setItem(
      'robot-search-history',
      JSON.stringify(searchHistory.value)
    )
    if (selectedIndex.value >= searchHistory.value.length) {
      selectedIndex.value = Math.max(0, searchHistory.value.length - 1)
    }
  }

  // 导航相关
  const findFirstChildKey = (parentKey: string): string | null => {
    const normalizedMenu = normalizeMenuOptions(menuData.value)
    const findFirst = (items: MenuOption[]): string | null => {
      for (const item of items) {
        if (item.key === parentKey && item.children?.length) {
          return (item.children[0]?.key as string) || null
        }
        if (item.children?.length) {
          const result = findFirst(item.children)
          if (result) return result
        }
      }
      return null
    }
    return findFirst(normalizedMenu)
  }

  const navigateToMenu = (key: string, hasChildren = false) => {
    if (hasChildren) {
      const firstChildKey = findFirstChildKey(key)
      if (firstChildKey) {
        router.push(firstChildKey)
        return
      }
    }
    router.push(key)
  }

  // 对话框控制
  const openDialog = async () => {
    showDialog.value = true
    searchValue.value = ''
    selectedIndex.value = 0
    await nextTick()
    searchInputRef.value?.focus()
  }

  const closeDialog = () => {
    showDialog.value = false
    searchValue.value = ''
    selectedIndex.value = 0
  }

  // 选择项目
  const selectHistoryItem = (historyItem: HistoryItem) => {
    if (historyItem.menuItem) {
      navigateToMenu(
        historyItem.menuItem.key,
        !!historyItem.menuItem.children?.length
      )
      closeDialog()
    } else {
      searchValue.value = historyItem.query
      selectedIndex.value = 0
    }
  }

  const selectItem = (item: SearchMenuItem) => {
    addToHistory(item)
    navigateToMenu(item.key, !!item.children?.length)
    closeDialog()
  }

  // 键盘导航
  const handleEnter = () => {
    const isHistoryMode =
      !searchValue.value.trim() && displayHistory.value.length > 0
    const isSearchMode =
      searchValue.value.trim() && filteredMenuItems.value.length > 0

    if (isHistoryMode) {
      const historyItem = displayHistory.value[selectedIndex.value]
      if (historyItem) selectHistoryItem(historyItem)
    } else if (isSearchMode) {
      const item = filteredMenuItems.value[selectedIndex.value]
      if (item) selectItem(item)
    }
  }

  const focusNext = () => {
    const maxIndex = !searchValue.value.trim()
      ? displayHistory.value.length - 1
      : filteredMenuItems.value.length - 1
    selectedIndex.value = Math.min(selectedIndex.value + 1, maxIndex)
  }

  const focusPrev = () => {
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  }

  // 监听器和生命周期
  watch(searchValue, () => {
    selectedIndex.value = 0
  })

  onMounted(() => {
    loadHistory()

    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        openDialog()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
