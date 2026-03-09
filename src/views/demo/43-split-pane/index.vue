<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\43-split-pane\index.vue
 * @Description: 分割面板组件演示
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="split-pane-demo-page">
    <c_vTitle
      title="分割面板场景示例"
      icon="mdi:view-split-vertical"
      description="支持水平/垂直分割、折叠展开、尺寸限制、嵌套布局等特性，适用于编辑器布局、管理后台等场景"
    />

    <!-- 基础水平分割 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.basic.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.basic.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.basic.descHtml"
      />
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            ref="basicRef"
            :default-size="50"
            :gutter-size="6"
            @resize="
              (a: number, b: number) =>
                (basicInfo = `左: ${a.toFixed(1)}% / 右: ${b.toFixed(1)}%`)
            "
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.basicFirst.colorClass"
              >
                <C_Icon :name="PANELS.basicFirst.icon" />
                <span>{{ PANELS.basicFirst.label }}</span>
              </div>
            </template>
            <template #second>
              <div
                class="demo-panel"
                :class="PANELS.basicSecond.colorClass"
              >
                <C_Icon :name="PANELS.basicSecond.icon" />
                <span>{{ PANELS.basicSecond.label }}</span>
              </div>
            </template>
          </C_SplitPane>
        </div>
        <div class="demo-info">
          <NText depth="3">{{ basicInfo || '拖拽分割线试试 →' }}</NText>
        </div>
      </div>
    </div>

    <!-- 垂直分割 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.vertical.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.vertical.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.vertical.descHtml"
      />
      <div class="section-content">
        <div class="demo-container demo-container--tall">
          <C_SplitPane
            direction="vertical"
            :default-size="40"
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.vertFirst.colorClass"
              >
                <C_Icon :name="PANELS.vertFirst.icon" />
                <span>{{ PANELS.vertFirst.label }}</span>
              </div>
            </template>
            <template #second>
              <div
                class="demo-panel"
                :class="PANELS.vertSecond.colorClass"
              >
                <C_Icon :name="PANELS.vertSecond.icon" />
                <span>{{ PANELS.vertSecond.label }}</span>
              </div>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>

    <!-- 最小/最大限制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.limits.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.limits.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.limits.descHtml"
      />
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            :default-size="50"
            :min-size="20"
            :max-size="80"
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.limitsFirst.colorClass"
              >
                <div class="panel-inner">
                  <C_Icon :name="PANELS.limitsFirst.icon" />
                  <span>{{ PANELS.limitsFirst.label }}</span>
                </div>
              </div>
            </template>
            <template #second>
              <div
                class="demo-panel"
                :class="PANELS.limitsSecond.colorClass"
              >
                <div class="panel-inner">
                  <C_Icon :name="PANELS.limitsSecond.icon" />
                  <span>{{ PANELS.limitsSecond.label }}</span>
                </div>
              </div>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>

    <!-- 折叠/展开 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.collapse.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.collapse.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.collapse.descHtml"
      />
      <div class="section-content">
        <NSpace
          :size="8"
          style="margin-bottom: 12px"
        >
          <NButton
            size="small"
            @click="collapseRef?.collapse('first')"
          >
            折叠左面板
          </NButton>
          <NButton
            size="small"
            @click="collapseRef?.collapse('second')"
          >
            折叠右面板
          </NButton>
          <NButton
            size="small"
            type="primary"
            @click="collapseRef?.expand()"
          >
            展开
          </NButton>
          <NButton
            size="small"
            @click="collapseRef?.resetSize()"
          >
            重置
          </NButton>
        </NSpace>
        <div class="demo-container">
          <C_SplitPane
            ref="collapseRef"
            :default-size="50"
            :collapsible="true"
            :show-collapse-button="true"
            @collapse="
              (t: string) =>
                handleMessage(`已折叠 ${t === 'first' ? '左' : '右'} 面板`)
            "
            @expand="
              (t: string) =>
                handleMessage(`已展开 ${t === 'first' ? '左' : '右'} 面板`)
            "
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.collapseFirst.colorClass"
              >
                <C_Icon :name="PANELS.collapseFirst.icon" />
                <span>{{ PANELS.collapseFirst.label }}</span>
              </div>
            </template>
            <template #second>
              <div
                class="demo-panel"
                :class="PANELS.collapseSecond.colorClass"
              >
                <C_Icon :name="PANELS.collapseSecond.icon" />
                <span>{{ PANELS.collapseSecond.label }}</span>
              </div>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>

    <!-- 嵌套分割 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.nested.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.nested.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.nested.descHtml"
      />
      <div class="section-content">
        <div class="demo-container demo-container--tall">
          <C_SplitPane
            :default-size="25"
            :min-size="15"
            :max-size="40"
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.nestedFileTree.colorClass"
              >
                <C_Icon :name="PANELS.nestedFileTree.icon" />
                <span>{{ PANELS.nestedFileTree.label }}</span>
              </div>
            </template>
            <template #second>
              <C_SplitPane
                direction="vertical"
                :default-size="70"
              >
                <template #first>
                  <div
                    class="demo-panel"
                    :class="PANELS.nestedEditor.colorClass"
                  >
                    <C_Icon :name="PANELS.nestedEditor.icon" />
                    <span>{{ PANELS.nestedEditor.label }}</span>
                  </div>
                </template>
                <template #second>
                  <div
                    class="demo-panel"
                    :class="PANELS.nestedTerminal.colorClass"
                  >
                    <C_Icon :name="PANELS.nestedTerminal.icon" />
                    <span>{{ PANELS.nestedTerminal.label }}</span>
                  </div>
                </template>
              </C_SplitPane>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>

    <!-- 键盘控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.keyboard.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.keyboard.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.keyboard.descHtml"
      />
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            :default-size="50"
            :min-size="10"
            :max-size="90"
            :step="5"
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.keyboardFirst.colorClass"
              >
                <C_Icon :name="PANELS.keyboardFirst.icon" />
                <span>{{ PANELS.keyboardFirst.label }}</span>
              </div>
            </template>
            <template #second>
              <div
                class="demo-panel"
                :class="PANELS.keyboardSecond.colorClass"
              >
                <C_Icon :name="PANELS.keyboardSecond.icon" />
                <span>{{ PANELS.keyboardSecond.label }}</span>
              </div>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>

    <!-- 禁用状态 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SECTIONS.disabled.titleIcon"
          class="title-icon"
        />
        {{ SECTIONS.disabled.title }}
      </h2>
      <div
        class="section-desc"
        v-html="SECTIONS.disabled.descHtml"
      />
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            :default-size="40"
            :disabled="true"
          >
            <template #first>
              <div
                class="demo-panel"
                :class="PANELS.disabledPanel.colorClass"
              >
                <C_Icon :name="PANELS.disabledPanel.icon" />
                <span>{{ PANELS.disabledPanel.label }}</span>
              </div>
            </template>
            <template #second>
              <div
                class="demo-panel"
                :class="PANELS.disabledPanel.colorClass"
              >
                <C_Icon :name="PANELS.disabledPanel.icon" />
                <span>{{ PANELS.disabledPanel.label }}</span>
              </div>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SECTIONS, PANELS } from './data'

  const message = useMessage()
  const basicRef = ref()
  const collapseRef = ref()
  const basicInfo = ref('')

  const handleMessage = (msg: string) => {
    message.success(msg)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
