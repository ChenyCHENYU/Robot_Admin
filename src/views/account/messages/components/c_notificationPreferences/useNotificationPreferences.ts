/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息中心 useNotificationPreferences 交互控制器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { NotificationPreferences } from '@/api/notifications.contract'
import { s_notificationStore } from '@/stores/notification'
import { CATEGORY_OPTIONS, CHANNEL_OPTIONS } from '../../data'

/** 管理当前视图的独立加载、命令与生命周期。 */
export function useNotificationPreferences() {
  const store = s_notificationStore()
  const message = useMessage()
  const draft = ref<NotificationPreferences>(
    structuredClone(toRaw(store.preferences))
  )
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  let generation = 0

  /** 放弃尚未保存的编辑，恢复 Store 中最近确认的偏好。 */
  const restore = (): void => {
    draft.value = structuredClone(toRaw(store.preferences))
  }
  /** 独立获取偏好，身份切换或卸载后丢弃旧结果。 */
  const load = async (): Promise<void> => {
    const version = ++generation
    if (!store.scopeKey || !store.capabilities.preferences) return
    loading.value = true
    error.value = ''
    try {
      await store.getPreferences()
      if (version === generation) restore()
    } catch (cause) {
      if (version === generation)
        error.value = cause instanceof Error ? cause.message : '偏好加载失败'
    } finally {
      if (version === generation) loading.value = false
    }
  }
  /** 保存完整快照，并以领域服务返回的确认值回填。 */
  const save = async (): Promise<void> => {
    if (saving.value || loading.value) return
    if (
      draft.value.quietHours.enabled &&
      draft.value.quietHours.start === draft.value.quietHours.end
    ) {
      message.warning('免打扰开始与结束时间不能相同')
      return
    }
    saving.value = true
    try {
      await store.savePreferences(structuredClone(toRaw(draft.value)))
      restore()
      message.success('通知偏好已保存')
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : '保存失败，请重试')
    } finally {
      saving.value = false
    }
  }
  watch(() => [store.scopeKey, store.capabilities.preferences], load, {
    immediate: true,
  })
  onBeforeUnmount(() => {
    generation++
  })
  return {
    store,
    draft,
    loading,
    saving,
    error,
    restore,
    load,
    save,
    CATEGORY_OPTIONS,
    CHANNEL_OPTIONS,
  }
}
