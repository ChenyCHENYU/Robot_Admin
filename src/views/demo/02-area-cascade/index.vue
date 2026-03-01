<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-28 11:26:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-31 14:13:24
 * @FilePath: \Robot_Admin\src\views\demo\02-area-cascade\index.vue
 * @Description: 级联选择器示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cascade-demo">
    <NH1>级联选择器组件场景示例</NH1>

    <NSpace
      vertical
      :size="24"
    >
      <!-- 使用v-for循环渲染多个级联选择器 -->
      <NCard
        v-for="config in cascadeConfigs"
        :key="config.id"
        :title="config.title"
        hoverable
      >
        <template #header-extra>
          <NTag :type="config.tagType">
            {{
              config.id === 'city'
                ? '地区选择'
                : config.id === 'tech'
                  ? '技术栈'
                  : '组织架构'
            }}
          </NTag>
        </template>

        <NSpace vertical>
          <!-- 描述信息 -->
          <NText depth="2">
            {{ config.description }}
          </NText>

          <!-- 级联选择器 -->
          <C_Cascade
            :data="config.data"
            v-model="config.selected"
            :placeholders="config.placeholders"
            :type="config.type"
            @change="val => handleChange(config, val)"
          />

          <!-- 操作按钮和结果展示 -->
          <NSpace>
            <NButton
              type="primary"
              @click="() => resetSelected(config)"
            >
              重置选择
            </NButton>
          </NSpace>

          <!-- 选择结果展示 -->
          <NAlert
            v-if="config.selected.primary"
            type="success"
            :title="`当前选择的${config.title.replace('选择', '')}`"
          >
            <NSpace
              vertical
              :size="8"
            >
              <div>
                <NTag
                  size="small"
                  :bordered="false"
                  >{{ config.labels.primary }}</NTag
                >
                {{ config.selected.primary.label }}
              </div>
              <div v-if="config.selected.secondary">
                <NTag
                  size="small"
                  :bordered="false"
                  >{{ config.labels.secondary }}</NTag
                >
                {{ config.selected.secondary.label }}
              </div>
              <div v-if="config.selected.tertiary">
                <NTag
                  size="small"
                  :bordered="false"
                  >{{ config.labels.tertiary }}</NTag
                >
                {{ config.selected.tertiary.label }}
              </div>
            </NSpace>
          </NAlert>

          <NAlert
            v-else
            type="default"
          >
            <template #header> 尚未选择 </template>
            请点击上方选择器进行选择
          </NAlert>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import pcaCode from '@/assets/data/pca-code.json'
  import { type CascadeItem } from '@robot-admin/naive-ui-components'

  // 定义级联选择器选中值的接口
  interface CascadeOption {
    label: string
    value: string | number
  }

  // 使用更具描述性的命名
  interface CascadeSelected {
    primary?: CascadeOption | null // 第一级选项
    secondary?: CascadeOption | null // 第二级选项
    tertiary?: CascadeOption | null // 第三级选项
  }

  // 定义级联选择器配置接口
  interface CascadeConfig {
    id: string
    title: string
    data: CascadeItem[]
    selected: CascadeSelected
    placeholders: string[]
    type?: string
    tagType?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    description?: string
    labels: {
      primary: string // 第一级标签
      secondary: string // 第二级标签
      tertiary: string // 第三级标签
    }
  }

  // 转换省市区数据为级联组件需要的格式
  const cityData = pcaCode.map(province => ({
    label: province.name,
    value: province.code,
    children: province.children?.map(city => ({
      label: city.name,
      value: city.code,
      children: city.children?.map(area => ({
        label: area.name,
        value: area.code,
      })),
    })),
  }))

  // 技术分类数据
  const techData = [
    {
      label: '前端开发',
      value: 'frontend',
      children: [
        {
          label: 'Vue',
          value: 'vue',
          children: [
            { label: 'Vue 2.x', value: 'vue2' },
            { label: 'Vue 3.x', value: 'vue3' },
            { label: 'Vuex', value: 'vuex' },
            { label: 'Vue Router', value: 'vue-router' },
          ],
        },
        {
          label: 'React',
          value: 'react',
          children: [
            { label: 'React Hooks', value: 'hooks' },
            { label: 'Redux', value: 'redux' },
            { label: 'React Router', value: 'react-router' },
          ],
        },
        {
          label: '工具链',
          value: 'tools',
          children: [
            { label: 'Webpack', value: 'webpack' },
            { label: 'Vite', value: 'vite' },
            { label: 'TypeScript', value: 'typescript' },
          ],
        },
      ],
    },
    {
      label: '后端开发',
      value: 'backend',
      children: [
        {
          label: 'Node.js',
          value: 'nodejs',
          children: [
            { label: 'Express', value: 'express' },
            { label: 'Koa', value: 'koa' },
            { label: 'NestJS', value: 'nestjs' },
          ],
        },
        {
          label: 'Python',
          value: 'python',
          children: [
            { label: 'Django', value: 'django' },
            { label: 'Flask', value: 'flask' },
            { label: 'FastAPI', value: 'fastApi' },
          ],
        },
      ],
    },
    {
      label: '数据库',
      value: 'database',
      children: [
        {
          label: '关系型',
          value: 'sql',
          children: [
            { label: 'MySQL', value: 'mysql' },
            { label: 'PostgreSQL', value: 'postgresql' },
          ],
        },
        {
          label: '非关系型',
          value: 'nosql',
          children: [
            { label: 'MongoDB', value: 'mongodb' },
            { label: 'Redis', value: 'redis' },
          ],
        },
      ],
    },
  ]

  // 组织架构数据
  const orgData = [
    {
      label: '技术部',
      value: 'tech',
      children: [
        {
          label: '研发中心',
          value: 'rd',
          children: [
            { label: '前端组', value: 'frontend-team' },
            { label: '后端组', value: 'backend-team' },
            { label: '测试组', value: 'qa-team' },
          ],
        },
        {
          label: '运维中心',
          value: 'ops',
          children: [
            { label: '系统组', value: 'system-team' },
            { label: '网络组', value: 'network-team' },
          ],
        },
      ],
    },
    {
      label: '产品部',
      value: 'product',
      children: [
        {
          label: '产品设计中心',
          value: 'design',
          children: [
            { label: 'UI设计组', value: 'ui-team' },
            { label: 'UX设计组', value: 'ux-team' },
          ],
        },
        {
          label: '产品规划中心',
          value: 'planning',
          children: [
            { label: '产品经理组', value: 'pm-team' },
            { label: '数据分析组', value: 'analysis-team' },
          ],
        },
      ],
    },
    {
      label: '市场部',
      value: 'marketing',
      children: [
        {
          label: '市场营销中心',
          value: 'marketing-center',
          children: [
            { label: '品牌组', value: 'brand-team' },
            { label: '推广组', value: 'promotion-team' },
          ],
        },
        {
          label: '销售中心',
          value: 'sales-center',
          children: [
            { label: '国内销售组', value: 'domestic-sales' },
            { label: '海外销售组', value: 'overseas-sales' },
          ],
        },
      ],
    },
  ]

  // 创建级联选择器配置
  const cascadeConfigs = reactive<CascadeConfig[]>([
    {
      id: 'city',
      title: '城市级联选择',
      data: cityData,
      selected: {},
      placeholders: ['请选择省份', '请选择城市', '请选择区县'],
      tagType: 'info',
      description: '支持全国省市区三级联动选择，数据覆盖全国所有行政区域',
      labels: {
        primary: '省份',
        secondary: '城市',
        tertiary: '区县',
      },
    },
    {
      id: 'tech',
      title: '技术分类选择',
      data: techData,
      selected: {},
      placeholders: ['请选择技术方向', '请选择技术框架', '请选择具体版本'],
      type: 'primary',
      tagType: 'warning',
      description: '用于选择技术栈，包含前端、后端和数据库等技术分类',
      labels: {
        primary: '方向',
        secondary: '框架',
        tertiary: '版本',
      },
    },
    {
      id: 'org',
      title: '部门组织选择',
      data: orgData,
      selected: {},
      placeholders: ['请选择中心', '请选择部门', '请选择小组'],
      tagType: 'success',
      description: '企业组织架构选择器，支持多级部门层级选择',
      labels: {
        primary: '中心',
        secondary: '部门',
        tertiary: '小组',
      },
    },
  ])

  // 通用重置方法
  const resetSelected = (config: CascadeConfig) => {
    config.selected = {}
  }

  // 通用变更处理方法
  const handleChange = (config: CascadeConfig, val: CascadeSelected) => {
    console.info(`${config.title}:`, {
      [config.labels.primary]: val.primary?.label,
      [config.labels.secondary]: val.secondary?.label,
      [config.labels.tertiary]: val.tertiary?.label,
    })
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
