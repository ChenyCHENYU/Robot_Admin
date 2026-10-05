<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\home\index.vue
 * @Description: 响应式项目首页，展示真实仓库统计、多架构选择、插件生态与公司工作空间
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="project-homepage">
    <div class="home-top-grid">
      <section
        class="home-intro"
        aria-label="项目概览"
      >
        <div class="home-intro__topline">
          <div class="home-intro__heading">
            <img
              src="/robot-avatar.png"
              alt="Robot Admin"
              width="64"
              height="64"
            />
            <div
              ><p class="home-eyebrow">BUILD WITH ROBOT ADMIN</p
              ><h1
                >Robot Admin
                <span class="home-version">v{{ projectVersion }}</span></h1
              ></div
            >
          </div>
          <div
            class="home-repository"
            :aria-busy="loading"
            aria-label="GitHub 仓库统计"
          >
            <div class="home-repository__metrics">
              <a
                v-for="metric in repositoryMetrics"
                :key="metric.label"
                :href="metric.url"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`${metric.label}：${metric.value}`"
              >
                <span
                  :class="metric.icon"
                  class="home-icon"
                  aria-hidden="true"
                />
                <strong>{{ metric.value }}</strong
                ><small>{{ metric.label }}</small>
              </a>
            </div>
            <div
              class="home-repository__status"
              role="status"
            >
              <span>{{ statusText }}</span>
              <button
                v-if="failed || stats?.commits === null"
                type="button"
                :disabled="loading"
                @click="refresh"
                >重试</button
              >
            </div>
          </div>
        </div>
        <h2>一个工程底座，多种架构可能。</h2>
        <p class="home-intro__description"
          >从单体 SPA 到 Monorepo、模块联邦与 MicroApp，围绕独立发布的插件生态，
          将通用能力沉淀为可组合的企业应用底座。</p
        >
        <div class="home-intro__tags"
          ><span>Vue 3</span><span>TypeScript</span><span>Naive UI</span
          ><span>MIT 开源</span></div
        >
        <div class="home-intro__actions">
          <a
            :href="projectResources[0].url"
            target="_blank"
            rel="noopener noreferrer"
            class="home-primary-link"
            >查看项目仓库 <span aria-hidden="true">↗</span></a
          >
          <RouterLink
            v-if="aboutPage"
            :to="{ name: aboutPage.name }"
            class="home-secondary-link"
            >探索技术档案 <span aria-hidden="true">→</span></RouterLink
          >
        </div>
      </section>

      <section
        class="enterprise-overview"
        aria-label="当前公司工作空间"
      >
        <div class="home-panel-heading"
          ><div
            ><p class="home-eyebrow">CURRENT WORKSPACE</p
            ><h2>当前工作空间</h2></div
          ><span class="home-state"><i aria-hidden="true" />已登录</span></div
        >
        <template v-if="activeContext">
          <h3 class="enterprise-overview__company">{{
            activeContext.companyName
          }}</h3>
          <div class="enterprise-overview__tags"
            ><span>{{ activeContext.isPrimary ? '主公司' : '兼任公司' }}</span
            ><span
              v-for="role in activeContext.roles"
              :key="role.id"
              >{{ role.name }}</span
            ></div
          >
          <dl class="enterprise-overview__details"
            ><dt>所属租户</dt><dd>{{ activeContext.tenantName }}</dd
            ><dt>当前账号</dt><dd>{{ displayName }}</dd
            ><dt>公司切换</dt><dd>右上角头像 → 切换公司</dd></dl
          >
        </template>
        <p
          v-else
          class="home-muted"
          >{{ displayName }}，欢迎进入工作台。当前会话未提供公司信息。</p
        >
        <div class="enterprise-overview__metrics">
          <div
            ><small>可见页面</small
            ><strong>{{ workspacePages.length }} <span>个</span></strong></div
          >
          <div
            ><small>关联公司</small
            ><strong
              >{{ userStore.availableContexts.length }} <span>家</span></strong
            ></div
          >
          <div
            ><small>项目版本</small><strong>v{{ projectVersion }}</strong></div
          >
        </div>
      </section>
    </div>

    <section
      class="home-panel home-architecture"
      aria-label="多架构方案"
    >
      <div class="home-panel-heading">
        <div
          ><p class="home-eyebrow">ONE FOUNDATION · FOUR ARCHITECTURES</p
          ><h2>从快速启动，到独立演进</h2
          ><p
            >共享工程理念，按应用规模与团队边界选择架构；各方案对应独立实现分支。</p
          ></div
        >
        <span class="home-section-note">Vue 3 · TypeScript · Vite · Bun</span>
      </div>
      <div class="home-architecture__grid">
        <a
          v-for="mode in architectureModes"
          :key="mode.branch"
          :href="mode.url"
          target="_blank"
          rel="noopener noreferrer"
          class="home-architecture__item"
          :class="{
            'home-architecture__item--current': mode.branch === 'main',
          }"
        >
          <div class="home-architecture__meta"
            ><span
              :class="mode.icon"
              class="home-icon"
              aria-hidden="true"
            /><span>{{ mode.label }}</span></div
          >
          <h3>{{ mode.title }}</h3
          ><p>{{ mode.description }}</p>
          <span class="home-architecture__link"
            >查看 {{ mode.branch }} 分支 <span aria-hidden="true">↗</span></span
          >
        </a>
      </div>
    </section>

    <div class="home-content-grid">
      <div class="home-main-column">
        <section
          class="home-panel home-entry-panel"
          aria-label="功能入口"
        >
          <div class="home-panel-heading"
            ><div><h2>功能入口</h2><p>根据当前公司的菜单权限展示</p></div
            ><span class="home-section-note"
              >{{ quickEntries.length }} 个入口</span
            ></div
          >
          <div class="home-entry-grid">
            <RouterLink
              v-for="entry in quickEntries"
              :key="entry.name"
              :to="{ name: entry.name }"
              class="home-entry"
            >
              <span class="home-entry__icon"
                ><span
                  :class="entry.icon"
                  class="home-icon"
                  aria-hidden="true"
              /></span>
              <span class="home-entry__body"
                ><small>{{ entry.category }}</small
                ><strong>{{ entry.title }}</strong
                ><span>{{ entry.description }}</span></span
              >
              <span
                class="home-entry__arrow"
                aria-hidden="true"
                >→</span
              >
            </RouterLink>
          </div>
          <NEmpty
            v-if="!quickEntries.length"
            description="当前菜单没有可展示的快捷入口"
          />
        </section>

        <section
          class="home-panel"
          aria-label="项目能力"
        >
          <div class="home-panel-heading"
            ><div
              ><h2>让业务开发更专注</h2
              ><p>从身份到交付，把重复工作交给工程底座。</p></div
            ></div
          >
          <div class="home-capability-grid"
            ><article
              v-for="item in capabilities"
              :key="item.title"
              class="home-capability"
              ><span class="home-capability__icon"
                ><span
                  :class="item.icon"
                  class="home-icon"
                  aria-hidden="true" /></span
              ><div
                ><h3>{{ item.title }}</h3
                ><p>{{ item.description }}</p></div
              ></article
            ></div
          >
        </section>

        <section
          class="home-panel"
          aria-label="插件化分层"
        >
          <div class="home-panel-heading"
            ><div
              ><p class="home-eyebrow">COMPOSABLE BY DESIGN</p
              ><h2>能力独立，组合自由</h2
              ><p
                >基础服务、业务组件与应用实现分层组织，各自保持清晰边界。</p
              ></div
            ></div
          >
          <div class="home-platform">
            <article
              v-for="layer in platformLayers"
              :key="layer.number"
              class="home-platform__layer"
            >
              <span class="home-platform__number">{{ layer.number }}</span
              ><div
                ><h3>{{ layer.title }}</h3
                ><p>{{ layer.description }}</p
                ><small>{{ layer.packages }}</small></div
              >
            </article>
          </div>
        </section>
      </div>

      <div class="home-side-column">
        <section
          class="home-panel home-ecosystem"
          aria-label="生态包"
        >
          <div class="home-panel-heading"
            ><div
              ><h2>插件生态，按需组合</h2
              ><p>@robot-admin · 当前应用已接入的独立包</p></div
            ><span class="home-count">{{ ecosystemPackages.length }}</span></div
          >
          <div class="home-package-grid">
            <a
              v-for="pkg in ecosystemPackages"
              :key="pkg.name"
              :href="pkg.url"
              target="_blank"
              rel="noopener noreferrer"
              class="home-package"
              ><div class="home-package__heading"
                ><strong>{{ pkg.shortName }}</strong
                ><span>{{ pkg.version }}</span></div
              ><p>{{ pkg.description }}</p></a
            >
          </div>
        </section>
        <section
          class="home-panel"
          aria-label="项目资源"
        >
          <div class="home-panel-heading"
            ><div><h2>项目资源</h2><p>维护者 CHENY · MIT License</p></div></div
          >
          <a
            v-for="resource in projectResources"
            :key="resource.title"
            :href="resource.url"
            target="_blank"
            rel="noopener noreferrer"
            class="home-resource"
            ><span
              :class="resource.icon"
              class="home-icon"
              aria-hidden="true"
            /><div
              ><strong>{{ resource.title }}</strong
              ><small>{{ resource.description }}</small></div
            ><span aria-hidden="true">↗</span></a
          >
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { s_userStore } from '@/stores/user'
  import { s_permissionStore } from '@/stores/permission'
  import { getWorkspacePages } from './d_enterpriseOverview'
  import {
    projectVersion,
    workspaceEntryConfig,
    capabilities,
    ecosystemPackages,
    architectureModes,
    platformLayers,
    projectResources,
  } from './data'

  import { useRepositoryStats } from './useRepositoryStats'
  import { repositoryUrl } from './d_repository'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'

  defineOptions({ name: 'HomePage' })
  const { stats, loading, failed, statusText, refresh } = useRepositoryStats()
  const userStore = s_userStore()
  const permissionStore = s_permissionStore()
  const activeContext = computed(() => userStore.activeContext)
  const displayName = computed(
    () =>
      userStore.userInfo.displayName || userStore.userInfo.username || '用户'
  )
  const workspacePages = computed(() =>
    getWorkspacePages(permissionStore.showMenuListGet)
  )
  /** 缺失的公开统计保留占位，不伪造零值。 */
  const formatRepositoryCount = (value: number | null | undefined) =>
    typeof value === 'number' ? value.toLocaleString() : '—'
  const repositoryMetrics = computed(() => [
    {
      label: 'Stars',
      icon: 'i-mdi:star-outline',
      value: formatRepositoryCount(stats.value?.stars),
      url: `${repositoryUrl}/stargazers`,
    },
    {
      label: 'Forks',
      icon: 'i-mdi:source-fork',
      value: formatRepositoryCount(stats.value?.forks),
      url: `${repositoryUrl}/forks`,
    },
    {
      label: 'Commits',
      icon: 'i-mdi:source-commit',
      value: formatRepositoryCount(stats.value?.commits),
      url: `${repositoryUrl}/commits/${encodeURIComponent(stats.value?.defaultBranch ?? 'main')}`,
    },
  ])
  const aboutPage = computed(() =>
    workspacePages.value.find(page => page.name === 'about')
  )
  const quickEntries = computed(() =>
    workspaceEntryConfig.flatMap(entry => {
      const page = workspacePages.value.find(item => item.name === entry.name)
      return page
        ? [
            {
              ...entry,
              title: translateRouteTitle(page.meta?.title || entry.name),
            },
          ]
        : []
    })
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
