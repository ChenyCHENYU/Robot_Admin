<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\52-transfer\index.vue
 * @Description: 分配工作空间，实时选择、预览与本地确认
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="assignment-workspace">
    <header class="assignment-heading">
      <div
        ><span class="eyebrow">ASSIGNMENT / C_TRANSFER</span
        ><h1>分配工作空间</h1
        ><p>从候选范围到最终组合，每一次选择都清晰可见。</p></div
      >
      <span class="demo-badge">本地交互演示</span>
    </header>
    <div class="assignment-layout">
      <aside class="assignment-context">
        <span class="eyebrow">01 / 选择场景</span>
        <button
          v-for="(scene, key) in TRANSFER_SCENES"
          :key="key"
          type="button"
          :class="{ active: activeScene === key }"
          :aria-pressed="activeScene === key"
          @click="activeScene = key"
        >
          <C_Icon
            :name="scene.icon"
            :size="21"
          /><span>{{ scene.label }}</span
          ><span class="i-mdi:chevron-right" />
        </button>
        <div class="subject"
          ><span>当前分配对象</span><strong>{{ current.subject }}</strong
          ><p>{{ current.description }}</p></div
        >
        <div class="assignment-options"
          ><label
            ><span>列表搜索</span
            ><NSwitch
              v-model:value="filterable"
              size="small" /></label
          ><label
            ><span>批量选择</span
            ><NSwitch
              v-model:value="showSelectAll"
              size="small" /></label
          ><label
            ><span>列表密度</span
            ><NSelect
              v-model:value="size"
              :options="sizes"
              size="small" /></label
        ></div>
      </aside>
      <section class="assignment-editor">
        <header
          ><div
            ><span class="eyebrow">02 / 编辑范围</span
            ><h2>{{ current.label }}</h2></div
          ><span class="selection-count"
            ><b>{{ currentSelected.length }}</b> /
            {{ current.data.length }} 已选择</span
          ></header
        >
        <C_Transfer
          v-model="currentSelected"
          :data="current.data"
          :titles="current.titles"
          :filterable="filterable"
          :show-select-all="showSelectAll"
          :size="size"
          filter-placeholder="搜索名称或描述"
          target-empty-text="从左侧选择要分配的项目"
        />
        <footer
          ><span
            ><span
              class="status-dot"
              :class="{ changed }"
            />{{ changed ? '选择已变更，等待确认' : '选择结果已确认' }}</span
          ><div
            ><NButton
              :disabled="!changed"
              @click="reset"
              >撤销修改</NButton
            ><NButton
              type="primary"
              :disabled="!changed"
              @click="confirm"
              >确认选择</NButton
            ></div
          ></footer
        >
      </section>
      <aside class="assignment-preview">
        <span class="eyebrow">03 / 结果预览</span><h2>当前组合</h2
        ><p>移动项目后实时更新</p>
        <div class="selection-meter"
          ><span
            :style="{
              width: `${(currentSelected.length / current.data.length) * 100}%`,
            }"
        /></div>
        <ul v-if="selectedItems.length"
          ><li
            v-for="item in selectedItems"
            :key="item.key"
            ><C_Icon :name="item.icon || 'mdi:check'" /><span
              >{{ item.label }}<small>{{ item.description }}</small></span
            ><span class="i-mdi:check" /></li
        ></ul>
        <p
          v-else
          class="empty"
          >尚未选择项目</p
        >
        <div class="assignment-note"
          ><span class="i-mdi:information-outline" /><p
            >这里演示选择与确认流程。结果保存在当前页面，不会更改真实角色、依赖或团队。</p
          ></div
        >
      </aside>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { TRANSFER_SCENES, type TransferScene } from './data'
  defineOptions({ name: 'Demo52Transfer' })
  const activeScene = ref<TransferScene>('permission')
  const filterable = ref(true)
  const showSelectAll = ref(true)
  const size = ref<'small' | 'medium' | 'large'>('medium')
  const sizes = [
    { label: '紧凑', value: 'small' },
    { label: '舒适', value: 'medium' },
    { label: '宽松', value: 'large' },
  ]
  const selectedMap = ref<Record<TransferScene, Array<string | number>>>({
    permission: [...TRANSFER_SCENES.permission.defaults],
    module: [...TRANSFER_SCENES.module.defaults],
    member: [...TRANSFER_SCENES.member.defaults],
  })
  const confirmedMap = ref<Record<TransferScene, Array<string | number>>>(
    structuredClone(toRaw(selectedMap.value))
  )
  const current = computed(() => TRANSFER_SCENES[activeScene.value])
  const currentSelected = computed({
    get: () => selectedMap.value[activeScene.value],
    set: value => {
      selectedMap.value[activeScene.value] = value
    },
  })
  const selectedItems = computed(() =>
    current.value.data.filter(item => currentSelected.value.includes(item.key))
  )
  const changed = computed(
    () =>
      [...currentSelected.value].sort().join('|') !==
      [...confirmedMap.value[activeScene.value]].sort().join('|')
  )
  /** 撤销尚未确认的选择。 */
  const reset = () => {
    currentSelected.value = [...confirmedMap.value[activeScene.value]]
  }
  /** 确认当前页面的选择快照。 */
  const confirm = () => {
    confirmedMap.value[activeScene.value] = [...currentSelected.value]
  }
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
