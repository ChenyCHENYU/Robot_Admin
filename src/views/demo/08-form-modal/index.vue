<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 17:24:15
 * @FilePath: \Robot_Admin\src\views\demo\08-form-modal\index.vue
 * @Description: 多模态表单 -  演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="demo-container">
    <!-- 头部 -->
    <div class="header">
      <NH1 class="main-title">表单选择器组件场景示例</NH1>
      <div class="panel-title">
        弹出控制中心<span class="subtitle"> / 5种主要的表单容器场景</span>
      </div>
      <div class="stats-overview">
        <NSpace size="large">
          <NStatistic
            v-for="stat in headerStats"
            :key="stat.label"
            :label="stat.label"
            :value="stat.value"
          >
            <template #prefix>
              <Icon :icon="stat.icon" />
            </template>
          </NStatistic>
        </NSpace>
      </div>
    </div>

    <!-- 容器卡片网格 -->
    <div class="cards-grid">
      <div
        v-for="card in containerCards"
        :key="card.key"
        class="card-wrapper"
      >
        <NCard
          class="container-card custom-card"
          @click="handleCardAction(card.key)"
        >
          <template #header>
            <div class="card-header">
              <div class="icon-wrapper">
                <Icon
                  :icon="card.icon"
                  class="card-icon"
                  :style="{ color: card.iconColor }"
                />
              </div>
              <div class="header-content">
                <h3 class="card-title">{{ card.title }}</h3>
                <NTag
                  :type="card.tagType"
                  size="small"
                  >{{ card.layout }}</NTag
                >
              </div>
            </div>
          </template>

          <div class="card-body">
            <p class="card-description">{{ card.description }}</p>

            <div class="card-features">
              <NSpace
                wrap
                size="small"
              >
                <NTag
                  v-for="feature in card.features"
                  :key="feature"
                  size="small"
                  round
                >
                  {{ feature }}
                </NTag>
              </NSpace>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-label">字段数量</span>
                <NBadge
                  :value="card.fields"
                  :type="getBadgeType(card.fields)"
                />
              </div>
              <div class="stat-item">
                <span class="stat-label">复杂度</span>
                <NRate
                  :value="card.complexity"
                  readonly
                  size="small"
                />
              </div>
              <div class="stat-item">
                <span class="stat-label">状态</span>
                <NTag
                  :type="getStatusType(card.key)"
                  size="small"
                >
                  {{ getStatusText(card.key) }}
                </NTag>
              </div>
            </div>
          </div>

          <template #action>
            <NButton
              type="primary"
              block
              size="large"
              strong
            >
              <template #icon>
                <i :class="card.actionIcon"></i>
              </template>
              {{ getActionText(card) }}
            </NButton>
          </template>

          <!-- 浮动表单按钮 -->
          <div
            v-if="card.key === 'popover'"
            class="card-float-btn"
            @click.stop
          >
            <NPopover
              v-model:show="containerState.popover"
              trigger="click"
              placement="bottom"
            >
              <template #trigger>
                <NButton
                  circle
                  size="small"
                  type="primary"
                  @click.stop="toggleContainer('popover')"
                >
                  <template #icon>
                    <i class="i-mdi:file-settings-cog"></i>
                  </template>
                </NButton>
              </template>
              <div class="popover-content">
                <div class="popover-header">
                  <h4>快速编辑</h4>
                  <NTag
                    size="small"
                    type="info"
                    >实时保存</NTag
                  >
                </div>
                <C_Form
                  ref="popoverFormRef"
                  :options="formOptions.popover"
                  :layout-type="layoutTypes.popover"
                  v-model="formData.popover"
                  @submit="submitForm('popover')"
                >
                  <template #action="{ validate }">
                    <C_ActionBar
                      :actions="getPopoverActions(validate)"
                      :config="{ align: 'right', compact: true }"
                    />
                  </template>
                </C_Form>
              </div>
            </NPopover>
          </div>
        </NCard>
      </div>
    </div>

    <!-- 模态框 -->
    <NModal
      v-model:show="containerState.modal"
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
        :options="formOptions.modal"
        :layout-type="layoutTypes.modal"
        v-model="formData.modal"
        @submit="submitForm('modal')"
      />
    </NModal>

    <!-- 抽屉 -->
    <NDrawer
      v-model:show="containerState.drawer"
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
          :options="formOptions.drawer"
          :layout-type="layoutTypes.drawer"
          v-model="formData.drawer"
          @submit="submitForm('drawer')"
          :showDefaultActions="false"
        />
        <template #footer>
          <C_ActionBar
            :actions="drawerActions"
            :config="{ align: 'right', gap: 12 }"
          />
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- 侧边栏 -->
    <div
      class="sidebar"
      :class="{ collapsed: containerState.sidebar }"
    >
      <NCard
        v-if="!containerState.sidebar"
        class="sidebar-card"
      >
        <template #header>
          <div class="sidebar-header">
            <div class="header-info">
              <i class="i-mdi:air-filter mr-2"></i>
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
              @click="toggleContainer('sidebar')"
            >
              <template #icon>
                <i class="i-mdi:close-octagon"></i>
              </template>
            </NButton>
          </div>
        </template>
        <C_Form
          ref="sidebarFormRef"
          :options="formOptions.sidebar"
          :layout-type="layoutTypes.sidebar"
          v-model="formData.sidebar"
          @submit="submitForm('sidebar')"
        >
          <template #action="{ validate }">
            <C_ActionBar
              :actions="getSidebarActions(validate)"
              :config="{ align: 'space-between', gap: 12 }"
            />
          </template>
        </C_Form>
      </NCard>
    </div>

    <!-- 步骤向导 -->
    <NModal
      v-model:show="containerState.wizard"
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
        :options="formOptions.wizard"
        :layout-type="layoutTypes.wizard"
        v-model="formData.wizard"
        @submit="submitForm('wizard')"
      />
      <template #action>
        <C_ActionBar
          :left-actions="wizardLeftActions"
          :right-actions="wizardRightActions"
        />
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import type { FormInstance } from '@/types/modules/form'
  import type { ActionItem } from '@/types/modules/action-bar'
  import {
    type ContainerType,
    type ContainerCard,
    layoutTypes,
    formOptions,
    containerCards,
    containerConfig,
    createDefaultFormData,
    headerStats,
  } from './data'

  /**
   *
   * @description: 消息提示实例
   * ? @type {MessageApi} 用于显示操作成功、失败等提示信息
   */
  const message = useMessage()

  /**
   *
   * @description: 统一容器状态管理
   * ? @type {Record<ContainerType, boolean>} 管理所有容器的显示/隐藏状态
   * * modal: 模态框显示状态
   * * drawer: 抽屉显示状态
   * * sidebar: 侧边栏折叠状态（true为折叠）
   * * popover: 气泡卡片显示状态
   * * wizard: 向导弹窗显示状态
   */
  const containerState = reactive({
    modal: false,
    drawer: false,
    sidebar: true, // collapsed状态
    popover: false,
    wizard: false,
  })

  /**
   *
   * @description: 模态框表单引用
   * ? @type {Ref<FormInstance | undefined>} 用于访问模态框内的表单实例
   */
  const modalFormRef = ref<FormInstance>()

  /**
   *
   * @description: 抽屉表单引用
   * ? @type {Ref<FormInstance | undefined>} 用于访问抽屉内的表单实例
   */
  const drawerFormRef = ref<FormInstance>()

  /**
   *
   * @description: 侧边栏表单引用
   * ? @type {Ref<FormInstance | undefined>} 用于访问侧边栏内的表单实例
   */
  const sidebarFormRef = ref<FormInstance>()

  /**
   *
   * @description: 气泡卡片表单引用
   * ? @type {Ref<FormInstance | undefined>} 用于访问气泡卡片内的表单实例
   */
  const popoverFormRef = ref<FormInstance>()

  /**
   *
   * @description: 向导表单引用
   * ? @type {Ref<FormInstance | undefined>} 用于访问向导弹窗内的表单实例
   */
  const wizardFormRef = ref<FormInstance>()

  /**
   *
   * @description: 各容器表单数据集合
   * ? @type {Record<ContainerType, any>} 存储所有容器的表单数据
   * * 使用reactive包装以实现响应式数据绑定
   */
  const formData = reactive(createDefaultFormData())

  /**
   *
   * @description: 根据字段数量获取徽章类型
   * ? @param {number} fields 表单字段数量
   * ! @return {'default' | 'success' | 'warning'} 徽章类型
   * * 0-2个字段：default（默认）
   * * 3-4个字段：success（成功）
   * * 5个及以上：warning（警告）
   */
  const getBadgeType = (fields: number): 'default' | 'success' | 'warning' => {
    if (fields <= 2) return 'default'
    if (fields <= 4) return 'success'
    return 'warning'
  }

  /**
   *
   * @description: 获取容器状态类型
   * ? @param {ContainerType} key 容器类型标识
   * ! @return {string} 状态类型字符串
   * * 从配置文件中获取对应容器的状态类型
   */
  const getStatusType = (key: ContainerType) => containerConfig[key].statusType

  /**
   *
   * @description: 获取容器状态文本
   * ? @param {ContainerType} key 容器类型标识
   * ! @return {string} 状态描述文本
   * * 根据当前容器状态返回对应的状态描述
   * * 侧边栏特殊处理：使用collapsed状态
   */
  const getStatusText = (key: ContainerType): string => {
    const config = containerConfig[key]
    const state =
      key === 'sidebar' ? containerState.sidebar : containerState[key]
    return config.getStatusText(state)
  }

  /**
   *
   * @description: 获取操作按钮文本
   * ? @param {ContainerCard} card 容器卡片配置对象
   * ! @return {string} 按钮显示文本
   * * 侧边栏特殊处理：根据折叠状态显示"展开"或"收起"
   * * 其他容器：直接返回配置的操作文本
   */
  const getActionText = (card: ContainerCard): string => {
    if (card.key === 'sidebar') {
      return containerState.sidebar ? '展开侧边栏' : '收起侧边栏'
    }
    return card.actionText
  }

  /**
   *
   * @description: 处理卡片点击事件
   * ? @param {ContainerType} key 容器类型标识
   * ! @return {void}
   * * 侧边栏：切换折叠/展开状态
   * * 其他容器：打开对应的容器
   */
  const handleCardAction = (key: ContainerType): void => {
    if (key === 'sidebar') {
      toggleContainer('sidebar') // 侧边栏需要切换状态
    } else {
      toggleContainer(key, true) // 其他容器打开
    }
  }

  /**
   *
   * @description: 统一容器显示状态控制
   * ? @param {ContainerType} type 容器类型标识
   * ? @param {boolean} [state] 可选的目标状态，不传则切换当前状态
   * ! @return {void}
   * * 侧边栏：控制折叠/展开状态
   * * 其他容器：控制显示/隐藏状态
   */
  const toggleContainer = (type: ContainerType, state?: boolean): void => {
    if (type === 'sidebar') {
      containerState.sidebar = state ?? !containerState.sidebar
    } else {
      containerState[type] = state ?? !containerState[type]
    }
  }

  /**
   *
   * @description: 统一表单提交处理
   * ? @param {ContainerType} type 容器类型标识
   * ! @return {Promise<void>} 异步提交结果
   * * 1. 获取对应的表单引用
   * * 2. 执行表单验证
   * * 3. 验证通过后提交数据
   * * 4. 显示成功提示并关闭容器（侧边栏除外）
   * * 5. 验证失败时显示错误提示
   */
  const submitForm = async (type: ContainerType): Promise<void> => {
    /**
     *
     * @description: 表单引用映射表
     * ? @type {Record<ContainerType, Ref<FormInstance | undefined>>}
     * * 将容器类型映射到对应的表单引用
     */
    const formRefMap: Record<ContainerType, Ref<FormInstance | undefined>> = {
      modal: modalFormRef,
      drawer: drawerFormRef,
      sidebar: sidebarFormRef,
      popover: popoverFormRef,
      wizard: wizardFormRef,
    }

    const formRef = formRefMap[type].value
    if (!formRef) return

    try {
      await formRef.validate()
      console.log(`${type} form submitted:`, formData[type])
      message.success('表单提交成功！')

      // 自动关闭容器（sidebar除外）
      if (type !== 'sidebar') {
        toggleContainer(type, false)
      }
    } catch {
      message.error('表单验证失败，请检查输入')
    }
  }

  /**
   *
   * @description: 验证并提交表单
   * ? @param {ContainerType} type 容器类型标识
   * ? @param {() => Promise<void>} validate 验证函数
   * ! @return {Promise<void>} 异步验证提交结果
   * * 先执行传入的验证函数，验证通过后调用统一提交方法
   * * 主要用于自定义表单操作按钮的验证流程
   */
  const validateAndSubmit = async (
    type: ContainerType,
    validate: () => Promise<void>
  ): Promise<void> => {
    try {
      await validate()
      await submitForm(type)
    } catch {
      message.error('表单验证失败')
    }
  }

  /**
   *
   * @description: 清空指定容器的表单数据
   * ? @param {ContainerType} type 容器类型标识
   * ! @return {void}
   * * 将对应容器的表单数据重置为空对象
   * * 显示清空成功的提示信息
   */
  const clearFormData = (type: ContainerType): void => {
    formData[type] = {}
    message.info('已清空表单数据')
  }

  // ==================== 各容器操作按钮配置 ====================
  const getPopoverActions = (validate: () => Promise<void>): ActionItem[] => [
    {
      key: 'cancel',
      label: '取消',
      onClick: () => toggleContainer('popover', false),
    },
    {
      key: 'save',
      label: '保存',
      type: 'primary',
      onClick: () => validateAndSubmit('popover', validate),
    },
  ]

  const drawerActions = computed<ActionItem[]>(() => [
    {
      key: 'cancel',
      label: '取消',
      onClick: () => toggleContainer('drawer', false),
    },
    {
      key: 'save',
      label: '保存',
      type: 'primary',
      onClick: () => submitForm('drawer'),
    },
  ])

  const getSidebarActions = (validate: () => Promise<void>): ActionItem[] => [
    {
      key: 'clear',
      label: '清空',
      icon: 'mdi:vacuum-cleaner',
      group: 'left',
      onClick: () => clearFormData('sidebar'),
    },
    {
      key: 'apply',
      label: '应用筛选',
      icon: 'mdi:briefcase-search-outline',
      type: 'primary',
      group: 'right',
      onClick: () => validateAndSubmit('sidebar', validate),
    },
  ]

  const wizardLeftActions = computed<ActionItem[]>(() => [
    {
      key: 'cancel',
      label: '取消',
      onClick: () => toggleContainer('wizard', false),
    },
  ])

  const wizardRightActions = computed<ActionItem[]>(() => [
    {
      key: 'reset',
      label: '重置',
      onClick: () => clearFormData('wizard'),
    },
    {
      key: 'submit',
      label: '完成创建',
      type: 'primary',
      onClick: () => submitForm('wizard'),
    },
  ])
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
