<template>
  <div class="p-6 mx-auto">
    <NH1 class="demo-title"> 进度步骤条组件场景示例 </NH1>
    <!-- 基础示例 -->
    <NCard title="基础用法">
      <div class="py-3">
        <div class="mb-4">
          <C_ActionBar :actions="basicStepActions" />
        </div>

        <C_Steps
          :steps="basicSteps"
          :current="demo1.current"
        />
      </div>
    </NCard>

    <!-- 带时间的步骤 -->
    <NCard
      title="订单跟踪"
      class="mt-4"
    >
      <C_Steps
        :steps="orderSteps"
        :current="2"
      />
    </NCard>

    <!-- 垂直布局 -->
    <NCard
      title="垂直布局"
      class="mt-4"
    >
      <NGrid
        :cols="2"
        :x-gap="24"
      >
        <NGi>
          <h4 class="text-16px font-500 mb-4">项目进度</h4>
          <C_Steps
            :steps="projectSteps"
            :current="2"
            direction="vertical"
          />
        </NGi>
        <NGi>
          <h4 class="text-16px font-500 mb-4">审批流程</h4>
          <C_Steps
            :steps="approvalSteps"
            :current="3"
            direction="vertical"
            :clickable="true"
            @change="(n: number) => message.info(`切换到第 ${n + 1} 步`)"
          />
        </NGi>
      </NGrid>
    </NCard>

    <!-- 自定义图标 -->
    <NCard
      title="自定义图标"
      class="mt-4"
    >
      <C_Steps
        :steps="iconSteps"
        :current="2"
      />
    </NCard>

    <!-- 错误状态 -->
    <NCard
      title="包含错误状态"
      class="mt-4"
    >
      <C_Steps
        :steps="errorSteps"
        :current="2"
      />
    </NCard>

    <!-- 实际应用场景 -->
    <NCard
      title="注册流程"
      class="mt-4"
    >
      <C_Steps
        :steps="registerSteps"
        :current="demo2.current"
        :clickable="true"
        @update:current="demo2.current = $event"
      />

      <div class="mt-6 p-4 rounded-lg">
        <h4 class="font-500 mb-2">{{ registerSteps[demo2.current].title }}</h4>
        <p class="text-14px">{{ registerSteps[demo2.current].detail }}</p>

        <div class="mt-4">
          <C_ActionBar :actions="registerStepActions" />
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type { ActionItem } from '@/types/modules/action-bar'
  import {
    basicSteps,
    orderSteps,
    projectSteps,
    approvalSteps,
    iconSteps,
    errorSteps,
    registerSteps,
  } from './data'

  const message = useMessage()

  const demo1 = reactive({ current: 1 })
  const demo2 = reactive({ current: 0 })
  const loading = ref(false)

  /** 基础用法步骤按钮 */
  const basicStepActions = computed((): ActionItem[] => [
    {
      label: '上一步',
      disabled: demo1.current <= 0,
      onClick: () => demo1.current--,
    },
    {
      label: '下一步',
      type: 'primary' as const,
      disabled: demo1.current >= 4,
      onClick: () => demo1.current++,
    },
  ])

  /** 注册流程步骤按钮 */
  const registerStepActions = computed((): ActionItem[] => [
    {
      label: '上一步',
      disabled: demo2.current <= 0,
      onClick: () => demo2.current--,
    },
    {
      label: demo2.current === registerSteps.length - 1 ? '完成' : '下一步',
      type: 'primary' as const,
      loading: loading.value,
      onClick: handleNext,
    },
  ])

  // 处理下一步
  const handleNext = async () => {
    if (demo2.current >= registerSteps.length - 1) return

    loading.value = true
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    demo2.current++
    loading.value = false

    if (demo2.current === registerSteps.length - 1) {
      message.success('注册完成！')
    }
  }
</script>
