<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FormulaEditor\components\VariablePanel.vue
 * @Description: 变量选择面板（分组 + 搜索 + 函数）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="variable-panel">
    <!-- 切换 Tab：变量 / 函数 -->
    <div class="variable-panel__tabs">
      <div
        class="variable-panel__tab"
        :class="{ 'variable-panel__tab--active': activeTab === 'variable' }"
        @click="activeTab = 'variable'"
      >
        表单项目
      </div>
      <div
        class="variable-panel__tab"
        :class="{ 'variable-panel__tab--active': activeTab === 'function' }"
        @click="activeTab = 'function'"
      >
        常用函数
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="variable-panel__search">
      <NInput
        v-model:value="searchText"
        size="small"
        placeholder="搜索..."
        clearable
      >
        <template #prefix>
          <C_Icon
            name="mdi:magnify"
            style="opacity: 0.4"
          />
        </template>
      </NInput>
    </div>

    <!-- 变量列表 -->
    <NScrollbar
      v-if="activeTab === 'variable'"
      class="variable-panel__list"
    >
      <template v-if="groupedVariables.length > 0">
        <div
          v-for="group in groupedVariables"
          :key="group.name"
          class="variable-panel__group"
        >
          <div
            class="variable-panel__group-title"
            @click="toggleGroup(group.name)"
          >
            <C_Icon
              :name="
                expandedGroups.has(group.name)
                  ? 'mdi:chevron-down'
                  : 'mdi:chevron-right'
              "
              style="font-size: 16px; transition: transform 0.2s"
            />
            {{ group.name }}
          </div>
          <div
            v-show="expandedGroups.has(group.name)"
            class="variable-panel__items"
          >
            <div
              v-for="variable in group.items"
              :key="variable.field"
              class="variable-panel__item"
              @click="$emit('select-variable', variable)"
            >
              <C_Icon
                :name="getTypeIcon(variable.type)"
                class="variable-panel__item-icon"
              />
              <span>{{ variable.name }}</span>
            </div>
          </div>
        </div>
      </template>
      <NEmpty
        v-else
        size="small"
        description="无匹配变量"
      />
    </NScrollbar>

    <!-- 函数列表 -->
    <NScrollbar
      v-else
      class="variable-panel__list"
    >
      <template v-if="filteredFunctions.length > 0">
        <div
          v-for="func in filteredFunctions"
          :key="func.name"
          class="variable-panel__func"
          @click="$emit('select-function', func)"
        >
          <div class="variable-panel__func-name">
            <span class="variable-panel__func-badge">ƒ</span>
            {{ func.name }}
          </div>
          <div class="variable-panel__func-desc">
            {{ func.description }}
          </div>
          <div class="variable-panel__func-sig">
            {{ func.signature }}
          </div>
        </div>
      </template>
      <NEmpty
        v-else
        size="small"
        description="无匹配函数"
      />
    </NScrollbar>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormulaFunction,
    FormulaVariable,
    FormulaVariableType,
  } from '@/types/modules/formula-editor'

  interface Props {
    variables: FormulaVariable[]
    functions: FormulaFunction[]
  }

  interface Emits {
    (e: 'select-variable', variable: FormulaVariable): void
    (e: 'select-function', func: FormulaFunction): void
  }

  const props = defineProps<Props>()
  defineEmits<Emits>()

  const activeTab = ref<'variable' | 'function'>('variable')
  const searchText = ref('')
  const expandedGroups = ref(new Set<string>())

  // ─── 变量分组 ─────────────────────────────────

  interface VariableGroup {
    name: string
    items: FormulaVariable[]
  }

  /** 过滤并按 group 分组变量 */
  const groupedVariables = computed<VariableGroup[]>(() => {
    const keyword = searchText.value.toLowerCase()
    const filtered = keyword
      ? props.variables.filter(
          v =>
            v.name.toLowerCase().includes(keyword) ||
            v.field.toLowerCase().includes(keyword) ||
            (v.description ?? '').toLowerCase().includes(keyword)
        )
      : props.variables

    const map = new Map<string, FormulaVariable[]>()
    for (const v of filtered) {
      const group = v.group ?? '其他'
      const list = map.get(group)
      if (list) {
        list.push(v)
      } else {
        map.set(group, [v])
      }
    }

    return Array.from(map, ([name, items]) => ({ name, items }))
  })

  // 默认展开所有分组
  watch(
    groupedVariables,
    groups => {
      for (const g of groups) {
        expandedGroups.value.add(g.name)
      }
    },
    { immediate: true }
  )

  /** 切换分组折叠 */
  function toggleGroup(name: string) {
    if (expandedGroups.value.has(name)) {
      expandedGroups.value.delete(name)
    } else {
      expandedGroups.value.add(name)
    }
  }

  // ─── 函数过滤 ─────────────────────────────────

  const filteredFunctions = computed(() => {
    const keyword = searchText.value.toLowerCase()
    if (!keyword) return props.functions
    return props.functions.filter(
      f =>
        f.name.toLowerCase().includes(keyword) ||
        f.description.toLowerCase().includes(keyword)
    )
  })

  // ─── 变量类型图标 ─────────────────────────────

  /** 根据变量类型返回图标 */
  function getTypeIcon(type: FormulaVariableType): string {
    switch (type) {
      case 'number':
        return 'mdi:numeric'
      case 'text':
        return 'mdi:format-text'
      case 'boolean':
        return 'mdi:toggle-switch-outline'
      default:
        return 'mdi:variable'
    }
  }
</script>

<style lang="scss" scoped>
  .variable-panel {
    display: flex;
    flex-direction: column;
    background: var(--card-color);
    overflow: hidden;
    height: 100%;

    &__tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
    }

    &__tab {
      flex: 1;
      padding: 8px 0;
      text-align: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-color-2);
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;

      &:hover {
        color: var(--primary-color);
      }

      &--active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
      }
    }

    &__search {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
    }

    &__list {
      flex: 1;
      max-height: 360px;
      padding: 4px 0;
    }

    &__group-title {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-color-2);
      cursor: pointer;
      user-select: none;

      &:hover {
        color: var(--text-color-1);
      }
    }

    &__items {
      padding: 0 4px;
    }

    &__item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px 6px 26px;
      font-size: 13px;
      color: var(--text-color-1);
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s;

      &:hover {
        background: var(--hover-color);
      }

      &-icon {
        font-size: 15px;
        color: var(--primary-color);
        flex-shrink: 0;
      }
    }

    &__func {
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 4px;
      margin: 2px 4px;
      transition: background 0.15s;

      &:hover {
        background: var(--hover-color);
      }

      &-name {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-color-1);
      }

      &-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 700;
        font-style: italic;
      }

      &-desc {
        padding-left: 24px;
        font-size: 12px;
        color: var(--text-color-3);
        margin-top: 2px;
      }

      &-sig {
        padding-left: 24px;
        font-size: 11px;
        font-family: 'Courier New', Courier, monospace;
        color: var(--text-color-3);
        margin-top: 2px;
        opacity: 0.7;
      }
    }
  }
</style>
