/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\src\utils\d_dictionaryContext.ts
 * @Description: 应用字典实例与注入边界，不引入路由、用户 Store 或启动副作用
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { InjectionKey } from 'vue'
import { createDictionaryStore } from '@robot-admin/dictionary'
import { getDictionaryOptionsApi } from '@/api/dictionary-options'
import { ORDER_STATUS_OPTIONS } from '@/config/enums'

/** 由宿主提供认证判断，工厂不读取隐式的全局 Pinia 或路由实例。 */
export const createAppDictionaries = (canLoadRemote = () => true) =>
  createDictionaryStore(
    {
      'order-status': ORDER_STATUS_OPTIONS,
    },
    {
      // 接口统一接一次；远程字段直接写后端原码，不再维护前端别名清单。
      load: (name, context) =>
        canLoadRemote()
          ? getDictionaryOptionsApi(name, context)
          : Promise.resolve([]),
    }
  )
type AppDictionaries = ReturnType<typeof createAppDictionaries>
export const APP_DICTIONARY_KEY: InjectionKey<AppDictionaries> =
  Symbol('app-dictionaries')

/** 页面可用局部 Provider 覆盖个别名称，全局实例保持独立。 */
export const useAppDictionaries = (): AppDictionaries => {
  const dictionaries = inject(APP_DICTIONARY_KEY)
  if (!dictionaries) throw new Error('请在应用启动时安装字典实例')
  return dictionaries
}
