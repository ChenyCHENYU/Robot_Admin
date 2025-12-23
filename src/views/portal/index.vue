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
      <div class="shortcuts-container">
        <div
          v-for="app in systems"
          :key="app.id"
          class="shortcut-item"
          :class="{ active: activeAppId === app.id }"
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
        </div>
      </div>

      <!-- 展开/收起按钮 -->
      <div
        v-if="systems.length > 5"
        class="expand-toggle"
        :title="isShortcutsExpanded ? '收起' : '点击加载更多'"
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
      </div>
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
                <div class="user-subtitle">欢迎回来！</div>
              </div>
            </div>

            <div class="user-stats">
              <div class="stat-box">
                <div class="stat-num">249</div>
                <div class="stat-label">待处理</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">1,852</div>
                <div class="stat-label">我发起</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">505</div>
                <div class="stat-label">已完成</div>
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
                >更多</a
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
          <!-- 常用功能 -->
          <div class="card app-function-card">
            <div class="card-header">
              <span class="card-title">常用功能</span>
            </div>
            <div class="app-grid">
              <div
                v-for="app in appCenterItems"
                :key="app.id"
                class="app-cell"
                @click="handleAppClick(app)"
              >
                <div
                  class="app-icon-box"
                  :style="{ backgroundColor: app.bgColor }"
                >
                  <Icon
                    :icon="app.icon"
                    :size="24"
                    :style="{ color: app.color }"
                  />
                </div>
                <div class="app-name">{{ app.name }}</div>
              </div>
            </div>
          </div>

          <!-- 消息中心 -->
          <div class="card message-card">
            <div class="card-header">
              <span class="card-title">消息中心</span>
              <a
                href="#"
                class="card-more"
                >更多</a
              >
            </div>
            <div class="tab-group">
              <button
                class="tab-btn"
                :class="{ active: messageTab === 'all' }"
                @click="messageTab = 'all'"
                >全部</button
              >
              <button
                class="tab-btn"
                :class="{ active: messageTab === 'unread' }"
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
              <div class="weather-date">
                <span class="date-num">{{ currentDay }}</span>
                <div class="date-info">
                  <span class="temp-divider">/</span>
                  <span class="temp-value">{{ temperature }}°C</span>
                  <div class="weather-label">{{ weatherDesc }}</div>
                </div>
              </div>
            </div>
            <div class="weather-details">
              <div class="detail-row">
                <Icon
                  icon="ri:drop-line"
                  :size="12"
                />
                <span>湿度：{{ humidity }}</span>
              </div>
              <div class="detail-row">
                <Icon
                  icon="ri:windy-line"
                  :size="12"
                />
                <span>风向：西南</span>
              </div>
              <div class="detail-row">
                <Icon
                  icon="ri:eye-line"
                  :size="12"
                />
                <span>风力：≤3</span>
              </div>
            </div>
          </div>

          <!-- 日历 -->
          <div class="card calendar-card">
            <div class="calendar-nav">
              <button
                @click="prevMonth"
                class="nav-arrow"
              >
                <Icon
                  icon="ri:arrow-left-s-line"
                  :size="14"
                />
              </button>
              <span class="calendar-title">{{ calendarTitle }}</span>
              <button
                @click="nextMonth"
                class="nav-arrow"
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
  import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
  import { Icon } from '@iconify/vue'
  import { s_userStore } from '@/stores/user'
  import { useRouter } from 'vue-router'
  import C_Header from '@/components/global/C_Header/index.vue'
  import {
    systems,
    todoList,
    externalItems,
    appCenterItems,
    messages,
    weekDays,
    type App,
  } from './data'

  const router = useRouter()
  const userStore = s_userStore()

  const userName = computed(() => userStore.userInfo?.username || '李梦')

  // 为 C_Header 提供必要的上下文
  const isCollapsed = ref(false)
  const handleCollapsedChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }

  provide('menuCollapse', {
    isCollapsed,
    handleCollapsedChange,
  })
  const activeAppId = ref('data-analytics')
  const messageTab = ref('all')

  // 快捷栏展开状态
  const isShortcutsExpanded = ref(false)

  const currentDay = ref('27')
  const temperature = ref('16')
  const weatherDesc = ref('晴')
  const humidity = ref('85')

  const currentDate = ref(new Date(2030, 9, 1)) // 2030年10月

  const calendarTitle = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth() + 1
    return `${year}年 ${month}月`
  })

  const calendarDates = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prevLastDay = new Date(year, month, 0)

    const firstDayWeek = firstDay.getDay() || 7
    const dates = []

    for (let i = firstDayWeek - 1; i > 0; i--) {
      dates.push({
        day: prevLastDay.getDate() - i + 1,
        isOtherMonth: true,
        isToday: false,
        key: `prev-${i}`,
      })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isToday = year === 2030 && month === 9 && i === 12
      dates.push({
        day: i,
        isOtherMonth: false,
        isToday,
        key: `current-${i}`,
      })
    }

    const remainingDays = 42 - dates.length
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({
        day: i,
        isOtherMonth: true,
        isToday: false,
        key: `next-${i}`,
      })
    }

    return dates
  })

  const prevMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1
    )
  }

  const nextMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1
    )
  }

  const handleShortcutClick = (app: App) => {
    activeAppId.value = app.id
    handleAppClick(app)
  }

  const handleAppClick = (app: App) => {
    if (app.url) {
      router.push(app.url)
    } else if (app.port) {
      router.push(`/micro-app/${app.id}`)
    }
  }

  const updateDateTime = () => {
    const now = new Date()
    currentDay.value = now.getDate().toString()
  }

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    updateDateTime()
    timer = setInterval(updateDateTime, 60000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
