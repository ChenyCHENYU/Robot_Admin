<template>
  <div
    class="project-homepage"
    :class="{ 'dark-theme': isDarkTheme }"
  >
    <!-- 顶部横幅 -->
    <section class="hero-banner">
      <div class="hero-content">
        <!-- 左侧：项目信息 -->
        <div class="project-intro">
          <NTag
            class="project-badge"
            type="success"
            round
          >
            <template #icon>
              <div class="badge-dot"></div>
            </template>
            开源项目 · MIT License
          </NTag>

          <h1 class="project-title">
            <span
              class="title-main"
              @mouseenter="startAnimation"
              @mouseleave="stopAnimation"
            >
              <span
                v-for="(char, index) in titleChars"
                :key="index"
                class="title-char"
                :style="{ animationDelay: `${index * 0.1}s` }"
                :class="{ animate: isAnimating }"
              >
                {{ char === ' ' ? '&nbsp;' : char }}
              </span>
            </span>
            <div class="title-accent-bar"></div>
            <span class="title-desc">现代化企业级后台管理系统</span>
          </h1>

          <div class="project-tagline">
            <p class="tagline-headline">
              面向复杂业务场景的
              <strong>Vue 3 企业级架构基座</strong>，标准化工程方案
            </p>
            <p class="tagline-star">
              🎉 欢迎体验，如果对你有帮助，点个
              <span class="star-em">⭐ Star</span>
              是最大的支持！大大的尊敬~ Respect 🙏
            </p>
          </div>

          <!-- 架构演进路径 -->
          <div class="arch-roadmap">
            <template
              v-for="(stat, index) in projectStats"
              :key="stat.label"
            >
              <div
                class="arch-stage"
                :class="{
                  'is-active': stat.number === '当前',
                  'is-done': stat.number === '已完成',
                  'is-planned': stat.number === '规划中',
                }"
              >
                <div class="stage-dot">
                  <C_Icon
                    :name="
                      stat.number === '已完成'
                        ? 'mdi:check-bold'
                        : stat.number === '当前'
                          ? 'mdi:map-marker'
                          : 'mdi:clock-outline'
                    "
                    size="14"
                  />
                </div>
                <div class="stage-info">
                  <span class="stage-name">{{ stat.label }}</span>
                  <span class="stage-status-text">{{ stat.number }}</span>
                </div>
              </div>
              <div
                v-if="index < projectStats.length - 1"
                class="stage-connector"
                :class="{ 'connector-done': stat.number !== '规划中' }"
              ></div>
            </template>
          </div>

          <!-- 操作按钮 - 数据驱动 -->
          <NSpace
            class="project-actions"
            :size="20"
          >
            <NButton
              v-for="action in actionButtons"
              :key="action.text"
              :type="action.type"
              :secondary="action.secondary"
              :tertiary="action.tertiary"
              size="large"
              :strong="action.strong"
              tag="a"
              target="_blank"
              :href="action.url"
            >
              <template #icon>
                <div class="btn-icon">{{ action.icon }}</div>
              </template>
              {{ action.text }}
            </NButton>
          </NSpace>
        </div>

        <!-- 右侧：个人简介卡片 -->
        <NCard
          class="author-card"
          :bordered="false"
        >
          <div class="author-content">
            <div class="author-avatar">
              <div class="avatar-glow"></div>
              <NAvatar
                size="large"
                class="avatar-main"
                >🤖</NAvatar
              >
              <NTag
                size="small"
                type="info"
                round
                class="author-status"
              >
                <template #icon>
                  <div class="status-dot"></div>
                </template>
                Available for collaboration
              </NTag>
            </div>

            <div class="author-info">
              <h3 class="author-name">前端咔啦咪 & 敏捷追光者</h3>
              <p class="author-bio">I'M CHENY，希望可以这个应用可以帮到你</p>
              <div class="author-stats">
                <div
                  v-for="stat in reactiveAuthorStats"
                  :key="stat.label"
                  class="author-stat"
                >
                  <div class="stat-number">{{ stat.number }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </NCard>
      </div>
    </section>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 项目数据概览 -->
      <div class="metrics-strip">
        <div
          v-for="metric in projectMetrics"
          :key="metric.label"
          class="metric-item"
        >
          <C_Icon
            :name="metric.icon"
            size="18"
          />
          <span class="metric-number">{{ metric.number }}</span>
          <span class="metric-label">{{ metric.label }}</span>
        </div>
      </div>

      <!-- 核心亮点 -->
      <NCard
        class="highlights-card"
        title="核心亮点"
        :bordered="false"
      >
        <template #header-extra>
          <NTag
            type="info"
            size="small"
            >完整企业级功能生态</NTag
          >
        </template>
        <div class="highlights-grid">
          <div
            v-for="item in highlights"
            :key="item.name"
            class="highlight-item"
          >
            <div class="highlight-icon">
              <C_Icon
                :name="item.icon"
                size="26"
              />
            </div>
            <div class="highlight-body">
              <h3>{{ item.name }}</h3>
              <p>{{ item.desc }}</p>
              <NTag
                size="small"
                type="default"
                class="highlight-tech"
                >{{ item.tech }}</NTag
              >
            </div>
          </div>
        </div>
      </NCard>

      <!-- 技术栈 + 快速开始 双列 -->
      <div class="bottom-grid">
        <!-- 技术栈横向分组 -->
        <NCard
          class="tech-stack-card"
          title="技术栈"
          :bordered="false"
        >
          <template #header-extra>
            <NTag
              type="success"
              size="small"
              >现代化 · 高性能</NTag
            >
          </template>
          <div class="stack-groups">
            <div
              v-for="layer in techLayers"
              :key="layer.name"
              class="stack-group"
            >
              <div class="stack-group-label">
                <span :class="['stack-dot', layer.className]"></span>
                <span class="label-text">{{ layer.name }}</span>
              </div>
              <div class="stack-tags">
                <NTag
                  v-for="tech in layer.techs"
                  :key="tech"
                  size="small"
                  :type="layer.tagType"
                  round
                  >{{ tech }}</NTag
                >
              </div>
            </div>
          </div>
        </NCard>

        <!-- @robot-admin 生态 -->
        <NCard
          class="ecosystem-card"
          :bordered="false"
        >
          <template #header>
            <div class="ecosystem-header">
              <span class="ecosystem-title">@robot-admin 生态</span>
            </div>
          </template>
          <template #header-extra>
            <NTag
              type="warning"
              size="small"
              round
              >8 个独立 NPM 包</NTag
            >
          </template>
          <div class="ecosystem-grid">
            <a
              v-for="pkg in ecosystemPackages"
              :key="pkg.shortName"
              :href="pkg.url"
              target="_blank"
              class="pkg-item"
            >
              <div
                class="pkg-icon-wrap"
                :style="{ background: pkg.color + '1a', color: pkg.color }"
              >
                <C_Icon
                  :name="pkg.icon"
                  size="16"
                />
              </div>
              <div class="pkg-body">
                <div class="pkg-name">{{ pkg.shortName }}</div>
                <div class="pkg-desc">{{ pkg.desc }}</div>
              </div>
              <NTag
                size="small"
                type="default"
                class="pkg-version"
                >{{ pkg.version }}</NTag
              >
            </a>
          </div>
        </NCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useThemeVars } from 'naive-ui/es'
  import {
    projectStats,
    actionButtons,
    highlights,
    techLayers,
    projectMetrics,
    ecosystemPackages,
  } from './data'
  import { ref, computed, onMounted } from 'vue'

  // 主题检测
  const themeVars = useThemeVars()
  const isDarkTheme = computed(() => {
    return (
      themeVars.value.bodyColor === '#101014' ||
      themeVars.value.bodyColor.includes('18') ||
      themeVars.value.bodyColor.includes('1f')
    )
  })

  // 标题动画相关
  const isAnimating = ref(false)
  const titleChars = ref('Robot Admin'.split(''))

  const startAnimation = () => {
    isAnimating.value = true
  }

  const stopAnimation = () => {
    isAnimating.value = false
  }

  // GitHub API 数据获取
  const githubRepo = ref('ChenyCHENYU/Robot_Admin')

  // 创建响应式的作者统计数据
  const reactiveAuthorStats = ref([
    { number: '520+', label: '⭐Star' },
    { number: '52+', label: '🍴Forks' },
    { number: '397+', label: '📝Commits' },
  ])

  // 获取 GitHub 仓库数据
  const fetchGitHubData = async () => {
    try {
      // 获取仓库基本信息
      const repoResponse = await fetch(
        `https://api.github.com/repos/${githubRepo.value}`
      )
      const repoData = await repoResponse.json()

      if (repoData && !repoData.message) {
        // 格式化星标数
        const stars = repoData.stargazers_count
        const starsFormatted =
          stars >= 1000 ? `${(stars / 1000).toFixed(1)}K+` : `${stars}+`

        // 格式化forks数
        const forks = repoData.forks_count
        const forksFormatted =
          forks >= 100 ? `${Math.round(forks / 100) * 100}+` : `${forks}+`

        // 更新stars和forks
        reactiveAuthorStats.value[0].number = starsFormatted
        reactiveAuthorStats.value[1].number = forksFormatted
      }

      // 获取提交数
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${githubRepo.value}/commits?per_page=1`
      )
      const linkHeader = commitsResponse.headers.get('Link')

      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/)
        if (match && match[1]) {
          const commits = parseInt(match[1])
          const commitsFormatted =
            commits >= 1000 ? `${(commits / 1000).toFixed(1)}K+` : `${commits}+`
          reactiveAuthorStats.value[2].number = commitsFormatted
        }
      }
    } catch (error) {
      console.error('获取 GitHub 数据失败:', error)
      // 保持默认值
    }
  }

  // 组件挂载时获取数据
  onMounted(() => {
    fetchGitHubData()
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
