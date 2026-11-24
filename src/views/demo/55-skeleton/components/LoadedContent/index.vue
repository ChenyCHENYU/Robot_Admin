<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 骨架屏加载结束后的示例内容
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    v-if="preset === 'text'"
    class="loaded-text"
  >
    <h3>{{ LOADED_CONTENT.text.title }}</h3>
    <p>{{ LOADED_CONTENT.text.content }}</p>
  </div>
  <div
    v-else-if="preset === 'avatar'"
    class="loaded-avatar"
  >
    <div class="loaded-avatar__icon">
      <C_Icon
        name="mdi:account-circle"
        :size="40"
      />
    </div>
    <div>
      <strong>{{ LOADED_CONTENT.avatar.name }}</strong>
      <p>{{ LOADED_CONTENT.avatar.role }} · {{ LOADED_CONTENT.avatar.desc }}</p>
    </div>
  </div>
  <NTable
    v-else-if="preset === 'table'"
    size="small"
    :bordered="true"
  >
    <thead>
      <tr>
        <th
          v-for="column in LOADED_CONTENT.table.columns"
          :key="column"
          scope="col"
        >
          {{ column }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in LOADED_CONTENT.table.rows"
        :key="row[0]"
      >
        <td
          v-for="(cell, index) in row"
          :key="index"
          >{{ cell }}</td
        >
        <td
          ><NButton
            size="tiny"
            type="primary"
            quaternary
            disabled
            >编辑</NButton
          ></td
        >
      </tr>
    </tbody>
  </NTable>
  <div
    v-else-if="preset === 'list'"
    class="loaded-list"
  >
    <div
      v-for="item in LOADED_CONTENT.list"
      :key="item.title"
      class="loaded-list__item"
    >
      <C_Icon
        name="mdi:bell-outline"
        :size="20"
      />
      <div>
        <strong>{{ item.title }}</strong>
        <p>{{ item.desc }}</p>
      </div>
      <time>{{ item.time }}</time>
    </div>
  </div>
  <div
    v-else
    class="loaded-fallback"
    >{{ preset }} 模式数据加载完成 ✅</div
  >
</template>

<script setup lang="ts">
  import type { SkeletonPreset } from '@robot-admin/naive-ui-components'
  import { LOADED_CONTENT } from '../../data'

  defineOptions({ name: 'LoadedContent' })
  defineProps<{ preset: SkeletonPreset }>()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
