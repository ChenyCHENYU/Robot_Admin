<template>
  <div class="diagram-demo">
    <NH1 class="p4px">图编辑引擎示例</NH1>
    <NCard>
      <template #header>
        <NTabs
          v-model:value="currentType"
          type="line"
          size="medium"
          :bar-width="28"
        >
          <NTab
            name="er"
            tab="ER图"
          />
          <NTab
            name="bpmn"
            tab="BPMN图"
          />
          <NTab
            name="uml"
            tab="UML类图"
          />
        </NTabs>
      </template>

      <!-- 关键：给容器明确的高度 -->
      <div class="chart-container">
        <C_AntV
          :type="currentType"
          :data="currentData"
          :width="'100%'"
          :height="'100%'"
          :readonly="false"
          :show-toolbar="true"
          @ready="handleReady"
          @data-change="handleDataChange"
          ref="diagramRef"
        />
      </div>
    </NCard>

    <!-- 数据预览 -->
    <NCard
      title="数据预览"
      style="margin-top: 16px"
    >
      <C_Code
        :code="JSON.stringify(currentData, null, 2)"
        language="json"
        title="当前图表数据"
        :show-header="true"
        :show-line-numbers="true"
        :word-wrap="false"
        :show-fullscreen="true"
        max-height="400px"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type { DiagramType, DiagramData } from '@/types/antv'

  const currentType = ref<DiagramType>('bpmn') // 直接显示BPMN
  const diagramRef = ref()
  const graphData = ref<DiagramData>()

  // 根据类型提供初始数据 - 精简修复：只改返回类型和default
  const currentData = computed((): DiagramData | undefined => {
    console.log('计算数据，当前类型:', currentType.value)

    switch (currentType.value) {
      case 'er':
        return {
          tables: [
            {
              id: 'user_table',
              name: '用户表',
              comment: '系统用户信息',
              fields: [
                {
                  name: 'id',
                  type: 'BIGINT',
                  isPrimaryKey: true,
                  isRequired: true,
                  isForeignKey: false,
                },
                {
                  name: 'username',
                  type: 'VARCHAR(50)',
                  isPrimaryKey: false,
                  isRequired: true,
                  isForeignKey: false,
                },
                {
                  name: 'email',
                  type: 'VARCHAR(100)',
                  isPrimaryKey: false,
                  isRequired: true,
                  isForeignKey: false,
                },
                {
                  name: 'created_at',
                  type: 'DATETIME',
                  isPrimaryKey: false,
                  isRequired: true,
                  isForeignKey: false,
                },
              ],
              position: { x: 100, y: 100 },
            },
          ],
          relations: [],
        }
      case 'bpmn':
        return {
          nodes: [
            {
              id: 'start_1',
              type: 'start' as const,
              name: '开始',
              position: { x: 100, y: 150 },
              properties: {},
            },
            {
              id: 'task_1',
              type: 'task' as const,
              name: '审核任务',
              position: { x: 300, y: 150 },
              properties: {
                assignee: '审核员',
                description: '审核用户提交的申请',
              },
            },
            {
              id: 'end_1',
              type: 'end' as const,
              name: '结束',
              position: { x: 500, y: 150 },
              properties: {},
            },
          ],
          flows: [
            {
              id: 'flow_1',
              source: 'start_1',
              target: 'task_1',
              name: '提交',
            },
            {
              id: 'flow_2',
              source: 'task_1',
              target: 'end_1',
              name: '完成',
            },
          ],
        }
      case 'uml':
        return {
          classes: [
            {
              id: 'user_class',
              name: 'User',
              attributes: [
                { name: 'id', type: 'Long', visibility: 'private' },
                { name: 'username', type: 'String', visibility: 'private' },
                { name: 'email', type: 'String', visibility: 'private' },
              ],
              methods: [
                { name: 'getId', returnType: 'Long', visibility: 'public' },
                {
                  name: 'getUsername',
                  returnType: 'String',
                  visibility: 'public',
                },
                {
                  name: 'setUsername',
                  returnType: 'void',
                  visibility: 'public',
                },
              ],
              position: { x: 100, y: 100 },
            },
          ],
          relations: [],
        }
      default:
        return undefined // 改为undefined而不是null
    }
  })

  // 清理后的handleReady - 移除所有测试代码
  const handleReady = (graph: any) => {
    console.log('图表准备就绪:', graph)
    console.log('当前数据:', currentData.value)
    console.log('图表容器尺寸:', graph.options.width, 'x', graph.options.height)

    // 不再添加任何测试代码，让BPMN组件自己处理
  }

  const handleDataChange = (data: DiagramData) => {
    graphData.value = data
    console.log('数据变化:', data)
  }

  // 监听类型切换
  watch(currentType, newType => {
    console.log('切换到:', newType)
  })
</script>

<style scoped>
  .diagram-demo {
    padding: 24px;
  }

  /* 关键：容器样式 */
  .chart-container {
    width: 100%;
    height: 600px;
    position: relative;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }
</style>
