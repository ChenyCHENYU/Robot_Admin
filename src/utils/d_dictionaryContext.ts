/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\utils\d_dictionaryContext.ts
 * @Description: 应用字典实例与注入边界，不引入路由、用户 Store 或启动副作用
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { InjectionKey } from 'vue'
import { createDictionaryStore } from '@robot-admin/dictionary'
import { APP_DICTIONARIES } from '@/config/dictionaries'

/** 由宿主提供认证判断，工厂不读取隐式的全局 Pinia 或路由实例。 */
export const createAppDictionaries = (canLoadRemote = () => true) =>
  createDictionaryStore({
    ...APP_DICTIONARIES,
    'user-status': {
      load: (context: { signal: AbortSignal }) =>
        canLoadRemote()
          ? APP_DICTIONARIES['user-status'].load(context)
          : Promise.resolve([]),
    },
  })
type AppDictionaries = ReturnType<typeof createAppDictionaries>
export const APP_DICTIONARY_KEY: InjectionKey<AppDictionaries> =
  Symbol('app-dictionaries')

/** 页面可用局部 Provider 覆盖个别名称，全局实例保持独立。 */
export const useAppDictionaries = (): AppDictionaries => {
  const dictionaries = inject(APP_DICTIONARY_KEY)
  if (!dictionaries) throw new Error('请在应用启动时安装字典实例')
  return dictionaries
}
