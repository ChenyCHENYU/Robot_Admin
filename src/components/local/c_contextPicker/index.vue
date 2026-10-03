<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-02
 * @FilePath: \Robot_Admin\src\components\local\c_contextPicker\index.vue
 * @Description: 企业租户与公司工作上下文选择器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section
    class="context-picker"
    :class="{ 'context-picker--dark': tone === 'dark' }"
  >
    <header class="context-picker__header">
      <span class="context-picker__eyebrow">COMPANY CONTEXT</span>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </header>

    <div
      v-if="contexts.length"
      class="context-picker__list"
    >
      <button
        v-for="context in contexts"
        :key="context.id"
        type="button"
        class="context-picker__option"
        :class="{
          'context-picker__option--active': context.id === activeContextId,
        }"
        :disabled="Boolean(loadingContextId) || context.id === activeContextId"
        :aria-label="`进入 ${context.tenantName} · ${context.companyName}`"
        @click="emit('select', context.id)"
      >
        <span class="context-picker__monogram">{{
          context.companyName.slice(0, 1)
        }}</span>
        <span class="context-picker__details">
          <span class="context-picker__tenant">{{ context.tenantName }}</span>
          <strong>{{ context.companyName }}</strong>
          <span class="context-picker__roles">
            {{
              context.roles.map(role => role.name).join(' · ') || '未配置角色'
            }}
          </span>
          <span
            class="context-picker__affiliation"
            :class="{
              'context-picker__affiliation--primary': context.isPrimary,
            }"
          >
            {{ context.isPrimary ? '主公司' : '兼任' }}
          </span>
        </span>
        <span class="context-picker__end">
          {{
            context.id === activeContextId
              ? '当前'
              : loadingContextId === context.id
                ? '进入中'
                : '进入'
          }}
          <span
            v-if="context.id !== activeContextId"
            class="i-mdi-arrow-top-right"
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
    <div
      v-else
      class="context-picker__empty"
      role="status"
    >
      当前账号没有可进入的公司，请联系企业管理员开通权限。
    </div>
    <slot name="footer" />
  </section>
</template>

<script setup lang="ts">
  import type { AuthContext } from '@/api/auth.contract'

  defineOptions({ name: 'ContextPicker' })

  interface Props {
    contexts: AuthContext[]
    title?: string
    description?: string
    activeContextId?: string
    loadingContextId?: string
    tone?: 'dark' | 'light'
  }

  withDefaults(defineProps<Props>(), {
    title: '切换公司',
    description: '选择已关联的公司，角色和业务数据会随公司切换。',
    activeContextId: '',
    loadingContextId: '',
    tone: 'light',
  })

  const emit = defineEmits<{ select: [contextId: string] }>()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
