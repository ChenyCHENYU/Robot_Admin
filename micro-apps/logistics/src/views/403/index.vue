<!--
 * @Description: 403 无权限页面
 * @Author: ChenYu
 * @Date: 2025-12-25
-->
<template>
  <div class="error-page">
    <NResult
      status="403"
      title="403 无权限访问"
      description="抱歉，您没有权限访问此页面"
    >
      <template #footer>
        <NButton @click="goBack"> 返回上一页 </NButton>
        <NButton
          type="primary"
          @click="goHome"
        >
          返回首页
        </NButton>
      </template>
    </NResult>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const goBack = () => {
    router.back()
  }

  const goHome = () => {
    router.push('/')
  }
</script>

<style scoped lang="scss">
  .error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;

    :deep(.n-result) {
      .n-result-footer {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }
</style>
