/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\24-debounce-direct\\useDebounceDemo.ts
 * @Description: 防抖案例的交互状态和模拟提交生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { DEMO_CONFIG } from './data'

/** 保留每个防抖案例的计数，并清理表单提交及反馈计时器。 */
export function useDebounceDemo() {
  const tabs = reactive({ code: 'basic', scenario: 'submit' })
  const basic = reactive({ custom: 0, default: 0, normal: 0 })
  const config = reactive({ slow: 0, immediate: 0, executed: 0, canceled: 0 })
  const dynamic = reactive({
    enabled: true,
    delay: 500,
    immediate: false,
    executed: 0,
    canceled: 0,
  })
  const actions = reactive({ deleted: 0, saved: 0, refreshed: 0 })
  const form = reactive({
    model: { username: '', email: '' },
    count: 0,
    loading: false,
    success: false,
    buttonKey: 0,
    submit,
    reset,
  })
  let timer: ReturnType<typeof setTimeout> | undefined

  /** 重置按钮实例，取消指令尚未触发的防抖提交，同时撤销模拟请求。 */
  function cancelSubmission() {
    clearTimeout(timer)
    form.loading = false
    form.success = false
    form.buttonKey++
  }

  /** 开始一次本地模拟提交。 */
  function submit() {
    if (form.loading) return
    clearTimeout(timer)
    form.count++
    form.loading = true
    form.success = false
    timer = setTimeout(() => {
      form.loading = false
      form.success = true
      timer = setTimeout(() => {
        form.success = false
      }, DEMO_CONFIG.SUCCESS_DISPLAY_DURATION)
    }, DEMO_CONFIG.SUBMIT_RESPONSE_DELAY)
  }

  /** 清空字段与当前提交反馈。 */
  function reset() {
    cancelSubmission()
    form.model = { username: '', email: '' }
  }

  watch(() => tabs.scenario, cancelSubmission)
  onDeactivated(cancelSubmission)
  onScopeDispose(cancelSubmission)

  return { tabs, basic, config, dynamic, form, actions }
}
