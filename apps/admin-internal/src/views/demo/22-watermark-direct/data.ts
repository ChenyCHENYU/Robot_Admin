/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 19:24:10
 * @FilePath: \Robot_Admin\src\views\demo\22-watermark-direct\data.ts
 * @Description: 水印指令演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description 基础用法代码示例
 * ! @return 基础用法的代码字符串
 */
export function getBasicCode(): string {
  return `<!-- 基础文本水印 -->
<div v-watermark="'版权所有'"> 
  <p>这是一段内容</p>
</div>

<!-- 使用默认水印 -->
<div v-watermark>
  <p>使用默认Robot Admin文本</p>
</div>

<!-- 简单配置 -->
<div v-watermark="{
  text: '机密文档',
  textColor: 'rgba(255, 0, 0, 0.3)'
}">
  <p>重要内容区域</p>
</div>`
}

/**
 * * @description 样式配置代码示例
 * ! @return 样式配置的代码字符串
 */
export function getStyleCode(): string {
  return `<!-- 自定义字体和大小 -->
<div v-watermark="{
  text: '内部资料',
  fontSize: 20,
  font: 'Arial',
  textColor: 'rgba(0, 123, 255, 0.4)'
}">
  <p>内容区域</p>
</div>

<!-- 调整间距和旋转角度 -->
<div v-watermark="{
  text: 'CONFIDENTIAL',
  textXGap: 180,
  textYGap: 90,
  rotate: -45,
  opacity: 0.8
}">
  <p>机密内容</p>
</div>`
}

/**
 * * @description 高级配置代码示例
 * ! @return 高级配置的代码字符串
 */
export function getAdvancedCode(): string {
  const scriptStart = '<script setup>'
  const scriptEnd = '</' + 'script>'

  return `${scriptStart}
// 动态水印文本
const watermarkText = ref('动态水印')
const showWatermark = ref(true)

// 回调函数
const handleWatermarkUpdate = (el) => {
  console.log('水印更新:', el)
}

const handleWatermarkError = (error) => {
  console.error('水印错误:', error)
}
${scriptEnd}

<!-- 动态水印 -->
<div v-watermark="{
  text: watermarkText,
  onUpdate: handleWatermarkUpdate,
  onError: handleWatermarkError
}">
  <p>动态内容</p>
</div>

<!-- 条件水印 -->
<div v-if="showWatermark" v-watermark="'条件显示'">
  <p>条件内容</p>
</div>`
}

/**
 * * @description 场景示例代码
 * ! @return 场景示例的代码字符串
 */
export function getScenarioCode(): string {
  return `<!-- 文档场景 -->
<div v-watermark="{
  text: '草稿',
  textColor: 'rgba(255, 165, 0, 0.3)',
  fontSize: 18
}" class="document">
  <h3>文档标题</h3>
  <p>文档内容...</p>
</div>

<!-- 图片预览场景 -->
<div v-watermark="{
  text: '仅供预览',
  textColor: 'rgba(255, 255, 255, 0.7)',
  fontSize: 24,
  rotate: 45,
  textXGap: 220,
  textYGap: 120
}" class="image-preview">
  <img src="/api/placeholder/400/300" alt="预览图片" />
</div>

<!-- 表格数据场景 -->
<div v-watermark="{
  text: '内部数据',
  textColor: 'rgba(220, 20, 60, 0.25)',
  fontSize: 14
}" class="data-table">
  <NDataTable :data="tableData" :columns="columns" />
</div>`
}

/**
 * * @description 表格数据
 */
export const tableData = [
  {
    id: 1,
    name: '张三',
    department: '技术部',
    salary: '15000',
    status: '在职',
  },
  {
    id: 2,
    name: '李四',
    department: '市场部',
    salary: '12000',
    status: '在职',
  },
  {
    id: 3,
    name: '王五',
    department: '财务部',
    salary: '13000',
    status: '在职',
  },
]

/**
 * * @description 表格列配置
 */
export const tableColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '姓名', key: 'name' },
  { title: '部门', key: 'department' },
  { title: '薪资', key: 'salary' },
  { title: '状态', key: 'status' },
]
