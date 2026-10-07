<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-28 12:25:44
 * @FilePath: \Robot_Admin\src\views\demo\08-form-modal\index.vue
 * @Description: 多模态表单 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="form-modal-demo">
    <c_vTitle
      title="表单容器组件场景示例"
      icon="mdi:form-dropdown"
      description="支持模态框、抽屉、侧边栏、气泡卡片、向导等5种表单容器场景"
    />

    <!-- 卡片网格 -->
    <div class="demo-grid">
      <NCard
        v-for="card in cards"
        :key="card.key"
        class="demo-card"
        :bordered="false"
        hoverable
        @click="openContainer(card.key)"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ card.title }}</h3>
            <NTag
              :type="card.tagType"
              size="small"
              round
            >
              {{ card.tag }}
            </NTag>
          </div>
          <p class="card-desc">{{ card.description }}</p>
        </template>

        <div class="card-features">
          <NTag
            v-for="f in card.features"
            :key="f"
            size="small"
            round
          >
            {{ f }}
          </NTag>
        </div>

        <template #action>
          <!-- Popover 特殊处理：按钮即触发器 -->
          <NPopover
            v-if="card.key === 'popover'"
            v-model:show="showPopover"
            trigger="click"
            placement="top"
            @click.stop
          >
            <template #trigger>
              <NButton
                type="primary"
                block
              >
                <template #icon>
                  <Icon :icon="card.buttonIcon" />
                </template>
                {{ card.buttonText }}
              </NButton>
            </template>
            <div class="popover-form">
              <C_Form
                v-if="showPopover"
                @submit="showPopover = false"
                :options="popoverOptions"
                :config="popoverConfig"
                v-model="popoverData"
              >
                <template #action="{ submit, submitting }">
                  <NSpace justify="end">
                    <NButton
                      :disabled="submitting"
                      @click="showPopover = false"
                      >取消</NButton
                    >
                    <NButton
                      type="primary"
                      :loading="submitting"
                      @click="submit"
                      >保存</NButton
                    >
                  </NSpace>
                </template>
              </C_Form>
            </div>
          </NPopover>

          <NButton
            v-else
            type="primary"
            block
          >
            <template #icon>
              <Icon :icon="card.buttonIcon" />
            </template>
            {{
              card.key === 'sidebar'
                ? showSidebar
                  ? '收起侧边栏'
                  : card.buttonText
                : card.buttonText
            }}
          </NButton>
        </template>
      </NCard>
    </div>

    <!-- 模态框 -->
    <NModal
      v-model:show="showModal"
      preset="card"
      title="用户信息管理"
      :style="{ width: '600px' }"
      size="large"
    >
      <template #header-extra>
        <NTag
          type="info"
          size="small"
          >网格布局</NTag
        >
      </template>
      <C_Form
        v-if="showModal"
        :options="modalOptions"
        :config="modalConfig"
        v-model="modalData"
        @submit="showModal = false"
      />
    </NModal>

    <!-- 抽屉 -->
    <NDrawer
      v-model:show="showDrawer"
      :width="500"
      placement="right"
    >
      <NDrawerContent>
        <template #header>
          <div class="drawer-header">
            <span>商品详情配置</span>
            <NTag
              type="success"
              size="small"
              >默认布局</NTag
            >
          </div>
        </template>
        <C_Form
          v-if="showDrawer"
          @submit="showDrawer = false"
          ref="drawerFormRef"
          :options="drawerOptions"
          :config="drawerConfig"
          v-model="drawerData"
        />
        <template #footer>
          <NSpace justify="end">
            <NButton
              :disabled="drawerSubmitting"
              @click="showDrawer = false"
              >取消</NButton
            >
            <NButton
              type="primary"
              :loading="drawerSubmitting"
              @click="drawerFormRef?.submit()"
              >保存</NButton
            >
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- 侧边栏 -->
    <div
      class="sidebar"
      :class="{ collapsed: !showSidebar }"
    >
      <NCard
        v-if="showSidebar"
        class="sidebar-card"
      >
        <template #header>
          <div class="sidebar-header">
            <div class="header-info">
              <i class="i-mdi-air-filter mr-2" />
              <span>筛选条件</span>
              <NTag
                type="warning"
                size="small"
                class="ml-2"
                >紧凑布局</NTag
              >
            </div>
            <NButton
              quaternary
              circle
              size="small"
              @click="showSidebar = false"
            >
              <template #icon>
                <i class="i-mdi-close-octagon" />
              </template>
            </NButton>
          </div>
        </template>
        <C_Form
          :options="sidebarOptions"
          :config="sidebarConfig"
          v-model="sidebarData"
        />
      </NCard>
    </div>

    <!-- 步骤向导 -->
    <NModal
      v-model:show="showWizard"
      preset="card"
      title="项目创建向导"
      :style="{ width: '900px' }"
      size="huge"
      :closable="false"
    >
      <template #header-extra>
        <NTag
          type="success"
          size="small"
          >步骤布局</NTag
        >
      </template>
      <C_Form
        v-if="showWizard"
        @submit="showWizard = false"
        ref="wizardFormRef"
        :options="wizardOptions"
        :config="wizardConfig"
        v-model="wizardData"
      />
      <template #action>
        <NSpace justify="end">
          <NButton
            :disabled="wizardSubmitting"
            @click="showWizard = false"
            >取消</NButton
          >
          <NButton
            :disabled="wizardSubmitting"
            @click="wizardFormRef?.resetFields()"
            >重置</NButton
          >
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance } from '@robot-admin/naive-ui-components/C_Form'
  import {
    cards,
    modalOptions,
    modalConfig,
    drawerOptions,
    drawerConfig,
    sidebarOptions,
    sidebarConfig,
    popoverOptions,
    popoverConfig,
    wizardOptions,
    wizardConfig,
  } from './data'

  defineOptions({ name: 'FormModalDemo' })

  // ============ 容器显隐 ============
  const showModal = ref(false)
  const showDrawer = ref(false)
  const showSidebar = ref(false)
  const showPopover = ref(false)
  const showWizard = ref(false)

  // ============ 表单引用 ============
  const drawerFormRef = ref<FormInstance>()
  const wizardFormRef = ref<FormInstance>()
  const drawerSubmitting = computed(
    () => unref(drawerFormRef.value?.isSubmitting) ?? false
  )
  const wizardSubmitting = computed(
    () => unref(wizardFormRef.value?.isSubmitting) ?? false
  )

  // ============ 表单数据 ============
  const modalData = ref({})
  const drawerData = ref({})
  const sidebarData = ref({})
  const popoverData = ref({})
  const wizardData = ref({})

  /**
   * * @description: 打开对应容器
   * ? @param {string} key 容器标识
   */
  const openContainer = (key: string) => {
    const map: Record<string, Ref<boolean>> = {
      modal: showModal,
      drawer: showDrawer,
      popover: showPopover,
      wizard: showWizard,
    }
    if (key === 'sidebar') {
      showSidebar.value = !showSidebar.value
    } else if (map[key]) {
      map[key].value = true
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
</style>
