/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\d_context.ts
 * @Description: 应用设置抽屉的类型化布局上下文
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { InjectionKey, Ref } from 'vue'

export const SETTINGS_DRAWER_KEY: InjectionKey<{ showSettings: Ref<boolean> }> =
  Symbol('robot-admin:settings-drawer')
