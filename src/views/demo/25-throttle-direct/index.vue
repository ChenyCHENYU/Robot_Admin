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
    <c_vTitle
      title="v-throttle 节流指令场景示例"
      icon="mdi:speedometer"
      description="通过 v-throttle 指令对事件进行节流控制，保证在固定时间内只执行一次"
    />

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
                  @click="demo.basic.custom++"
                >
                  节流按钮 (300ms)
                </NButton>
                <NText depth="3">点击计数: {{ demo.basic.custom }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-throttle
                  type="default"
                  @click="demo.basic.default++"
                >
                  默认节流按钮 (300ms)
                </NButton>
                <NText depth="3">点击计数: {{ demo.basic.default }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  type="warning"
                  @click="demo.basic.normal++"
                >
                  普通按钮 (无节流)
                </NButton>
                <NText depth="3">点击计数: {{ demo.basic.normal }}</NText>
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
                    handler: () => demo.config.executed++,
                    onThrottle: () => demo.config.throttled++,
                  }"
                  type="info"
                >
                  慢速节流 (1000ms)
                </NButton>
                <NSpace>
                  <NText depth="3">执行: {{ demo.config.executed }}</NText>
                  <NText depth="3">节流: {{ demo.config.throttled }}</NText>
                </NSpace>
              </div>

              <div class="demo-row">
                <NButton
                  v-throttle="{
                    delay: DEMO_CONFIG.LEADING_DELAY,
                    leading: true,
                    trailing: false,
                    handler: () => demo.config.leading++,
                  }"
                  type="success"
                >
                  仅前缘执行 (500ms)
                </NButton>
                <NText depth="3">执行计数: {{ demo.config.leading }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-throttle="{
                    delay: DEMO_CONFIG.TRAILING_DELAY,
                    leading: false,
                    trailing: true,
                    handler: () => demo.config.trailing++,
                  }"
                  type="error"
                >
                  仅后缘执行 (600ms)
                </NButton>
                <NText depth="3">执行计数: {{ demo.config.trailing }}</NText>
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
                <NSwitch v-model:value="demo.dynamic.enabled" />
                <NText>启用节流</NText>

                <NInputNumber
                  v-model:value="demo.dynamic.delay"
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
                <NSwitch v-model:value="demo.dynamic.leading" />
                <NText>前缘执行</NText>

                <NSwitch v-model:value="demo.dynamic.trailing" />
                <NText>后缘执行</NText>
              </NSpace>

              <div class="demo-container">
                <div class="demo-row">
                  <NButton
                    v-throttle="{
                      disabled: !demo.dynamic.enabled,
                      delay: demo.dynamic.delay,
                      leading: demo.dynamic.leading,
                      trailing: demo.dynamic.trailing,
                      handler: () => demo.dynamic.executed++,
                      onThrottle: () => demo.dynamic.throttled++,
                    }"
                    type="primary"
                  >
                    动态配置按钮
                  </NButton>
                  <NSpace>
                    <NText depth="3">执行: {{ demo.dynamic.executed }}</NText>
                    <NText depth="3">节流: {{ demo.dynamic.throttled }}</NText>
                  </NSpace>
                </div>
              </div>

              <NSpace>
                <NTag
                  >节流状态: {{ demo.dynamic.enabled ? '启用' : '禁用' }}</NTag
                >
                <NTag type="info">延迟: {{ demo.dynamic.delay }}ms</NTag>
                <NTag type="success">
                  前缘: {{ demo.dynamic.leading ? '开启' : '关闭' }}
                </NTag>
                <NTag type="warning">
                  后缘: {{ demo.dynamic.trailing ? '开启' : '关闭' }}
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
              v-model:value="demo.tabs.scenario"
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
                        v-model:value="demo.search.keyword"
                        placeholder="输入搜索关键词"
                        style="width: 300px"
                      />
                      <NButton
                        :key="demo.tabs.buttonKey"
                        v-throttle="{
                          delay: DEMO_CONFIG.SEARCH_DELAY,
                          handler: demo.search.execute,
                        }"
                        type="primary"
                        :loading="demo.search.loading"
                      >
                        搜索 (节流 500ms)
                      </NButton>
                    </NSpace>

                    <div class="search-stats">
                      <NSpace>
                        <NTag>搜索次数: {{ demo.search.count }}</NTag>
                        <NTag type="info"
                          >关键词:
                          {{ demo.search.appliedKeyword || '暂无' }}</NTag
                        >
                      </NSpace>
                    </div>

                    <div
                      class="search-results"
                      v-if="demo.search.results.length > 0"
                    >
                      <NList>
                        <NListItem
                          v-for="result in demo.search.results"
                          :key="result.id"
                        >
                          <NThing
                            :title="result.title"
                            :description="result.description"
                          />
                        </NListItem>
                      </NList>
                    </div>
                    <NEmpty
                      v-else-if="!demo.search.loading"
                      description="没有符合关键词的条目"
                    />
                  </NSpace>
                </div>
              </NTabPane>

              <!-- 滚动加载场景 -->
              <NTabPane
                name="scroll"
                tab="滚动加载"
              >
                <div class="demo-container">
                  <div class="scroll-container">
                    <div
                      v-for="item in demo.list.items"
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
                        :key="demo.tabs.buttonKey"
                        v-throttle="{
                          delay: DEMO_CONFIG.LOAD_DELAY,
                          handler: demo.list.loadMore,
                        }"
                        type="default"
                        :loading="demo.list.loading"
                        block
                      >
                        加载更多 (节流 800ms)
                      </NButton>
                    </div>
                  </div>

                  <div class="load-stats">
                    <NSpace>
                      <NTag>加载次数: {{ demo.list.count }}</NTag>
                      <NTag type="success"
                        >总数据: {{ demo.list.items.length }}</NTag
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
                        @click="demo.actions.liked++"
                      >
                        点赞 ❤️ (节流 400ms)
                      </NButton>
                      <NText depth="3">点赞数: {{ demo.actions.liked }}</NText>
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-throttle="{
                          delay: 600,
                          leading: true,
                          trailing: false,
                        }"
                        type="info"
                        @click="demo.actions.shared++"
                      >
                        分享 📤 (前缘节流 600ms)
                      </NButton>
                      <NText depth="3"
                        >分享次数: {{ demo.actions.shared }}</NText
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
                        @click="demo.actions.downloaded++"
                      >
                        下载 📥 (后缘节流 1000ms)
                      </NButton>
                      <NText depth="3"
                        >下载次数: {{ demo.actions.downloaded }}</NText
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
            v-model:value="demo.tabs.code"
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
  defineOptions({ name: 'Demo25ThrottleDirect' })
  import { CODE_EXAMPLES } from './codeExamples'
  import { DEMO_CONFIG, TAB_TITLES } from './data'
  import { useThrottleDemo } from './useThrottleDemo'

  const demo = useThrottleDemo()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
