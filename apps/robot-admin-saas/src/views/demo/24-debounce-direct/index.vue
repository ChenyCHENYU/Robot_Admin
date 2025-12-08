<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 11:08:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 16:28:18
 * @FilePath: \Robot_Admin\src\views\demo\24-debounce-direct\index.vue
 * @Description: 防抖指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="debounce-demo-page">
    <NH1>v-debounce 防抖指令场景示例</NH1>

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
          <!-- 基础防抖演示 -->
          <NCard
            title="基础防抖演示"
            size="small"
          >
            <div class="demo-container">
              <div class="demo-row">
                <NButton
                  v-debounce="DEMO_CONFIG.DEFAULT_DELAY"
                  type="primary"
                  @click="handlers.handleBasicClick"
                >
                  防抖按钮 (300ms)
                </NButton>
                <NText depth="3"
                  >点击计数: {{ state.basicClickCount.value }}</NText
                >
              </div>

              <div class="demo-row">
                <NButton
                  v-debounce
                  type="default"
                  @click="handlers.handleDefaultClick"
                >
                  默认防抖按钮 (300ms)
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
                  普通按钮 (无防抖)
                </NButton>
                <NText depth="3"
                  >点击计数: {{ state.normalClickCount.value }}</NText
                >
              </div>
            </div>
            <NDivider />
            <NText depth="3">
              快速连续点击对比：防抖按钮会延迟执行，普通按钮立即响应每次点击
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
                  v-debounce="{
                    delay: DEMO_CONFIG.SLOW_DELAY,
                    onExecute: handlers.handleSlowExecute,
                  }"
                  type="info"
                  @click="handlers.handleSlowClick"
                >
                  慢速防抖 (1000ms)
                </NButton>
                <NText depth="3"
                  >执行计数: {{ state.slowClickCount.value }}</NText
                >
              </div>

              <div class="demo-row">
                <NButton
                  v-debounce="{
                    delay: DEMO_CONFIG.IMMEDIATE_DELAY,
                    immediate: true,
                    onExecute: handlers.handleImmediateExecute,
                  }"
                  type="success"
                  @click="handlers.handleImmediateClick"
                >
                  立即执行防抖 (500ms)
                </NButton>
                <NText depth="3"
                  >执行计数: {{ state.immediateClickCount.value }}</NText
                >
              </div>

              <div class="demo-row">
                <NButton
                  v-debounce="{
                    delay: DEMO_CONFIG.CALLBACK_DELAY,
                    onExecute: handlers.handleExecuteCallback,
                    onCancel: handlers.handleCancelCallback,
                  }"
                  type="error"
                  @click="handlers.handleCallbackClick"
                >
                  回调演示 (800ms)
                </NButton>
                <NSpace>
                  <NText depth="3"
                    >执行: {{ state.callbackExecuteCount.value }}</NText
                  >
                  <NText depth="3"
                    >取消: {{ state.callbackCancelCount.value }}</NText
                  >
                </NSpace>
              </div>
            </div>
            <NDivider />
            <NText depth="3">
              支持延迟时间、立即执行、执行和取消回调等配置
            </NText>
          </NCard>

          <!-- 动态配置演示 -->
          <NCard
            title="动态配置演示"
            size="small"
          >
            <NSpace vertical>
              <NSpace>
                <NSwitch v-model:value="state.debounceEnabled.value" />
                <NText>启用防抖</NText>

                <NInputNumber
                  v-model:value="state.debounceDelay.value"
                  :min="DEMO_CONFIG.DELAY_MIN"
                  :max="DEMO_CONFIG.DELAY_MAX"
                  :step="DEMO_CONFIG.DELAY_STEP"
                  placeholder="延迟时间"
                  style="width: 120px"
                  class="mt--6px"
                />
                <NText>ms</NText>

                <NSwitch v-model:value="state.immediateMode.value" />
                <NText>立即执行</NText>
              </NSpace>

              <div class="demo-container">
                <div class="demo-row">
                  <NButton
                    v-debounce="{
                      disabled: !state.debounceEnabled.value,
                      delay: state.debounceDelay.value,
                      immediate: state.immediateMode.value,
                      onExecute: handlers.handleDynamicExecute,
                      onCancel: handlers.handleDynamicCancel,
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
                      >取消: {{ state.dynamicCancelCount.value }}</NText
                    >
                  </NSpace>
                </div>
              </div>

              <NSpace>
                <NTag
                  >防抖状态:
                  {{ state.debounceEnabled.value ? '启用' : '禁用' }}</NTag
                >
                <NTag type="info">延迟: {{ state.debounceDelay.value }}ms</NTag>
                <NTag type="success">
                  模式:
                  {{ state.immediateMode.value ? '立即执行' : '延迟执行' }}
                </NTag>
              </NSpace>
            </NSpace>
            <NDivider />
            <NText depth="3">支持响应式配置，实时修改防抖参数</NText>
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
              <!-- 表单提交场景 -->
              <NTabPane
                name="submit"
                tab="表单提交"
              >
                <div class="demo-container">
                  <NForm
                    label-placement="left"
                    label-width="80px"
                  >
                    <NFormItem label="用户名">
                      <NInput
                        v-model:value="state.formData.value.username"
                        placeholder="请输入用户名"
                      />
                    </NFormItem>
                    <NFormItem label="邮箱">
                      <NInput
                        v-model:value="state.formData.value.email"
                        placeholder="请输入邮箱"
                      />
                    </NFormItem>
                    <NFormItem>
                      <NSpace>
                        <NButton
                          v-debounce="{
                            delay: DEMO_CONFIG.SUBMIT_DELAY,
                            onExecute: handlers.handleFormSubmitExecute,
                          }"
                          type="primary"
                          @click="handlers.handleFormSubmit"
                          :loading="state.isSubmitting.value"
                        >
                          提交表单 (防重复点击)
                        </NButton>
                        <NButton
                          type="default"
                          @click="handlers.handleFormReset"
                        >
                          重置
                        </NButton>
                      </NSpace>
                    </NFormItem>
                  </NForm>

                  <div class="form-status">
                    <NSpace>
                      <NTag>提交次数: {{ state.formSubmitCount.value }}</NTag>
                      <NTag
                        type="success"
                        v-if="state.submitSuccess.value"
                      >
                        提交成功!
                      </NTag>
                    </NSpace>
                  </div>
                </div>
              </NTabPane>

              <!-- 操作按钮场景 -->
              <NTabPane
                name="action"
                tab="操作按钮"
              >
                <div class="demo-container">
                  <NSpace vertical>
                    <div class="demo-row">
                      <NButton
                        v-debounce="500"
                        type="error"
                        @click="handlers.handleDeleteClick"
                      >
                        删除操作 (防误删)
                      </NButton>
                      <NText depth="3"
                        >删除次数: {{ state.deleteCount.value }}</NText
                      >
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-debounce="{
                          delay: 600,
                          immediate: false,
                        }"
                        type="warning"
                        @click="handlers.handleSaveClick"
                      >
                        保存数据 (防抖保存)
                      </NButton>
                      <NText depth="3"
                        >保存次数: {{ state.saveCount.value }}</NText
                      >
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-debounce="800"
                        type="info"
                        @click="handlers.handleRefreshClick"
                      >
                        刷新数据 (防抖刷新)
                      </NButton>
                      <NText depth="3"
                        >刷新次数: {{ state.refreshCount.value }}</NText
                      >
                    </div>
                  </NSpace>
                </div>
              </NTabPane>
            </NTabs>
            <NDivider />
            <NText depth="3">防止重复点击、误操作等实际业务场景</NText>
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
