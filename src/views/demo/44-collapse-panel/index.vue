<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 18:42:57
 * @FilePath: \Robot_Admin\src\views\demo\44-collapse-panel\index.vue
 * @Description: 折叠面板组件演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="collapse-panel-demo-page">
    <c_vTitle
      title="折叠面板场景示例"
      icon="mdi:folder-open-outline"
      description="支持手风琴模式、多种变体、编程控制、懒渲染等特性，适用于FAQ、设置面板、仪表盘等场景"
    />

    <div class="demo-grid">
      <!-- 基础用法 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>基础用法</h3>
            <NTag
              type="info"
              size="small"
              round
              >默认</NTag
            >
          </div>
          <p class="card-desc">最简单的折叠面板，点击头部展开/折叠</p>
        </template>
        <C_CollapsePanel
          :items="basicItems"
          :default-active-keys="['info']"
        />
      </NCard>

      <!-- 手风琴模式 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>手风琴模式</h3>
            <NTag
              type="success"
              size="small"
              round
              >互斥</NTag
            >
          </div>
          <p class="card-desc">设置 accordion 后同时只能展开一个面板</p>
        </template>
        <C_CollapsePanel
          :items="faqItems"
          :accordion="true"
          :default-active-keys="['q1']"
        />
      </NCard>

      <!-- 卡片变体 - 全宽 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>卡片变体</h3>
            <NTag
              type="warning"
              size="small"
              round
              >仪表盘</NTag
            >
          </div>
          <p class="card-desc"
            >设置 variant="card" 每个面板是独立卡片，适合仪表盘场景</p
          >
        </template>
        <C_CollapsePanel
          :items="cardItems"
          variant="card"
          :default-active-keys="['overview', 'chart']"
        >
          <template #extra-overview>
            <NTag
              size="small"
              type="success"
              :bordered="false"
            >
              实时
            </NTag>
          </template>
          <template #panel-overview>
            <div class="stat-grid">
              <div class="stat-item">
                <C_Icon
                  name="mdi:eye-outline"
                  class="stat-icon"
                />
                <div class="stat-content">
                  <span class="stat-value primary">12,846</span>
                  <span class="stat-label">今日访问</span>
                </div>
              </div>
              <div class="stat-item">
                <C_Icon
                  name="mdi:account-plus-outline"
                  class="stat-icon"
                />
                <div class="stat-content">
                  <span class="stat-value success">256</span>
                  <span class="stat-label">新增用户</span>
                </div>
              </div>
              <div class="stat-item">
                <C_Icon
                  name="mdi:trending-up"
                  class="stat-icon"
                />
                <div class="stat-content">
                  <span class="stat-value warning">3.2%</span>
                  <span class="stat-label">转化率</span>
                </div>
              </div>
            </div>
          </template>
          <template #extra-chart>
            <NButton
              text
              size="small"
              type="primary"
            >
              查看详情
            </NButton>
          </template>
          <template #panel-chart>
            <div class="chart-placeholder">
              <C_Icon
                name="mdi:chart-line"
                class="placeholder-icon"
              />
              <NText depth="3"
                >图表区域（此处可放置 ECharts / AntV 图表）</NText
              >
            </div>
          </template>
          <template #panel-recent>
            <NList bordered>
              <NListItem>
                <NThing
                  title="用户 张三 完成了订单 #1024"
                  description="2 分钟前"
                />
              </NListItem>
              <NListItem>
                <NThing
                  title="系统完成了数据备份"
                  description="15 分钟前"
                />
              </NListItem>
              <NListItem>
                <NThing
                  title="用户 李四 提交了反馈"
                  description="1 小时前"
                />
              </NListItem>
            </NList>
          </template>
        </C_CollapsePanel>
      </NCard>

      <!-- 幽灵变体 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>幽灵变体</h3>
            <NTag
              size="small"
              round
              >极简</NTag
            >
          </div>
          <p class="card-desc">设置 variant="ghost" 无边框极简风格</p>
        </template>
        <C_CollapsePanel
          :items="ghostItems"
          variant="ghost"
          :bordered="false"
          :default-active-keys="['filter-status']"
        >
          <template #panel-filter-status>
            <NSpace :size="8">
              <NTag
                v-for="s in ['全部', '进行中', '已完成', '已取消']"
                :key="s"
                checkable
                size="small"
              >
                {{ s }}
              </NTag>
            </NSpace>
          </template>
          <template #panel-filter-date>
            <NDatePicker
              type="daterange"
              clearable
              style="width: 100%"
            />
          </template>
          <template #panel-filter-category>
            <NCheckboxGroup>
              <NSpace :size="8">
                <NCheckbox
                  v-for="c in ['前端', '后端', '设计', '测试']"
                  :key="c"
                  :value="c"
                  :label="c"
                />
              </NSpace>
            </NCheckboxGroup>
          </template>
        </C_CollapsePanel>
      </NCard>

      <!-- 图标右侧 + Extra 操作 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>图标右侧 + Extra</h3>
            <NTag
              type="info"
              size="small"
              round
              >自定义</NTag
            >
          </div>
          <p class="card-desc">箭头在右侧，头部右侧可添加操作按钮</p>
        </template>
        <C_CollapsePanel
          :items="iconRightItems"
          expand-icon-position="right"
          variant="card"
          :default-active-keys="['user']"
        >
          <template #extra-user>
            <NButton
              size="small"
              type="primary"
              @click="handleAction('编辑用户信息')"
            >
              编辑
            </NButton>
          </template>
          <template #panel-user>
            <NDescriptions
              label-placement="left"
              :column="2"
              bordered
            >
              <NDescriptionsItem label="姓名">CHENY</NDescriptionsItem>
              <NDescriptionsItem label="邮箱"
                >ycyplus@gmail.com</NDescriptionsItem
              >
              <NDescriptionsItem label="角色">管理员</NDescriptionsItem>
              <NDescriptionsItem label="状态">
                <NBadge
                  dot
                  type="success"
                />
                在线
              </NDescriptionsItem>
            </NDescriptions>
          </template>
          <template #extra-permission>
            <NButton
              size="small"
              @click="handleAction('管理权限')"
            >
              管理
            </NButton>
          </template>
          <template #panel-permission>
            <NSpace :size="8">
              <NTag
                v-for="p in ['用户管理', '角色管理', '菜单管理']"
                :key="p"
                type="primary"
                size="small"
              >
                {{ p }}
              </NTag>
            </NSpace>
          </template>
        </C_CollapsePanel>
      </NCard>

      <!-- 编程控制 - 全宽 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>编程控制</h3>
            <NTag
              type="success"
              size="small"
              round
              >API</NTag
            >
          </div>
          <p class="card-desc"
            >通过 ref 调用 expandAll / collapseAll / toggle 等方法</p
          >
        </template>
        <div class="action-bar">
          <NButton
            size="small"
            type="primary"
            @click="programRef?.expandAll()"
          >
            全部展开
          </NButton>
          <NButton
            size="small"
            @click="programRef?.collapseAll()"
          >
            全部折叠
          </NButton>
          <NButton
            size="small"
            @click="programRef?.toggle('step-2')"
          >
            切换「步骤二」
          </NButton>
          <NButton
            size="small"
            @click="programRef?.scrollToPanel('step-3')"
          >
            滚动到「步骤三」
          </NButton>
          <NButton
            size="small"
            @click="showActiveKeys"
          >
            获取激活 Keys
          </NButton>
        </div>
        <C_CollapsePanel
          ref="programRef"
          :items="stepItems"
          :default-active-keys="['step-1']"
          @expand="(k: string | number) => handleEvent(`展开: ${k}`)"
          @collapse="(k: string | number) => handleEvent(`折叠: ${k}`)"
        />
      </NCard>

      <!-- 懒渲染 + 持久化 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>懒渲染 + 持久化</h3>
            <NTag
              type="warning"
              size="small"
              round
              >性能</NTag
            >
          </div>
          <p class="card-desc">首次展开才渲染，状态自动持久化</p>
        </template>
        <C_CollapsePanel
          :items="lazyItems"
          persist-key="demo-collapse-lazy"
        >
          <template #panel-lazy-deferred>
            <div class="lazy-indicator">
              <C_Icon name="mdi:check-circle" />
              <NText type="success">懒渲染 — 首次展开才渲染 DOM</NText>
            </div>
          </template>
          <template #panel-lazy-destroy>
            <div class="lazy-indicator">
              <C_Icon name="mdi:recycle" />
              <NText type="warning">折叠后销毁，重新展开重新渲染</NText>
            </div>
          </template>
        </C_CollapsePanel>
        <NText
          depth="3"
          class="demo-tip"
        >
          💡 刷新页面后展开状态会保留
        </NText>
      </NCard>

      <!-- 禁用面板 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>禁用面板</h3>
            <NTag
              type="error"
              size="small"
              round
              >限制</NTag
            >
          </div>
          <p class="card-desc">面板项设置 disabled 后不可展开/折叠</p>
        </template>
        <C_CollapsePanel
          :items="disabledItems"
          :default-active-keys="['enabled']"
        />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    basicItems,
    cardItems,
    disabledItems,
    faqItems,
    ghostItems,
    iconRightItems,
    lazyItems,
    stepItems,
  } from './data'

  const message = useMessage()
  const programRef = ref()

  const handleAction = (action: string) => message.info(`操作: ${action}`)
  const handleEvent = (msg: string) => message.success(msg)
  const showActiveKeys = () => {
    const keys = programRef.value?.getActiveKeys() ?? []
    message.info(`当前激活: [${keys.join(', ')}]`)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
