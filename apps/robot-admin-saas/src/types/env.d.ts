/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:00:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 14:09:17
 * @FilePath: \Robot_Admin\src\types\env.d.ts
 * @Description: 环境变量和模块声明
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/// <reference types="vite/client" />

import type { DefineComponent, App } from 'vue'

// =================== Vite 环境变量扩展 ===================
interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_ROUTER_MODE: 'hash' | 'history'
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_VERSION?: string
  // 可以根据需要添加更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
