<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-11
 * @FilePath: \Robot_Admin\src\views\demo\55-skeleton\index.vue
 * @Description: C_Skeleton 骨架屏组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="skeleton-demo">
    <c_vTitle
      title="骨架屏组件场景示例"
      icon="mdi:view-dashboard-outline"
      description="C_Skeleton 提供 8 种业务预设骨架屏模式，适用于数据加载过渡场景，支持波浪 / 脉冲动画与自定义配置"
    />

    <!-- ==================== 场景选择 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:shape-outline"
          class="title-icon"
        />
        预设模式
      </h2>
      <p class="section-desc">
        选择不同预设模式，预览骨架屏在各类业务场景下的占位效果。
      </p>

      <div class="scene-switcher">
        <div
          v-for="scene in DEMO_SCENES"
          :key="scene.key"
          class="scene-card"
          :class="{ 'is-active': activePreset === scene.key }"
          @click="activePreset = scene.key"
        >
          <C_Icon
            :name="scene.icon"
            class="scene-card__icon"
          />
          <span class="scene-card__title">{{ scene.title }}</span>
          <span class="scene-card__desc">{{ scene.description }}</span>
          <NTag
            :type="scene.badge"
            size="tiny"
            round
            class="scene-card__badge"
          >
            {{ scene.badgeText }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- ==================== 配置面板 + 预览 ==================== -->
    <div class="demo-grid">
      <!-- 骨架屏预览 -->
      <NCard
        class="demo-card preview-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>效果预览</h3>
            <NTag
              :type="isLoading ? 'warning' : 'success'"
              size="small"
              round
            >
              {{ isLoading ? '加载中' : '已完成' }}
            </NTag>
          </div>
          <p class="card-desc">
            当前预设：<strong>{{ activeSceneData?.title }}</strong> —
            {{ activeSceneData?.description }}
          </p>
        </template>

        <div class="config-bar">
          <span class="config-label">动画</span>
          <NSelect
            v-model:value="currentAnimation"
            :options="ANIMATION_OPTIONS"
            size="small"
            style="width: 120px"
          />
          <span class="config-label">重复</span>
          <NInputNumber
            v-model:value="repeatCount"
            :min="1"
            :max="8"
            size="small"
            style="width: 90px"
          />
          <NSwitch v-model:value="isLoading">
            <template #checked>加载中</template>
            <template #unchecked>已完成</template>
          </NSwitch>
          <NButton
            size="small"
            type="primary"
            ghost
            @click="simulateLoading"
          >
            模拟加载
          </NButton>
        </div>

        <div class="preview-area">
          <C_Skeleton
            :preset="activePreset"
            :loading="isLoading"
            :animation="animationValue"
            :repeat="repeatCount"
            :table="{ rows: 4, cols: 4, showHeader: true, showActions: true }"
            :form="{ fields: 6, cols: 2, showLabel: true, showActions: true }"
            :list="{ items: 3, showAvatar: true, descLines: 2 }"
            :card="{
              showCover: true,
              titleLines: 1,
              descLines: 2,
              showFooter: true,
            }"
            :detail="{ fields: 6, valueLines: 1, showAvatar: true }"
          >
            <!-- 已加载内容 -->
            <LoadedContent :preset="activePreset" />
          </C_Skeleton>
        </div>
      </NCard>

      <!-- 全部预设一览 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>全部预设一览</h3>
            <NTag
              type="info"
              size="small"
              round
            >
              {{ DEMO_SCENES.length }} 种
            </NTag>
          </div>
          <p class="card-desc"
            >所有预设模式的缩略预览，点击可切换到对应场景。</p
          >
        </template>

        <div class="preset-grid">
          <div
            v-for="scene in DEMO_SCENES"
            :key="scene.key"
            class="preset-item"
            :class="{ 'is-active': activePreset === scene.key }"
            @click="activePreset = scene.key"
          >
            <div class="preset-item__header">
              <C_Icon
                :name="scene.icon"
                :size="16"
              />
              <span>{{ scene.title }}</span>
            </div>
            <div class="preset-item__preview">
              <C_Skeleton
                :preset="scene.key"
                :loading="true"
                animation="wave"
                :repeat="1"
                :table="{
                  rows: 2,
                  cols: 3,
                  showHeader: true,
                  showActions: false,
                }"
                :form="{
                  fields: 3,
                  cols: 1,
                  showLabel: true,
                  showActions: false,
                }"
                :list="{ items: 2, showAvatar: true, descLines: 1 }"
                :card="{
                  showCover: false,
                  titleLines: 1,
                  descLines: 1,
                  showFooter: false,
                }"
                :detail="{ fields: 3, valueLines: 1, showAvatar: false }"
              />
            </div>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { DEMO_SCENES, ANIMATION_OPTIONS, LOADED_CONTENT } from './data'
  import type {
    SkeletonPreset,
    SkeletonAnimation,
  } from '@robot-admin/naive-ui-components'

  defineOptions({ name: 'demo-skeleton' })

  const message = useMessage()

  // ─── State ───
  const isLoading = ref(true)
  const activePreset = ref<SkeletonPreset>('table')
  const currentAnimation = ref('wave')
  const repeatCount = ref(3)

  const activeSceneData = computed(() =>
    DEMO_SCENES.find(s => s.key === activePreset.value)
  )

  const animationValue = computed<SkeletonAnimation>(() =>
    currentAnimation.value === 'none'
      ? false
      : (currentAnimation.value as 'wave' | 'pulse')
  )

  /**
   * * @description: 模拟 2 秒加载过程
   */
  const simulateLoading = () => {
    isLoading.value = true
    message.info('开始加载数据...')
    setTimeout(() => {
      isLoading.value = false
      message.success('数据加载完成')
    }, 2000)
  }

  /**
   * * @description: 已加载内容渲染组件
   */
  const LoadedContent = defineComponent({
    props: {
      preset: { type: String as () => SkeletonPreset, default: 'text' },
    },
    /**
     *
     */
    setup(props) {
      return () => {
        switch (props.preset) {
          case 'text':
            return h('div', { class: 'loaded-text' }, [
              h('h3', LOADED_CONTENT.text.title),
              h('p', LOADED_CONTENT.text.content),
            ])
          case 'avatar':
            return h('div', { class: 'loaded-avatar' }, [
              h('div', { class: 'loaded-avatar__icon' }, [
                h(resolveComponent('C_Icon'), {
                  name: 'mdi:account-circle',
                  size: 40,
                }),
              ]),
              h('div', [
                h('strong', LOADED_CONTENT.avatar.name),
                h(
                  'p',
                  {
                    style:
                      'margin:4px 0 0;color:var(--text-color-3);font-size:13px',
                  },
                  `${LOADED_CONTENT.avatar.role} · ${LOADED_CONTENT.avatar.desc}`
                ),
              ]),
            ])
          case 'table':
            return h(
              resolveComponent('NTable'),
              { size: 'small', bordered: true },
              {
                default: () => [
                  h('thead', [
                    h(
                      'tr',
                      LOADED_CONTENT.table.columns.map(col => h('th', col))
                    ),
                  ]),
                  h(
                    'tbody',
                    LOADED_CONTENT.table.rows.map(row =>
                      h('tr', [
                        ...row.map(cell => h('td', cell)),
                        h('td', [
                          h(
                            resolveComponent('NButton'),
                            { size: 'tiny', type: 'primary', quaternary: true },
                            { default: () => '编辑' }
                          ),
                        ]),
                      ])
                    )
                  ),
                ],
              }
            )
          case 'list':
            return h(
              'div',
              { class: 'loaded-list' },
              LOADED_CONTENT.list.map(item =>
                h('div', { class: 'loaded-list__item' }, [
                  h(resolveComponent('C_Icon'), {
                    name: 'mdi:bell-outline',
                    size: 20,
                  }),
                  h('div', [
                    h('strong', { style: 'font-size:14px' }, item.title),
                    h(
                      'p',
                      {
                        style:
                          'margin:2px 0 0;color:var(--text-color-3);font-size:12px',
                      },
                      item.desc
                    ),
                  ]),
                  h(
                    'span',
                    {
                      style:
                        'margin-left:auto;color:var(--text-color-3);font-size:12px;white-space:nowrap',
                    },
                    item.time
                  ),
                ])
              )
            )
          default:
            return h(
              'div',
              {
                style:
                  'padding:20px;text-align:center;color:var(--text-color-3)',
              },
              `${props.preset} 模式数据加载完成 ✅`
            )
        }
      }
    },
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
