<template>
  <div class="portal-workspace">
    <!-- 使用统一的 C_Header 组件，控制显示内容 -->
    <C_Header
      class="portal-c-header"
      :show-collapse="false"
      :show-breadcrumb="false"
      :show-tags-view="false"
      :full-width="true"
      :show-logo="true"
      :show-platform-title="true"
    />

    <!-- 顶部快捷栏 -->
    <div
      class="app-shortcuts"
      :class="{ expanded: isShortcutsExpanded }"
    >
      <div
        id="portal-shortcuts"
        class="shortcuts-container"
      >
        <button
          v-for="app in systems"
          :key="app.id"
          type="button"
          class="shortcut-item"
          :class="{ active: activeAppId === app.id }"
          :aria-pressed="activeAppId === app.id"
          @click="handleShortcutClick(app)"
        >
          <div
            class="shortcut-icon"
            :style="{ background: app.color }"
          >
            <Icon
              :icon="app.icon"
              :size="12"
            />
          </div>
          <span class="shortcut-label">{{ app.name }}</span>
          <span
            v-if="app.integrated"
            class="integrated-badge"
          >
            <i class="i-ri:checkbox-circle-fill"></i>
            已集成
          </span>
          <span
            v-else
            class="integrated-badge pending"
          >
            <i class="i-ri:time-line"></i>
            待集成
          </span>
        </button>
      </div>

      <!-- 展开/收起按钮 -->
      <button
        v-if="systems.length > 5"
        type="button"
        class="expand-toggle"
        :title="isShortcutsExpanded ? '收起' : '点击加载更多'"
        :aria-expanded="isShortcutsExpanded"
        aria-controls="portal-shortcuts"
        :aria-label="isShortcutsExpanded ? '收起快捷应用' : '展开快捷应用'"
        @click="isShortcutsExpanded = !isShortcutsExpanded"
      >
        <Icon
          :icon="
            isShortcutsExpanded
              ? 'ri:arrow-up-double-line'
              : 'ri:arrow-down-double-line'
          "
          :size="14"
        />
      </button>
    </div>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-grid">
        <!-- 左侧栏 -->
        <aside class="left-column">
          <!-- 用户卡片 -->
          <div class="user-card">
            <div class="user-info">
              <div class="user-avatar">
                <Icon
                  icon="ri:user-smile-line"
                  :size="24"
                />
              </div>
              <div class="user-text">
                <div class="user-name">Hi, {{ userName }}</div>
                <div class="user-subtitle"
                  >门户布局示例 · 任务与消息为演示数据</div
                >
              </div>
            </div>

            <div class="user-stats">
              <div class="stat-box">
                <div class="stat-num">{{ taskSummary.pending }}</div>
                <div class="stat-label">待处理示例</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ taskSummary.total }}</div>
                <div class="stat-label">任务示例</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ taskSummary.completed }}</div>
                <div class="stat-label">完成示例</div>
              </div>
            </div>
          </div>

          <!-- 待办任务 -->
          <div class="card">
            <div class="task-list">
              <div
                v-for="todo in todoList"
                :key="todo.id"
                class="task-item"
              >
                <div class="task-content">
                  <div class="task-title">{{ todo.title }}</div>
                  <div class="task-time">{{ todo.time }}</div>
                </div>
                <div
                  class="task-badge"
                  :class="todo.statusClass"
                >
                  {{ todo.statusText }}
                </div>
              </div>
            </div>
          </div>

          <!-- 外部协办 -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">外部协办</span>
              <a
                href="#"
                class="card-more"
                >more+</a
              >
            </div>
            <div class="external-list">
              <div
                v-for="item in externalItems"
                :key="item.id"
                class="external-item"
              >
                <div class="external-indicator">
                  <div
                    class="indicator-bar"
                    :style="{ background: item.color }"
                  ></div>
                  <span
                    class="indicator-label"
                    :style="{ color: item.color }"
                    >通知</span
                  >
                </div>
                <div class="external-content">
                  <div class="external-text">{{ item.title }}</div>
                  <div class="external-time">{{ item.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 中间内容区 -->
        <section class="center-column">
          <!-- 子应用推送数据 -->
          <div
            v-if="microAppData.length > 0 || isDataExpanded"
            class="micro-app-data-card card"
          >
            <div
              class="data-card-header"
              role="button"
              tabindex="0"
              :aria-expanded="isDataExpanded"
              aria-controls="micro-app-data-content"
              @click="isDataExpanded = !isDataExpanded"
              @keydown.enter.self="isDataExpanded = !isDataExpanded"
              @keydown.space.prevent.self="isDataExpanded = !isDataExpanded"
            >
              <div class="header-left">
                <span class="data-icon">📊</span>
                <span class="data-title">子应用推送数据</span>
                <span class="data-badge">{{ microAppData.length }}</span>
              </div>
              <div class="header-right">
                <NButton
                  size="small"
                  text
                  aria-label="刷新子应用数据"
                  @click.stop="loadMicroAppData"
                >
                  <template #icon>
                    <Icon
                      icon="ri:refresh-line"
                      :size="16"
                    />
                  </template>
                </NButton>
                <NButton
                  size="small"
                  text
                  aria-label="清空子应用数据"
                  @click.stop="clearMicroAppData"
                >
                  <template #icon>
                    <Icon
                      icon="ri:delete-bin-line"
                      :size="16"
                    />
                  </template>
                </NButton>
                <Icon
                  :icon="
                    isDataExpanded
                      ? 'ri:arrow-up-s-line'
                      : 'ri:arrow-down-s-line'
                  "
                  :size="16"
                  class="expand-icon"
                />
              </div>
            </div>

            <div
              id="micro-app-data-content"
              v-show="isDataExpanded"
              class="data-card-content"
            >
              <NEmpty
                v-if="microAppData.length === 0"
                description="暂无推送数据"
                size="small"
                style="padding: 20px 0"
              />
              <div
                v-else
                class="data-list"
              >
                <div
                  v-for="(item, index) in microAppData"
                  :key="index"
                  class="data-item"
                >
                  <div class="data-item-header">
                    <NTag
                      type="success"
                      size="small"
                      :bordered="false"
                    >
                      {{ item.module }}
                    </NTag>
                    <span class="data-time">{{
                      formatTime(item.timestamp)
                    }}</span>
                  </div>
                  <div class="data-item-content">
                    <pre>{{ JSON.stringify(item.data, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 常用功能 -->
          <div class="card app-function-card">
            <div class="card-header">
              <span class="card-title">常用功能</span>
            </div>
            <div class="app-grid">
              <button
                v-for="app in appCenterItems"
                :key="app.id"
                type="button"
                class="app-cell"
                @click="handleAppClick(app)"
              >
                <div
                  class="app-icon-box"
                  :style="{
                    '--app-icon-bg': app.bgColor,
                    '--app-icon-color': app.color,
                  }"
                >
                  <Icon
                    :icon="app.icon"
                    :size="28"
                  />
                </div>
                <div class="app-name">{{ app.name }}</div>
              </button>
            </div>
          </div>

          <!-- 消息中心 -->
          <div class="card message-card">
            <div class="card-header">
              <span class="card-title">消息中心</span>
              <span class="card-more">more+</span>
            </div>
            <div
              class="tab-group"
              role="tablist"
              aria-label="消息筛选"
            >
              <button
                type="button"
                class="tab-btn"
                role="tab"
                :class="{ active: messageTab === 'all' }"
                :aria-selected="messageTab === 'all'"
                @click="messageTab = 'all'"
                >全部</button
              >
              <button
                type="button"
                class="tab-btn"
                role="tab"
                :class="{ active: messageTab === 'unread' }"
                :aria-selected="messageTab === 'unread'"
                @click="messageTab = 'unread'"
                >未读</button
              >
            </div>
            <div class="message-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message-item"
              >
                <div class="message-icon-wrapper">
                  <div
                    class="message-icon"
                    :style="{ backgroundColor: msg.bgColor }"
                  >
                    <Icon
                      :icon="msg.icon"
                      :size="8"
                      :style="{ color: msg.color }"
                    />
                  </div>
                </div>
                <div class="message-content">
                  <div class="message-text">{{ msg.title }}</div>
                </div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右侧栏 -->
        <aside class="right-column">
          <!-- 天气卡片 -->
          <div class="weather-card">
            <div class="weather-circle"></div>
            <div class="weather-header">
              <div class="weather-main">
                <span class="temp-large">{{ currentDay }}</span>
                <div class="temp-small-wrapper">
                  <span class="temp-divider">/</span>
                  <span class="temp-small">{{ weather.temperature }}°C</span>
                </div>
              </div>
              <div class="weather-desc">{{ weather.description }}</div>
            </div>
            <div class="weather-details">
              <div class="detail-item">
                <Icon
                  icon="ri:water-percent-line"
                  :size="20"
                />
                <div class="detail-text">
                  <span class="detail-label">湿度: {{ weather.humidity }}</span>
                </div>
              </div>
              <div class="detail-item">
                <Icon
                  icon="ri:navigation-line"
                  :size="20"
                />
                <div class="detail-text">
                  <span class="detail-label"
                    >风向:{{ weather.windDirection }}</span
                  >
                </div>
              </div>
              <div class="detail-item">
                <Icon
                  icon="ri:windy-line"
                  :size="20"
                />
                <div class="detail-text">
                  <span class="detail-label">风力:{{ weather.windPower }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 日历 -->
          <div class="card calendar-card">
            <div class="calendar-nav">
              <button
                type="button"
                class="nav-arrow"
                aria-label="上个月"
                @click="prevMonth"
              >
                <Icon
                  icon="ri:arrow-left-s-line"
                  :size="14"
                />
              </button>
              <span class="calendar-title">{{ calendarTitle }}</span>
              <button
                type="button"
                class="nav-arrow"
                aria-label="下个月"
                @click="nextMonth"
              >
                <Icon
                  icon="ri:arrow-right-s-line"
                  :size="14"
                />
              </button>
            </div>
            <div class="calendar-body">
              <div class="calendar-weekdays">
                <div
                  v-for="day in weekDays"
                  :key="day"
                  class="weekday"
                  >{{ day }}</div
                >
              </div>
              <div class="calendar-dates">
                <div
                  v-for="date in calendarDates"
                  :key="date.key"
                  class="date-cell"
                  :class="{
                    today: date.isToday,
                    'other-month': date.isOtherMonth,
                  }"
                >
                  {{ date.day }}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'PortalPage' })
  import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
  import { Icon } from '@iconify/vue'
  import { MENU_COLLAPSE_KEY } from '@robot-admin/layout/naive'
  import { s_userStore } from '@/stores/user'
  import { useRouter } from 'vue-router'
  import { usePortalWeather } from './usePortalWeather'
  import { usePortalMicroApps } from './usePortalMicroApps'
  import {
    systems,
    todoList,
    externalItems,
    appCenterItems,
    messages,
    weekDays,
    type App,
  } from './data'

  const taskSummary = {
    pending: todoList.filter(item => item.statusClass === 'progress').length,
    completed: todoList.filter(item => item.statusClass === 'done').length,
    total: todoList.length,
  }
  const router = useRouter()
  const userStore = s_userStore()
  const userName = computed(() => userStore.userInfo?.username || '访客')

  // 为 C_Header 提供必要的上下文
  const portalCollapsed = ref(false)
  const handleCollapsedChange = (collapsed: boolean) => {
    portalCollapsed.value = collapsed
  }

  provide(MENU_COLLAPSE_KEY, {
    isCollapsed: computed(() => portalCollapsed.value),
    handleCollapsedChange,
  })
  const activeAppId = ref('data-analytics')
  const messageTab = ref('all')
  const isShortcutsExpanded = ref(false)
  const isDataExpanded = ref(false)

  const { weather, fetchWeather } = usePortalWeather()
  const { microAppData, loadMicroAppData, clearMicroAppData } =
    usePortalMicroApps()
  const today = ref(new Date())
  const currentDay = computed(() => today.value.getDate().toString())
  const currentDate = ref(new Date())

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // ===== 日历模块 =====

  const calendarTitle = computed(() => {
    const d = currentDate.value
    return `${d.getFullYear()}年 ${d.getMonth() + 1}月`
  })

  const generateDates = (
    length: number,
    offset: number,
    isOther: boolean,
    prefix: string
  ) =>
    Array.from({ length }, (_, i) => ({
      day: offset + i,
      isOtherMonth: isOther,
      isToday:
        !isOther &&
        currentDate.value.getFullYear() === today.value.getFullYear() &&
        currentDate.value.getMonth() === today.value.getMonth() &&
        offset + i === today.value.getDate(),
      key: `${prefix}-${i}`,
    }))

  const calendarDates = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDayWeek = new Date(year, month, 1).getDay() || 7
    const totalDays = new Date(year, month + 1, 0).getDate()
    const prevMonthLastDay = new Date(year, month, 0).getDate()

    const prevDates = generateDates(
      firstDayWeek - 1,
      prevMonthLastDay - firstDayWeek + 2,
      true,
      'prev'
    )
    const currentDates = generateDates(totalDays, 1, false, 'current')
    const nextDates = generateDates(
      42 - prevDates.length - currentDates.length,
      1,
      true,
      'next'
    )

    return [...prevDates, ...currentDates, ...nextDates]
  })

  const changeMonth = (offset: number) => {
    const d = currentDate.value
    currentDate.value = new Date(d.getFullYear(), d.getMonth() + offset)
  }

  const prevMonth = () => changeMonth(-1)
  const nextMonth = () => changeMonth(1)

  // ===== 应用交互 =====
  const handleShortcutClick = (app: App) => {
    activeAppId.value = app.id
    if (app.url) {
      router.push(app.url)
    } else if (app.port) {
      router.push(`/micro-app/${app.id}`)
    }
  }

  const handleAppClick = handleShortcutClick

  // ===== 定时器 =====
  const updateDateTime = () => {
    today.value = new Date()
  }

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    updateDateTime()
    void fetchWeather()
    timer = setInterval(() => {
      updateDateTime()
      void fetchWeather()
    }, 3600000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
