/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\error-page\components\c_errorPage\useErrorPage.ts
 * @Description: 异常页倒计时与导航清理，兼容 KeepAlive
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { ref, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { LOGIN_URL } from '@/constant'

/** 退出或缓存页面时停止倒计时，避免后台异常页改变当前路由。 */
export function useErrorPage() {
  const router = useRouter()
  const countdown = ref(5)
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
  }
  const goHome = () => {
    stop()
    return router.push('/')
  }
  const goLogin = () => {
    stop()
    return router.push(LOGIN_URL)
  }
  const goBack = () => {
    stop()
    router.back()
  }
  const refresh = () => {
    stop()
    window.location.reload()
  }
  const start = () => {
    if (timer !== undefined) return
    countdown.value = 5
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) void goHome()
    }, 1000)
  }

  onMounted(start)
  onActivated(start)
  onDeactivated(stop)
  onUnmounted(stop)
  return { countdown, goHome, goLogin, goBack, refresh }
}
