<template>
  <div class="p-6 mx-auto">
    <NH1 class="demo-title"> 进度步骤条组件场景示例 </NH1>
    <!-- 基础示例 -->
    <NCard title="基础用法">
      <div class="py-3">
        <NSpace class="mb-4">
          <NButton
            @click="demo1.current--"
            :disabled="demo1.current <= 0"
            >上一步</NButton
          >
          <NButton
            type="primary"
            @click="demo1.current++"
            :disabled="demo1.current >= 4"
            >下一步</NButton
          >
        </NSpace>

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

        <NSpace class="mt-4">
          <NButton
            @click="demo2.current--"
            :disabled="demo2.current <= 0"
            >上一步</NButton
          >
          <NButton
            type="primary"
            @click="handleNext"
            :loading="loading"
          >
            {{ demo2.current === registerSteps.length - 1 ? '完成' : '下一步' }}
          </NButton>
        </NSpace>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import { type StepItem } from '@/components/global/C_Steps/index.vue'

  // 定义步骤类型
  type StepStatus = 'wait' | 'process' | 'finish' | 'error'

  const message = useMessage()

  const demo1 = reactive({ current: 1 })
  const demo2 = reactive({ current: 0 })
  const loading = ref(false)

  // 基础步骤
  const basicSteps: StepItem[] = [
    { title: '提交订单' },
    { title: '付款成功' },
    { title: '商品出库' },
    { title: '等待收货' },
    { title: '完成' },
  ]

  // 订单步骤
  const orderSteps: StepItem[] = [
    {
      title: '提交订单',
      time: '2019-03-17 17:01:25',
      icon: 'i-mdi:text-box-check-outline',
    },
    {
      title: '付款成功',
      time: '2019-03-21 00:00:00',
      icon: 'i-mdi:credit-card-check-outline',
    },
    {
      title: '商品出库',
      time: '2019-03-21 07:00:00',
      icon: 'i-mdi:package-variant-closed-check',
    },
    {
      title: '等待收货',
      icon: 'i-mdi:truck-delivery-outline',
    },
    {
      title: '完成',
      icon: 'i-mdi:check-circle-outline',
    },
  ]

  // 项目步骤
  const projectSteps: StepItem[] = [
    {
      title: '需求分析',
      description: '收集用户需求',
      time: '2024-01-15',
      status: 'finish' as StepStatus,
    },
    {
      title: 'UI设计',
      description: '界面原型设计',
      time: '2024-01-20',
      status: 'finish' as StepStatus,
    },
    {
      title: '前端开发',
      description: '正在开发中...',
      time: '2024-01-25',
      status: 'process' as StepStatus,
    },
    {
      title: '测试阶段',
      description: '等待开发完成',
    },
    {
      title: '部署上线',
      description: '发布到生产环境',
    },
  ]

  // 审批步骤
  const approvalSteps: StepItem[] = [
    {
      title: '提交申请',
      description: '张三提交',
      time: '09:00',
    },
    {
      title: '主管审批',
      description: '李四已批准',
      time: '10:30',
    },
    {
      title: '经理审批',
      description: '王五已批准',
      time: '14:20',
    },
    {
      title: 'HR备案',
      description: '处理中',
      status: 'process' as StepStatus,
    },
    {
      title: '完成',
      description: '等待备案',
    },
  ]

  // 图标步骤
  const iconSteps: StepItem[] = [
    {
      title: '创建项目',
      icon: 'i-mdi:folder-plus-outline',
    },
    {
      title: '开发功能',
      icon: 'i-mdi:code-braces',
    },
    {
      title: '代码审查',
      icon: 'i-mdi:account-search-outline',
    },
    {
      title: '测试验收',
      icon: 'i-mdi:clipboard-check-outline',
    },
    {
      title: '部署发布',
      icon: 'i-mdi:rocket-launch-outline',
    },
  ]

  // 错误步骤
  const errorSteps: StepItem[] = [
    {
      title: '创建订单',
      description: '订单创建成功',
      status: 'finish' as StepStatus,
    },
    {
      title: '支付订单',
      description: '支付失败',
      status: 'error' as StepStatus,
    },
    {
      title: '重新支付',
      description: '等待支付',
      status: 'process' as StepStatus,
    },
    {
      title: '订单完成',
      description: '等待处理',
    },
  ]

  // 注册流程
  const registerSteps: StepItem[] = [
    {
      title: '填写信息',
      icon: 'i-mdi:form-textbox',
      detail:
        '请填写您的基本信息，包括用户名、邮箱和密码。所有带 * 的字段都是必填项。',
    },
    {
      title: '验证邮箱',
      icon: 'i-mdi:email-check-outline',
      detail:
        '我们已经发送了一封验证邮件到您的邮箱，请点击邮件中的链接完成验证。',
    },
    {
      title: '完善资料',
      icon: 'i-mdi:account-details-outline',
      detail: '请完善您的个人资料，这将帮助我们为您提供更好的服务。',
    },
    {
      title: '注册成功',
      icon: 'i-mdi:check-circle-outline',
      detail: '恭喜！您已经成功注册，现在可以开始使用我们的服务了。',
    },
  ]

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
