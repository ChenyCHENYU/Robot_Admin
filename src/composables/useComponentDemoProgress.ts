/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @Description: 保存当前账户及工作空间内已完成的组件演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { s_userStore } from '@/stores/user'

type DemoStep = 'query' | 'edit'

/** 从各演示记录实际完成项，并在首页按当前账户恢复进度。 */
export function useComponentDemoProgress() {
  const userStore = s_userStore()
  const key = computed(() => {
    const userId = userStore.userInfo.id ?? userStore.userInfo.username
    const contextId = userStore.activeContext?.id
    return userId && contextId
      ? `robot-demo-progress:${encodeURIComponent(userId)}:${encodeURIComponent(contextId)}`
      : 'robot-demo-progress:preview'
  })
  const completedIds = useLocalStorage<DemoStep[]>(key, [], {
    writeDefaults: false,
    flush: 'sync',
  })

  const record = (step: DemoStep) => {
    if (
      !userStore.token ||
      !userStore.activeContext?.id ||
      !(userStore.userInfo.id || userStore.userInfo.username) ||
      completedIds.value.includes(step)
    )
      return
    completedIds.value = [...completedIds.value, step]
  }

  return { completedIds, record }
}
