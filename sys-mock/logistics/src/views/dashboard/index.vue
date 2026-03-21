<!--
 * @Description: 物流仪表盘
 * @Author: Robot Admin
 * @Date: 2025-12-24
-->
<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">物流仪表盘</h1>
      <p class="page-desc">实时监控物流运营数据</p>
    </div>

    <!-- 微前端通信测试区域 -->
    <NCard
      title="🔗 微前端通信测试"
      class="test-card"
    >
      <NSpace
        vertical
        size="large"
      >
        <!-- 显示主应用传递的数据 -->
        <div class="data-section">
          <h3>📥 主应用传递的数据</h3>
          <NSpace vertical>
            <div class="data-item">
              <span class="label">Token:</span>
              <NTag type="success">{{ appStore.token || '未获取' }}</NTag>
            </div>
            <div class="data-item">
              <span class="label">用户信息:</span>
              <NCode
                :code="JSON.stringify(appStore.userInfo, null, 2)"
                language="json"
              />
            </div>
            <div class="data-item">
              <span class="label">主题模式:</span>
              <NTag :type="appStore.theme.isDark ? 'warning' : 'info'">
                {{ appStore.theme.mode }}
              </NTag>
            </div>
          </NSpace>
        </div>

        <!-- 测试向主应用发送消息 -->
        <div class="action-section">
          <h3>📤 测试向主应用发送消息</h3>
          <NSpace>
            <NButton
              type="primary"
              @click="sendTestMessage"
            >
              发送测试消息
            </NButton>
            <NButton
              type="info"
              @click="sendDataUpdate"
            >
              发送数据更新
            </NButton>
            <NButton
              type="warning"
              @click="navigateToHome"
            >
              跳转到主应用首页
            </NButton>
          </NSpace>
        </div>
      </NSpace>
    </NCard>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <NCard
        v-for="stat in statsData"
        :key="stat.title"
        :title="stat.title"
        class="stat-card"
      >
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'DashboardPage',
  })

  import { useAppStore } from '@/stores/app'
  import { sendMessageToMainApp, navigateToMainApp } from '@/microApp'
  import { statsData } from './data'

  const appStore = useAppStore()
  const message = useMessage()

  // 监听主应用的确认消息
  onMounted(() => {
    const handleAck = (event: CustomEvent) => {
      const { type } = event.detail
      if (type === 'message') {
        message.success('✅ 发送成功', { duration: 2000 })
      } else if (type === 'data') {
        message.success('✅ 数据推送成功', { duration: 2000 })
      }
    }
    window.addEventListener('mainAppAck', handleAck as EventListener)

    onUnmounted(() => {
      window.removeEventListener('mainAppAck', handleAck as EventListener)
    })
  })

  // 发送测试消息
  const sendTestMessage = () => {
    sendMessageToMainApp({
      type: 'CUSTOM_MESSAGE',
      payload: {
        message: '这是来自物流子应用的测试消息',
        timestamp: Date.now(),
      },
    })
  }

  // 发送数据更新
  const sendDataUpdate = () => {
    sendMessageToMainApp({
      type: 'DATA_UPDATE',
      payload: {
        module: 'logistics',
        data: {
          orderCount: 1234,
          vehicleCount: 89,
        },
      },
    })
  }

  // 跳转到主应用
  const navigateToHome = () => {
    navigateToMainApp('/home')
    message.info('正在跳转到主应用首页')
  }
</script>

<style lang="scss" scoped src="./index.scss"></style>
