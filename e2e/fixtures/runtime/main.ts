/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\main.ts
 * @Description: 使用真实发布包的独立资源回归，不进入产品路由
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { createApp } from 'vue'
import RuntimeFixture from './RuntimeFixture.vue'

createApp(RuntimeFixture).mount('#app')
