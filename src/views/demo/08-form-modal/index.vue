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
                ref="popoverFormRef"
                :options="popoverOptions"
                :config="popoverConfig"
                v-model="popoverData"
              >
                <template #action="{ validate }">
                  <C_ActionBar
                    :actions="[
                      {
                        label: '取消',
                        onClick: () => {
                          showPopover = false
                        },
                      },
                      {
                        label: '保存',
                        type: 'primary',
                        onClick: () => onSubmit('popover', validate),
                      },
                    ]"
                  />
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
        ref="modalFormRef"
        :options="modalOptions"
        :config="modalConfig"
        v-model="modalData"
        @submit="onSubmit('modal')"
      />
    </NModal>

    <!-- 抽屉 -->
    <NDrawer
      v-model:show="showDrawer"
      :width="500"
      placement="right"
    >
      <NDrawerContent title="商品详情配置">
        <template #header-extra>
          <NTag
            type="success"
            size="small"
            >默认布局</NTag
          >
        </template>
        <C_Form
          ref="drawerFormRef"
          :options="drawerOptions"
          :config="drawerConfig"
          v-model="drawerData"
        />
        <template #footer>
          <C_ActionBar
            :actions="[
              {
                label: '取消',
                onClick: () => {
                  showDrawer = false
                },
              },
              {
                label: '保存',
                type: 'primary',
                onClick: () => onSubmit('drawer'),
              },
            ]"
          />
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
              <i class="i-mdi:air-filter mr-2" />
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
                <i class="i-mdi:close-octagon" />
              </template>
            </NButton>
          </div>
        </template>
        <C_Form
          ref="sidebarFormRef"
          :options="sidebarOptions"
          :config="sidebarConfig"
          v-model="sidebarData"
        >
          <template #action="{ validate }">
            <C_ActionBar
              :actions="[
                {
                  label: '清空',
                  icon: 'mdi:vacuum-cleaner',
                  onClick: () => sidebarFormRef?.resetFields(),
                },
                {
                  label: '应用筛选',
                  icon: 'mdi:briefcase-search-outline',
                  type: 'primary',
                  onClick: () => onSubmit('sidebar', validate),
                },
              ]"
            />
          </template>
        </C_Form>
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
        ref="wizardFormRef"
        :options="wizardOptions"
        :config="wizardConfig"
        v-model="wizardData"
      />
      <template #action>
        <C_ActionBar
          :actions="[
            {
              label: '取消',
              onClick: () => {
                showWizard = false
              },
            },
            {
              label: '重置',
              onClick: () => wizardFormRef?.resetFields(),
            },
            {
              label: '完成创建',
              type: 'primary',
              onClick: () => onSubmit('wizard'),
            },
          ]"
        />
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance } from '@robot-admin/naive-ui-components'
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

  const message = useMessage()

  // ============ 容器显隐 ============
  const showModal = ref(false)
  const showDrawer = ref(false)
  const showSidebar = ref(true)
  const showPopover = ref(false)
  const showWizard = ref(false)

  // ============ 表单引用 ============
  const modalFormRef = ref<FormInstance>()
  const drawerFormRef = ref<FormInstance>()
  const sidebarFormRef = ref<FormInstance>()
  const popoverFormRef = ref<FormInstance>()
  const wizardFormRef = ref<FormInstance>()

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

  /**
   * * @description: 表单提交（验证 → 提示 → 关闭容器）
   * ? @param {string} key 容器标识
   * ? @param {Function} validate 外部传入的验证函数（slot 场景）
   */
  const onSubmit = async (key: string, validate?: () => Promise<void>) => {
    const formRefMap: Record<string, Ref<FormInstance | undefined>> = {
      modal: modalFormRef,
      drawer: drawerFormRef,
      sidebar: sidebarFormRef,
      popover: popoverFormRef,
      wizard: wizardFormRef,
    }
    try {
      if (validate) {
        await validate()
      } else {
        await formRefMap[key]?.value?.validate()
      }
      message.success('表单提交成功！')
      // 提交后关闭（侧边栏保持展开）
      if (key !== 'sidebar') openContainer(key)
    } catch {
      message.error('表单验证失败，请检查输入')
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
