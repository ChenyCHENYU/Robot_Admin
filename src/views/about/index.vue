<template>
  <div class="tech-profile-page">
    <!-- 个人栏 -->
    <div class="profile-header">
      <div class="profile-info">
        <NAvatar
          :size="60"
          round
          src="/robot-avatar.png"
        />
        <div class="user-info">
          <div class="name-row">
            <h2>CHENY</h2>
            <NTag
              type="success"
              size="small"
              round
            >
              <template #icon>
                <i class="i-mdi:map-marker-alert-outline" />
              </template>
              Creator
            </NTag>
          </div>
          <p class="intro">一只小趴菜 | 🐔🐤🐓 菜鸡互啄</p>
          <p class="id-info">
            The following are the technical application scenarios and dependent
            versions used in the project...
          </p>
        </div>
      </div>
      <div class="profile-version">
        <span class="version-text">活跃 / 稳定</span>
      </div>
    </div>

    <!-- 项目概览 -->
    <div class="section-header">
      <span class="section-title">技术选型</span>
      <NInput
        v-model:value="searchText"
        placeholder="搜索项目…"
        size="small"
        class="project-search"
      />
    </div>

    <!-- 卡片区 -->
    <div class="cards-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.bagName"
        class="card"
        @click="openModal(project)"
      >
        <div class="icon">
          <NImage
            width="36"
            height="36"
            :src="project.icon"
            :fallback-src="useImagePath('notData')"
            preview-disabled
          />
        </div>
        <div class="info">
          <span class="title">{{ project.name }}</span>
          <span class="short-desc">{{
            project.shortDesc || project.bagName
          }}</span>
        </div>
        <NTag
          :type="getVersionType(project.version ?? '')"
          size="tiny"
          round
          class="version-tag"
        >
          {{ project.version }}
        </NTag>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <div class="table-block">
        <div class="table-title">生产依赖</div>
        <NDataTable
          :columns="projectColumns"
          :data="productionDependencies"
          size="small"
          :bordered="false"
          striped
          :row-props="createRowProps"
        />
      </div>

      <div class="table-block">
        <div class="table-title">开发依赖</div>
        <NDataTable
          :columns="devColumns"
          :data="devDependencies"
          size="small"
          :bordered="false"
          striped
          :row-props="createRowProps"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="card"
      :style="{ width: '420px' }"
      :bordered="false"
      class="detail-modal"
      :mask-closable="true"
    >
      <template #header>
        <div class="modal-header">
          <div class="icon">
            <NImage
              width="40"
              height="40"
              :src="currentItem.icon"
              :fallback-src="useImagePath('notData')"
              preview-disabled
            />
          </div>
          <div class="modal-title-block">
            <span class="modal-title">{{ currentItem.name }}</span>
            <NTag
              :type="getVersionType(currentItem.version || '')"
              size="small"
              round
            >
              {{ currentItem.version }}
            </NTag>
          </div>
        </div>
      </template>

      <div class="modal-content">
        <div class="modal-item">
          <span class="label">包名：</span>
          <span class="text">{{ currentItem.bagName }}</span>
        </div>
        <div class="modal-item">
          <span class="label">应用场景：</span>
          <span class="text">{{ currentItem.desc }}</span>
        </div>
        <div class="modal-item">
          <span class="label">官网地址：</span>
          <span class="text">
            <a
              :href="currentItem.url"
              target="_blank"
            >
              点击访问
            </a>
          </span>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import {
    NTag,
    NInput,
    NImage,
    NAvatar,
    NDataTable,
    NModal,
    type DataTableRowData,
  } from 'naive-ui/es'

  import { useImagePath } from '@/hooks/useImagePath'
  import {
    coreProjects,
    productionDependencies,
    devDependencies,
    getVersionType,
    createProjectColumns,
    createDevColumns,
    type ProjectItem,
  } from './data'

  // 响应式数据
  const searchText = ref('')
  const showModal = ref(false)
  const currentItem = ref<ProjectItem>({
    name: '',
    bagName: '',
    desc: '',
    version: '',
    icon: '',
    url: '',
  })

  // 计算属性
  const filteredProjects = computed(() => {
    const projects = coreProjects

    if (!searchText.value.trim()) return projects

    const keyword = searchText.value.toLowerCase().trim()
    return projects.filter(
      project =>
        project.name.toLowerCase().includes(keyword) ||
        project.bagName.toLowerCase().includes(keyword) ||
        project.desc.toLowerCase().includes(keyword)
    )
  })

  // 表格列配置
  const projectColumns = createProjectColumns()
  const devColumns = createDevColumns()

  /**
   * 创建行属性
   * @param row 行数据
   * @returns 行属性
   */
  function createRowProps(row: DataTableRowData) {
    return {
      style: 'cursor: pointer;',
      onClick: () => openModal(row as ProjectItem),
    }
  }

  /**
   * 打开模态框
   * @param item 项目数据
   */
  function openModal(item: ProjectItem) {
    currentItem.value = { ...item }
    showModal.value = true
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
