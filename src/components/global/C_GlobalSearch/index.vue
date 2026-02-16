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
  import { useGlobalSearch } from '@/composables/GlobalSearch/useGlobalSearch'

  const {
    showDialog,
    searchValue,
    selectedIndex,
    searchInputRef,
    isDark,
    filteredMenuItems,
    displayHistory,
    hasResults,
    hasContent,
    getItemClasses,
    highlightMatch,
    formatMenuPath,
    clearHistory,
    removeHistoryItem,
    openDialog,
    closeDialog,
    selectHistoryItem,
    selectItem,
    handleEnter,
    focusNext,
    focusPrev,
  } = useGlobalSearch()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
