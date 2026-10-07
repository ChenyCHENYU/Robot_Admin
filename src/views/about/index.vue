<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\about\index.vue
 * @Description: 项目与实际依赖信息，统一应用主题与响应式布局
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="about-page">
    <header class="about-heading">
      <p>ROBOT ADMIN / TECHNICAL DOSSIER</p><h1>项目技术档案</h1>
      <span>理解技术选型，核对安装版本，追溯每一项工程依赖。</span>
    </header>
    <div class="about-layout">
      <aside
        class="about-profile"
        aria-label="当前项目档案"
      >
        <div class="about-profile__identity"
          ><img
            src="/robot-avatar.png"
            alt=""
            width="48"
            height="48"
          /><div
            ><strong>Robot Admin</strong><span>企业后台工程底座</span></div
          ></div
        >
        <div class="about-profile__release"
          ><small>APPLICATION VERSION</small
          ><strong>v{{ applicationVersion }}</strong
          ><span>当前构建的项目版本</span></div
        >
        <dl class="about-hero__meta"
          ><dt>维护者</dt><dd>CHENY</dd><dt>许可证</dt><dd>MIT</dd
          ><dt>应用架构</dt><dd>单体 SPA</dd><dt>业务组件库</dt
          ><dd>{{ componentVersion }}</dd></dl
        >
        <div class="about-profile__counts"
          ><div
            ><strong>{{ productionDependencies.length }}</strong
            ><span>生产依赖</span></div
          ><div
            ><strong>{{ devDependencies.length }}</strong
            ><span>开发依赖</span></div
          ><div
            ><strong>{{ ecosystemCount }}</strong
            ><span>生态模块</span></div
          ></div
        >
        <p class="about-profile__note"
          >安装版本来自构建时的实际依赖。点击技术条目可核对包名、声明范围与应用场景。</p
        >
        <a
          :href="buildInfoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="about-profile__link"
          >查看构建身份 <span aria-hidden="true">↗</span></a
        >
        <a
          href="https://github.com/ChenyCHENYU/Robot_Admin#readme"
          target="_blank"
          rel="noopener noreferrer"
          class="about-profile__link"
          >阅读项目文档 <span aria-hidden="true">↗</span></a
        >
      </aside>
      <div class="about-content">
        <div class="about-toolbar"
          ><div
            ><h2>技术选型与模块职责</h2
            ><p>从基础框架到生态模块，查看当前应用的实际组成。</p></div
          ><NInput
            v-model:value="searchText"
            class="about-search"
            placeholder="搜索技术、包名或场景"
            clearable
            aria-label="搜索技术依赖"
        /></div>
        <section
          v-for="group in filteredTechnicalGroups"
          :key="group.number"
          class="about-selection"
          :aria-label="group.title"
        >
          <div class="about-selection__heading"
            ><span>{{ group.number }}</span
            ><div
              ><h3>{{ group.title }}</h3
              ><p>{{ group.description }}</p></div
            ><small>{{ group.items.length }} 项</small></div
          >
          <div class="about-grid">
            <button
              v-for="project in group.items"
              :key="project.name"
              type="button"
              class="about-tech"
              :aria-label="`查看 ${project.title} 详情`"
              @click="openModal(project)"
            >
              <span
                class="about-tech__mark"
                aria-hidden="true"
                >{{ project.mark }}</span
              >
              <span class="about-tech__info"
                ><strong>{{ project.title }}</strong
                ><code class="about-tech__package">{{ project.name }}</code
                ><small>{{ project.description }}</small></span
              >
              <span class="about-tech__version">{{ project.version }}</span>
            </button>
          </div>
        </section>
        <NEmpty
          v-if="!filteredTechnicalGroups.length"
          description="没有匹配的技术选型"
        />
        <div class="about-inventory-heading"
          ><h2>完整依赖清单</h2
          ><p
            >仅列直接依赖；安装版本与 package.json 声明范围可在详情中核对。</p
          ></div
        >
        <div class="about-inventory">
          <section
            v-for="group in dependencyGroups"
            :key="group.title"
            class="about-dependencies"
          >
            <div class="about-dependencies__heading"
              ><h2>{{ group.title }}</h2
              ><span>{{ group.items.length }} 个直接依赖</span></div
            >
            <C_Table
              class="about-dependencies__table"
              flex-height
              :columns="columns"
              :data="group.items"
              :row-key="row => row.name"
              :row-props="createRowProps"
              :config="{
                toolbar: { show: false },
                pagination: {
                  showSizePicker: false,
                  showQuickJumper: false,
                  pageSize: 10,
                },
                display: {
                  striped: false,
                  scrollX: 650,
                  bordered: false,
                  size: 'small',
                },
              }"
            />
          </section>
        </div>
      </div>
    </div>

    <NModal
      v-model:show="showModal"
      preset="card"
      :title="currentItem?.title"
      :style="{ width: 'min(520px, calc(100vw - 32px))' }"
      class="about-detail"
      :bordered="false"
    >
      <dl
        v-if="currentItem"
        class="about-detail__fields"
      >
        <dt>依赖包</dt><dd>{{ currentItem.name }}</dd> <dt>安装版本</dt
        ><dd>{{ currentItem.version }}</dd> <dt>声明范围</dt
        ><dd>{{ currentItem.declaredVersion }}</dd> <dt>应用场景</dt
        ><dd>{{ currentItem.description }}</dd> <dt>包信息</dt
        ><dd
          ><a
            :href="currentItem.url"
            target="_blank"
            rel="noopener noreferrer"
            >查看包主页 ↗</a
          ></dd
        >
      </dl>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { DataTableRowData } from 'naive-ui'
  import {
    applicationVersion,
    componentVersion,
    technicalGroups,
    ecosystemCount,
    productionDependencies,
    devDependencies,
    filterProjects,
    createProjectColumns,
    type ProjectItem,
  } from './data'

  defineOptions({ name: 'AboutPage' })
  const searchText = ref('')
  const showModal = ref(false)
  const currentItem = ref<ProjectItem | null>(null)
  const columns = createProjectColumns()
  const buildInfoUrl = `${import.meta.env.BASE_URL}build-info.json`
  const filteredTechnicalGroups = computed(() =>
    technicalGroups
      .map(group => ({
        ...group,
        items: filterProjects(group.items, searchText.value),
      }))
      .filter(group => group.items.length)
  )
  const dependencyGroups = computed(() => [
    {
      title: '生产依赖',
      items: filterProjects(productionDependencies, searchText.value),
    },
    {
      title: '开发依赖',
      items: filterProjects(devDependencies, searchText.value),
    },
  ])

  /** 打开依赖详情，展示安装版本和声明范围的区别。 */
  const openModal = (item: ProjectItem) => {
    currentItem.value = item
    showModal.value = true
  }
  /** 为依赖行提供详情入口。 */
  const createRowProps = (row: DataTableRowData) => ({
    style: 'cursor: pointer',
    onClick: () => openModal(row as ProjectItem),
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
