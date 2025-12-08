<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 11:08:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:25:05
 * @FilePath: \Robot_Admin\src\views\demo\25-throttle-direct\index.vue
 * @Description: 节流指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="throttle-demo-page">
    <NH1>v-throttle 节流指令场景示例</NH1>

    <NGrid
      :cols="2"
      :x-gap="24"
      :y-gap="16"
    >
      <!-- 左侧演示区 -->
      <NGridItem>
        <NSpace
          vertical
          size="large"
        >
          <!-- 基础节流演示 -->
          <NCard
            title="基础节流演示"
            size="small"
          >
            <div class="demo-container">
              <div class="demo-row">
                <NButton
                  v-throttle="DEMO_CONFIG.DEFAULT_DELAY"
                  type="primary"
                  @click="handlers.handleBasicClick"
                >
                  节流按钮 (300ms)
                </NButton>
                <NText depth="3"
                  >点击计数: {{ state.basicClickCount.value }}</NText
                >
              </div>

              <div class="demo-row">
                <NButton
                  v-throttle
                  type="default"
                  @click="handlers.handleDefaultClick"
                >
                  默认节流按钮 (300ms)
                </NButton>
                <NText depth="3"
                  >点击计数: {{ state.defaultClickCount.value }}</NText
                >
              </div>

              <div class="demo-row">
                <NButton
                  type="warning"
                  @click="handlers.handleNormalClick"
                >
                  普通按钮 (无节流)
                </NButton>
                <NText depth="3"
                  >点击计数: {{ state.normalClickCount.value }}</NText
                >
              </div>
            </div>
            <NDivider />
            <NText depth="3">
              快速连续点击对比：节流按钮在时间间隔内只执行一次，普通按钮响应每次点击
            </NText>
          </NCard>

          <!-- 高级配置演示 -->
          <NCard
            title="高级配置演示"
            size="small"
          >
            <div class="demo-container">
              <div class="demo-row">
                <NButton
                  v-throttle="{
                    delay: DEMO_CONFIG.SLOW_DELAY,
                    onExecute: handlers.handleSlowExecute,
                    onThrottle: handlers.handleSlowThrottle,
                  }"
                  type="info"
                  @click="handlers.handleSlowClick"
                >
                  慢速节流 (1000ms)
                </NButton>
                <NSpace>
                  <NText depth="3"
                    >执行: {{ state.slowExecuteCount.value }}</NText
                  >
                  <NText depth="3"
                    >节流: {{ state.slowThrottleCount.value }}</NText
                  >
                </NSpace>
              </div>

              <div class="demo-row">
                <NButton
                  v-throttle="{
                    delay: DEMO_CONFIG.LEADING_DELAY,
                    leading: true,
                    trailing: false,
                    onExecute: handlers.handleLeadingExecute,
                  }"
                  type="success"
                  @click="handlers.handleLeadingClick"
                >
                  仅前缘执行 (500ms)
                </NButton>
                <NText depth="3"
                  >执行计数: {{ state.leadingClickCount.value }}</NText
                >
              </div>

              <div class="demo-row">
                <NButton
                  v-throttle="{
                    delay: DEMO_CONFIG.TRAILING_DELAY,
                    leading: false,
                    trailing: true,
                    onExecute: handlers.handleTrailingExecute,
                  }"
                  type="error"
                  @click="handlers.handleTrailingClick"
                >
                  仅后缘执行 (600ms)
                </NButton>
                <NText depth="3"
                  >执行计数: {{ state.trailingClickCount.value }}</NText
                >
              </div>
            </div>
            <NDivider />
            <NText depth="3">
              支持前缘执行、后缘执行、延迟时间等配置，提供执行和节流回调
            </NText>
          </NCard>

          <!-- 动态配置演示 -->
          <NCard
            title="动态配置演示"
            size="small"
          >
            <NSpace vertical>
              <NSpace>
                <NSwitch v-model:value="state.throttleEnabled.value" />
                <NText>启用节流</NText>

                <NInputNumber
                  v-model:value="state.throttleDelay.value"
                  :min="DEMO_CONFIG.DELAY_MIN"
                  :max="DEMO_CONFIG.DELAY_MAX"
                  :step="DEMO_CONFIG.DELAY_STEP"
                  placeholder="延迟时间"
                  style="width: 120px"
                  class="mt--6px"
                />
                <NText>ms</NText>
              </NSpace>

              <NSpace>
                <NSwitch v-model:value="state.leadingMode.value" />
                <NText>前缘执行</NText>

                <NSwitch v-model:value="state.trailingMode.value" />
                <NText>后缘执行</NText>
              </NSpace>

              <div class="demo-container">
                <div class="demo-row">
                  <NButton
                    v-throttle="{
                      disabled: !state.throttleEnabled.value,
                      delay: state.throttleDelay.value,
                      leading: state.leadingMode.value,
                      trailing: state.trailingMode.value,
                      onExecute: handlers.handleDynamicExecute,
                      onThrottle: handlers.handleDynamicThrottle,
                    }"
                    type="primary"
                    @click="handlers.handleDynamicClick"
                  >
                    动态配置按钮
                  </NButton>
                  <NSpace>
                    <NText depth="3"
                      >执行: {{ state.dynamicExecuteCount.value }}</NText
                    >
                    <NText depth="3"
                      >节流: {{ state.dynamicThrottleCount.value }}</NText
                    >
                  </NSpace>
                </div>
              </div>

              <NSpace>
                <NTag
                  >节流状态:
                  {{ state.throttleEnabled.value ? '启用' : '禁用' }}</NTag
                >
                <NTag type="info">延迟: {{ state.throttleDelay.value }}ms</NTag>
                <NTag type="success">
                  前缘: {{ state.leadingMode.value ? '开启' : '关闭' }}
                </NTag>
                <NTag type="warning">
                  后缘: {{ state.trailingMode.value ? '开启' : '关闭' }}
                </NTag>
              </NSpace>
            </NSpace>
            <NDivider />
            <NText depth="3">支持响应式配置，实时修改节流参数和执行模式</NText>
          </NCard>

          <!-- 实际应用场景 -->
          <NCard
            title="实际应用场景"
            size="small"
          >
            <NTabs
              v-model:value="state.scenarioTab.value"
              type="line"
              size="small"
            >
              <!-- 搜索场景 -->
              <NTabPane
                name="search"
                tab="搜索优化"
              >
                <div class="demo-container">
                  <NSpace vertical>
                    <NSpace>
                      <NInput
                        v-model:value="state.searchKeyword.value"
                        placeholder="输入搜索关键词"
                        style="width: 300px"
                      />
                      <NButton
                        v-throttle="{
                          delay: DEMO_CONFIG.SEARCH_DELAY,
                          onExecute: handlers.handleSearchExecute,
                        }"
                        type="primary"
                        @click="handlers.handleSearch"
                        :loading="state.isSearching.value"
                      >
                        搜索 (节流 500ms)
                      </NButton>
                    </NSpace>

                    <div class="search-stats">
                      <NSpace>
                        <NTag>搜索次数: {{ state.searchCount.value }}</NTag>
                        <NTag type="info"
                          >关键词:
                          {{ state.lastSearchKeyword.value || '暂无' }}</NTag
                        >
                      </NSpace>
                    </div>

                    <div
                      class="search-results"
                      v-if="state.searchResults.value.length > 0"
                    >
                      <NList>
                        <NListItem
                          v-for="result in state.searchResults.value"
                          :key="result.id"
                        >
                          <NThing
                            :title="result.title"
                            :description="result.description"
                          />
                        </NListItem>
                      </NList>
                    </div>
                  </NSpace>
                </div>
              </NTabPane>

              <!-- 滚动加载场景 -->
              <NTabPane
                name="scroll"
                tab="滚动加载"
              >
                <div class="demo-container">
                  <div
                    class="scroll-container"
                    ref="scrollContainer"
                  >
                    <div
                      v-for="item in state.scrollItems.value"
                      :key="item.id"
                      class="scroll-item"
                    >
                      <NCard size="small">
                        <NThing
                          :title="`数据项 ${item.id}`"
                          :description="`这是第 ${item.id} 条数据，时间: ${item.timestamp}`"
                        />
                      </NCard>
                    </div>

                    <div class="load-more-container">
                      <NButton
                        v-throttle="{
                          delay: DEMO_CONFIG.LOAD_DELAY,
                          onExecute: handlers.handleLoadMoreExecute,
                        }"
                        type="default"
                        @click="handlers.handleLoadMore"
                        :loading="state.isLoading.value"
                        block
                      >
                        加载更多 (节流 800ms)
                      </NButton>
                    </div>
                  </div>

                  <div class="load-stats">
                    <NSpace>
                      <NTag>加载次数: {{ state.loadCount.value }}</NTag>
                      <NTag type="success"
                        >总数据: {{ state.scrollItems.value.length }}</NTag
                      >
                    </NSpace>
                  </div>
                </div>
              </NTabPane>

              <!-- 按钮操作场景 -->
              <NTabPane
                name="action"
                tab="高频操作"
              >
                <div class="demo-container">
                  <NSpace vertical>
                    <div class="demo-row">
                      <NButton
                        v-throttle="400"
                        type="primary"
                        @click="handlers.handleLikeClick"
                      >
                        点赞 ❤️ (节流 400ms)
                      </NButton>
                      <NText depth="3"
                        >点赞数: {{ state.likeCount.value }}</NText
                      >
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-throttle="{
                          delay: 600,
                          leading: true,
                          trailing: false,
                        }"
                        type="info"
                        @click="handlers.handleShareClick"
                      >
                        分享 📤 (前缘节流 600ms)
                      </NButton>
                      <NText depth="3"
                        >分享次数: {{ state.shareCount.value }}</NText
                      >
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-throttle="{
                          delay: 1000,
                          leading: false,
                          trailing: true,
                        }"
                        type="warning"
                        @click="handlers.handleDownloadClick"
                      >
                        下载 📥 (后缘节流 1000ms)
                      </NButton>
                      <NText depth="3"
                        >下载次数: {{ state.downloadCount.value }}</NText
                      >
                    </div>
                  </NSpace>
                </div>
              </NTabPane>
            </NTabs>
            <NDivider />
            <NText depth="3">搜索优化、滚动加载、高频操作等实际业务场景</NText>
          </NCard>
        </NSpace>
      </NGridItem>

      <!-- 右侧代码展示 -->
      <NGridItem>
        <NCard
          title="使用示例"
          size="small"
        >
          <NTabs
            v-model:value="state.activeTab.value"
            type="line"
            size="small"
          >
            <NTabPane
              v-for="(code, key) in CODE_EXAMPLES"
              :key="key"
              :name="key"
              :tab="TAB_TITLES[key as keyof typeof TAB_TITLES]"
            >
              <C_Code
                :code="code"
                language="html"
              />
            </NTabPane>
          </NTabs>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import {
    CODE_EXAMPLES,
    createDemoState,
    createDemoHandlers,
    TAB_TITLES,
    DEMO_CONFIG,
  } from './data'

  // 创建状态和处理函数
  const state = createDemoState()
  const handlers = createDemoHandlers(state)
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
