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
    <NH1>分割面板场景示例</NH1>

    <!-- 基础水平分割 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:arrow-split-vertical"
          class="title-icon"
        />
        基础水平分割
      </h2>
      <div class="section-desc"
        >最简单的左右分割面板，可拖拽分割线调整面板大小</div
      >
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
              <div class="demo-panel demo-panel--primary">
                <Icon icon="mdi:dock-left" />
                <span>左面板</span>
              </div>
            </template>
            <template #second>
              <div class="demo-panel demo-panel--info">
                <Icon icon="mdi:dock-right" />
                <span>右面板</span>
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
          name="mdi:arrow-split-horizontal"
          class="title-icon"
        />
        垂直分割
      </h2>
      <div class="section-desc"
        >设置 <code>direction="vertical"</code> 可切换为上下分割</div
      >
      <div class="section-content">
        <div class="demo-container demo-container--tall">
          <C_SplitPane
            direction="vertical"
            :default-size="40"
          >
            <template #first>
              <div class="demo-panel demo-panel--success">
                <Icon icon="mdi:dock-top" />
                <span>上面板</span>
              </div>
            </template>
            <template #second>
              <div class="demo-panel demo-panel--warning">
                <Icon icon="mdi:dock-bottom" />
                <span>下面板</span>
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
          name="mdi:arrow-expand-horizontal"
          class="title-icon"
        />
        尺寸限制
      </h2>
      <div class="section-desc">
        通过 <code>min-size</code> 和
        <code>max-size</code> 限制面板的最小/最大比例
      </div>
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            :default-size="50"
            :min-size="20"
            :max-size="80"
          >
            <template #first>
              <div class="demo-panel demo-panel--primary">
                <div class="panel-inner">
                  <Icon icon="mdi:arrow-collapse-left" />
                  <span>最小 20%</span>
                </div>
              </div>
            </template>
            <template #second>
              <div class="demo-panel demo-panel--info">
                <div class="panel-inner">
                  <Icon icon="mdi:arrow-collapse-right" />
                  <span>最大 80%</span>
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
          name="mdi:unfold-more-vertical"
          class="title-icon"
        />
        折叠 / 展开
      </h2>
      <div class="section-desc">
        双击分割线或点击折叠按钮可折叠面板。也可以通过编程方式控制折叠
      </div>
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
              <div class="demo-panel demo-panel--success">
                <Icon icon="mdi:page-layout-sidebar-left" />
                <span>侧边栏</span>
              </div>
            </template>
            <template #second>
              <div class="demo-panel demo-panel--warning">
                <Icon icon="mdi:page-layout-body" />
                <span>主内容区</span>
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
          name="mdi:view-column-outline"
          class="title-icon"
        />
        嵌套分割
      </h2>
      <div class="section-desc">
        SplitPane 可互相嵌套，实现复杂的编辑器布局
      </div>
      <div class="section-content">
        <div class="demo-container demo-container--tall">
          <C_SplitPane
            :default-size="25"
            :min-size="15"
            :max-size="40"
          >
            <template #first>
              <div class="demo-panel demo-panel--primary">
                <Icon icon="mdi:folder-outline" />
                <span>文件树</span>
              </div>
            </template>
            <template #second>
              <C_SplitPane
                direction="vertical"
                :default-size="70"
              >
                <template #first>
                  <div class="demo-panel demo-panel--info">
                    <Icon icon="mdi:code-braces" />
                    <span>代码编辑区</span>
                  </div>
                </template>
                <template #second>
                  <div class="demo-panel demo-panel--warning">
                    <Icon icon="mdi:console" />
                    <span>终端 / 输出</span>
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
          name="mdi:keyboard"
          class="title-icon"
        />
        键盘控制
      </h2>
      <div class="section-desc">
        聚焦分割线后，可用 <code>←</code> <code>→</code> 方向键微调面板大小，
        <code>Home</code> / <code>End</code> 跳到最小/最大值
      </div>
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            :default-size="50"
            :min-size="10"
            :max-size="90"
            :step="5"
          >
            <template #first>
              <div class="demo-panel demo-panel--primary">
                <Icon icon="mdi:keyboard-outline" />
                <span>点击分割线后按方向键</span>
              </div>
            </template>
            <template #second>
              <div class="demo-panel demo-panel--info">
                <Icon icon="mdi:arrow-left-right" />
                <span>步长 5%</span>
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
          name="mdi:lock-outline"
          class="title-icon"
        />
        禁用状态
      </h2>
      <div class="section-desc">
        设置 <code>disabled</code> 后分割线不可拖拽
      </div>
      <div class="section-content">
        <div class="demo-container">
          <C_SplitPane
            :default-size="40"
            :disabled="true"
          >
            <template #first>
              <div class="demo-panel demo-panel--disabled">
                <Icon icon="mdi:lock" />
                <span>锁定面板</span>
              </div>
            </template>
            <template #second>
              <div class="demo-panel demo-panel--disabled">
                <Icon icon="mdi:lock" />
                <span>锁定面板</span>
              </div>
            </template>
          </C_SplitPane>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'

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
