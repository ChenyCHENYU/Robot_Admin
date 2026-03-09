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
    <NH1>折叠面板场景示例</NH1>

    <!-- 基础用法 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:chevron-down-box-outline"
          class="title-icon"
        />
        基础用法
      </h2>
      <div class="section-desc">最简单的折叠面板，点击头部展开/折叠</div>
      <div class="section-content">
        <C_CollapsePanel
          :items="basicItems"
          :default-active-keys="['info']"
        >
          <template #panel-info>
            <p
              >这是基本信息面板的内容。折叠面板用于组织和隐藏复杂的内容块，帮助用户专注于当前关心的信息。</p
            >
          </template>
          <template #panel-detail>
            <p
              >这是详细设置面板的内容。你可以在这里放置表单、配置项等更多信息，用户需要时展开查看。</p
            >
          </template>
          <template #panel-advanced>
            <p
              >这是高级选项面板的内容。通常放置不常用的高级配置项，减少界面复杂度。</p
            >
          </template>
        </C_CollapsePanel>
      </div>
    </div>

    <!-- 手风琴模式 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:view-sequential"
          class="title-icon"
        />
        手风琴模式
      </h2>
      <div class="section-desc">
        设置 <code>accordion</code> 后同时只能展开一个面板
      </div>
      <div class="section-content">
        <C_CollapsePanel
          :items="faqItems"
          :accordion="true"
          :default-active-keys="['q1']"
        >
          <template #panel-q1>
            <p
              >Vue 3 的 Composition API
              提供了更灵活的代码组织方式，让逻辑关注点聚合在一起，而不是分散在
              data、methods、computed 等选项中。</p
            >
          </template>
          <template #panel-q2>
            <p
              >Pinia 是 Vue 官方推荐的状态管理库，相比 Vuex 更轻量、TypeScript
              支持更好，移除了 mutations 概念，API 更简洁。</p
            >
          </template>
          <template #panel-q3>
            <p
              >Vite 利用浏览器原生 ES Module
              支持实现极速冷启动，开发环境无需打包，热更新速度远超 Webpack。</p
            >
          </template>
        </C_CollapsePanel>
      </div>
    </div>

    <!-- 卡片变体 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:card-outline"
          class="title-icon"
        />
        卡片变体
      </h2>
      <div class="section-desc">
        设置 <code>variant="card"</code> 每个面板是独立卡片，适合仪表盘场景
      </div>
      <div class="section-content">
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
            <NSpace :size="16">
              <NStatistic label="今日访问">
                <template #prefix>
                  <Icon icon="mdi:eye-outline" />
                </template>
                12,846
              </NStatistic>
              <NStatistic label="新增用户">
                <template #prefix>
                  <Icon icon="mdi:account-plus-outline" />
                </template>
                256
              </NStatistic>
              <NStatistic label="转化率">
                <template #prefix>
                  <Icon icon="mdi:trending-up" />
                </template>
                3.2%
              </NStatistic>
            </NSpace>
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
              <Icon
                icon="mdi:chart-line"
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
      </div>
    </div>

    <!-- 幽灵变体 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:ghost-outline"
          class="title-icon"
        />
        幽灵变体
      </h2>
      <div class="section-desc">
        设置 <code>variant="ghost"</code> 无边框极简风格，适合嵌入其他容器
      </div>
      <div class="section-content">
        <NCard>
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
                    v-for="c in ['前端', '后端', '设计', '测试', '运维']"
                    :key="c"
                    :value="c"
                    :label="c"
                  />
                </NSpace>
              </NCheckboxGroup>
            </template>
          </C_CollapsePanel>
        </NCard>
      </div>
    </div>

    <!-- 图标右侧 + 自定义头部 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:format-horizontal-align-right"
          class="title-icon"
        />
        图标右侧 + Extra 操作
      </h2>
      <div class="section-desc">
        <code>expand-icon-position="right"</code> 让箭头在右侧，头部右侧可通过
        <code>#extra-{key}</code> 插槽添加操作按钮
      </div>
      <div class="section-content">
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
                v-for="p in [
                  '用户管理',
                  '角色管理',
                  '菜单管理',
                  '字典管理',
                  '系统监控',
                ]"
                :key="p"
                type="primary"
                size="small"
              >
                {{ p }}
              </NTag>
            </NSpace>
          </template>
        </C_CollapsePanel>
      </div>
    </div>

    <!-- 编程控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:code-braces"
          class="title-icon"
        />
        编程控制
      </h2>
      <div class="section-desc">
        通过 ref 调用 <code>expandAll</code> / <code>collapseAll</code> /
        <code>toggle</code> 等方法编程控制面板
      </div>
      <div class="section-content">
        <NSpace
          :size="8"
          style="margin-bottom: 12px"
        >
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
        </NSpace>
        <C_CollapsePanel
          ref="programRef"
          :items="stepItems"
          :default-active-keys="['step-1']"
          @expand="(k: string | number) => handleEvent(`展开: ${k}`)"
          @collapse="(k: string | number) => handleEvent(`折叠: ${k}`)"
        >
          <template #panel-step-1>
            <p
              >第一步：创建项目基础架构，初始化 Git 仓库，配置 ESLint / Prettier
              / Husky。</p
            >
          </template>
          <template #panel-step-2>
            <p>第二步：实现核心业务模块，包括用户认证、权限管理、数据 CRUD。</p>
          </template>
          <template #panel-step-3>
            <p
              >第三步：性能优化与测试，包括懒加载、代码分割、单元测试和 E2E
              测试。</p
            >
          </template>
          <template #panel-step-4>
            <p>第四步：部署上线，CI/CD 流水线配置，灰度发布策略制定。</p>
          </template>
        </C_CollapsePanel>
      </div>
    </div>

    <!-- 懒渲染 + 持久化 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:flash-outline"
          class="title-icon"
        />
        懒渲染 + 状态持久化
      </h2>
      <div class="section-desc">
        面板设置 <code>lazy: true</code> 首次展开才渲染内容；设置组件
        <code>persist-key</code> 后展开状态自动持久化到 localStorage，刷新不丢失
      </div>
      <div class="section-content">
        <C_CollapsePanel
          :items="lazyItems"
          persist-key="demo-collapse-lazy"
        >
          <template #panel-lazy-normal>
            <p>这个面板内容立即渲染（默认行为）。</p>
          </template>
          <template #panel-lazy-deferred>
            <div class="lazy-indicator">
              <Icon icon="mdi:check-circle" />
              <NText type="success"
                >此内容通过懒渲染加载 — 只有首次展开才渲染 DOM</NText
              >
            </div>
          </template>
          <template #panel-lazy-destroy>
            <div class="lazy-indicator">
              <Icon icon="mdi:recycle" />
              <NText type="warning"
                >此面板折叠后 DOM 被销毁，重新展开会重新渲染</NText
              >
            </div>
          </template>
        </C_CollapsePanel>
        <div class="demo-tip">
          <NText depth="3"
            >💡
            刷新页面后展开状态会保留（persist-key="demo-collapse-lazy"）</NText
          >
        </div>
      </div>
    </div>

    <!-- 禁用面板 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:lock-outline"
          class="title-icon"
        />
        禁用面板
      </h2>
      <div class="section-desc">
        面板项设置 <code>disabled: true</code> 后不可展开/折叠
      </div>
      <div class="section-content">
        <C_CollapsePanel
          :items="disabledItems"
          :default-active-keys="['enabled']"
        >
          <template #panel-enabled>
            <p>这个面板可以正常操作。</p>
          </template>
          <template #panel-disabled-item>
            <p>这个内容不会被看到。</p>
          </template>
          <template #panel-also-enabled>
            <p>这个面板也可以正常操作。</p>
          </template>
        </C_CollapsePanel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
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
