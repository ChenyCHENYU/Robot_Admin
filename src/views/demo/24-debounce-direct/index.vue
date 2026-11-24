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
    <c_vTitle
      title="v-debounce 防抖指令场景示例"
      icon="mdi:timer-outline"
      description="通过 v-debounce 指令对事件进行防抖处理，避免高频操作导致重复执行"
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
                  @click="demo.basic.custom++"
                >
                  防抖按钮 (300ms)
                </NButton>
                <NText depth="3">点击计数: {{ demo.basic.custom }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-debounce
                  type="default"
                  @click="demo.basic.default++"
                >
                  默认防抖按钮 (300ms)
                </NButton>
                <NText depth="3">点击计数: {{ demo.basic.default }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  type="warning"
                  @click="demo.basic.normal++"
                >
                  普通按钮 (无防抖)
                </NButton>
                <NText depth="3">点击计数: {{ demo.basic.normal }}</NText>
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
                  }"
                  type="info"
                  @click="demo.config.slow++"
                >
                  慢速防抖 (1000ms)
                </NButton>
                <NText depth="3">执行计数: {{ demo.config.slow }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-debounce="{
                    delay: DEMO_CONFIG.IMMEDIATE_DELAY,
                    immediate: true,
                  }"
                  type="success"
                  @click="demo.config.immediate++"
                >
                  立即执行防抖 (500ms)
                </NButton>
                <NText depth="3">执行计数: {{ demo.config.immediate }}</NText>
              </div>

              <div class="demo-row">
                <NButton
                  v-debounce="{
                    delay: DEMO_CONFIG.CALLBACK_DELAY,
                    handler: () => demo.config.executed++,
                    onCancel: () => demo.config.canceled++,
                  }"
                  type="error"
                >
                  回调演示 (800ms)
                </NButton>
                <NSpace>
                  <NText depth="3">执行: {{ demo.config.executed }}</NText>
                  <NText depth="3">取消: {{ demo.config.canceled }}</NText>
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
                <NSwitch v-model:value="demo.dynamic.enabled" />
                <NText>启用防抖</NText>

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

                <NSwitch v-model:value="demo.dynamic.immediate" />
                <NText>立即执行</NText>
              </NSpace>

              <div class="demo-container">
                <div class="demo-row">
                  <NButton
                    v-debounce="{
                      disabled: !demo.dynamic.enabled,
                      delay: demo.dynamic.delay,
                      immediate: demo.dynamic.immediate,
                      handler: () => demo.dynamic.executed++,
                      onCancel: () => demo.dynamic.canceled++,
                    }"
                    type="primary"
                  >
                    动态配置按钮
                  </NButton>
                  <NSpace>
                    <NText depth="3">执行: {{ demo.dynamic.executed }}</NText>
                    <NText depth="3">取消: {{ demo.dynamic.canceled }}</NText>
                  </NSpace>
                </div>
              </div>

              <NSpace>
                <NTag
                  >防抖状态: {{ demo.dynamic.enabled ? '启用' : '禁用' }}</NTag
                >
                <NTag type="info">延迟: {{ demo.dynamic.delay }}ms</NTag>
                <NTag type="success">
                  模式:
                  {{ demo.dynamic.immediate ? '立即执行' : '延迟执行' }}
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
              v-model:value="demo.tabs.scenario"
              type="line"
              size="small"
            >
              <!-- 表单提交场景 -->
              <NTabPane
                name="submit"
                tab="表单提交"
              >
                <div class="demo-container">
                  <C_Form
                    v-model="demo.form.model"
                    :options="formOptions"
                    :config="{
                      labelPlacement: 'left',
                      labelWidth: 80,
                    }"
                  >
                    <template #action>
                      <NSpace>
                        <NButton
                          :key="demo.form.buttonKey"
                          v-debounce="{
                            delay: DEMO_CONFIG.SUBMIT_DELAY,
                            handler: demo.form.submit,
                          }"
                          type="primary"
                          :loading="demo.form.loading"
                        >
                          提交表单 (防重复点击)
                        </NButton>
                        <NButton
                          type="default"
                          @click="demo.form.reset"
                        >
                          重置
                        </NButton>
                      </NSpace>
                    </template>
                  </C_Form>

                  <div class="form-status">
                    <NSpace>
                      <NTag>提交次数: {{ demo.form.count }}</NTag>
                      <NTag
                        type="success"
                        v-if="demo.form.success"
                      >
                        模拟提交完成
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
                        @click="demo.actions.deleted++"
                      >
                        删除操作 (防误删)
                      </NButton>
                      <NText depth="3"
                        >删除次数: {{ demo.actions.deleted }}</NText
                      >
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-debounce="{
                          delay: 600,
                          immediate: false,
                        }"
                        type="warning"
                        @click="demo.actions.saved++"
                      >
                        保存数据 (防抖保存)
                      </NButton>
                      <NText depth="3"
                        >保存次数: {{ demo.actions.saved }}</NText
                      >
                    </div>

                    <div class="demo-row">
                      <NButton
                        v-debounce="800"
                        type="info"
                        @click="demo.actions.refreshed++"
                      >
                        刷新数据 (防抖刷新)
                      </NButton>
                      <NText depth="3"
                        >刷新次数: {{ demo.actions.refreshed }}</NText
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
  import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'
  defineOptions({ name: 'Demo24DebounceDirect' })
  import { CODE_EXAMPLES } from './codeExamples'
  import { DEMO_CONFIG, TAB_TITLES } from './data'
  import { useDebounceDemo } from './useDebounceDemo'
  const formOptions: FormOption[] = [
    {
      prop: 'username',
      label: '用户名',
      type: 'input',
      placeholder: '请输入用户名',
    },
    { prop: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱' },
  ]
  const demo = useDebounceDemo()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
