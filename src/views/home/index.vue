<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\home\index.vue
 * @Description: 响应式项目首页，展示公司上下文、授权入口与实际依赖
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="project-homepage">
    <div class="home-top-grid">
      <section
        class="home-intro"
        aria-label="项目概览"
      >
        <div class="home-intro__heading">
          <img
            src="/robot-avatar.png"
            alt="Robot Admin"
            width="64"
            height="64"
          />
          <div
            ><p class="home-eyebrow">PROJECT OVERVIEW</p
            ><h1
              >Robot Admin
              <span class="home-version">v{{ projectVersion }}</span></h1
            ></div
          >
        </div>
        <h2>统一身份，连接每个工作空间。</h2>
        <p class="home-intro__description"
          >基于 Vue 与 Naive UI
          的企业后台工程模板，将公司上下文、角色权限和通用业务组件串联到日常开发中。</p
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
            >项目与版本详情 <span aria-hidden="true">→</span></RouterLink
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
            ><div><h2>项目能力</h2><p>围绕现有功能与开发流程组织</p></div></div
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
          aria-label="技术栈"
        >
          <div class="home-panel-heading"
            ><div><h2>技术栈</h2><p>当前构建实际安装的版本</p></div></div
          >
          <div class="home-technology"
            ><div
              v-for="group in technologyGroups"
              :key="group.title"
              class="home-technology__group"
              ><h3>{{ group.title }}</h3
              ><div
                ><span
                  v-for="dependency in group.dependencies"
                  :key="dependency.name"
                  ><b>{{ dependency.name }}</b
                  ><small>{{ dependency.version }}</small></span
                ></div
              ></div
            ></div
          >
        </section>
      </div>

      <div class="home-side-column">
        <section
          class="home-panel home-ecosystem"
          aria-label="生态包"
        >
          <div class="home-panel-heading"
            ><div><h2>@robot-admin 生态包</h2><p>项目中已安装的独立包</p></div
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
    technologyGroups,
    projectResources,
  } from './data'

  defineOptions({ name: 'HomePage' })
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
  const aboutPage = computed(() =>
    workspacePages.value.find(page => page.name === 'about')
  )
  const quickEntries = computed(() =>
    workspaceEntryConfig.flatMap(entry => {
      const page = workspacePages.value.find(item => item.name === entry.name)
      return page ? [{ ...entry, title: page.meta?.title || entry.name }] : []
    })
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
