/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 19:50:57
 * @FilePath: \Robot_Admin\src\main.ts
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createDiscreteApi } from 'naive-ui'

import App from './App.vue'
import router from './router'

import 'virtual:uno.css'

const { notification } = createDiscreteApi(['notification'])

const app = createApp(App)

app.use(createPinia()).use(router)

app.provide('notification', notification)

app.mount('#app')
