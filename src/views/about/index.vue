<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\about\index.vue
 * @Description: 项目与实际依赖信息，统一应用主题与响应式布局
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="about-page">
    <section class="about-hero">
      <div class="about-hero__identity">
        <img
          class="about-hero__logo"
          src="/robot-avatar.png"
          alt="Robot Admin"
          width="64"
          height="64"
        />
        <div>
          <p class="about-hero__eyebrow">ABOUT THE PROJECT</p>
          <h1
            >Robot Admin
            <NTag
              type="info"
              round
              >v{{ applicationVersion }}</NTag
            ></h1
          >
          <p class="about-hero__description"
            >企业后台工程底座 · 统一身份、多公司工作空间与角色权限</p
          >
        </div>
      </div>
      <div class="about-hero__meta">
        <span>维护者 <strong>CHENY</strong></span>
        <span
          >组件库 <strong>{{ componentVersion }}</strong></span
        >
        <span>许可证 <strong>MIT</strong></span>
      </div>
    </section>

    <div class="about-toolbar">
      <div
        ><h2>技术选型</h2
        ><p>版本来自当前构建实际安装的依赖，点击查看应用场景。</p></div
      >
      <NInput
        v-model:value="searchText"
        class="about-search"
        placeholder="搜索技术、包名或场景"
        clearable
        aria-label="搜索技术依赖"
      />
    </div>

    <div class="about-grid">
      <button
        v-for="project in filteredCoreProjects"
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
          ><small>{{ project.description }}</small></span
        >
        <span class="about-tech__version">{{ project.version }}</span>
      </button>
    </div>
    <NEmpty
      v-if="!filteredCoreProjects.length"
      description="没有匹配的技术选型"
    />

    <section
      v-for="group in dependencyGroups"
      :key="group.title"
      class="about-dependencies"
    >
      <div class="about-dependencies__heading"
        ><h2>{{ group.title }}</h2
        ><span>{{ group.items.length }} 个直接依赖</span></div
      >
      <NDataTable
        :columns="columns"
        :data="group.items"
        :row-key="row => row.name"
        :row-props="createRowProps"
        :pagination="{ pageSize: 10 }"
        :scroll-x="650"
        :bordered="false"
        size="small"
      />
    </section>

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
    coreProjects,
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
  const filteredCoreProjects = computed(() =>
    filterProjects(coreProjects, searchText.value)
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
