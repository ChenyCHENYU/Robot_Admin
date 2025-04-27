/*
 * @Author: ChenYu
 * @Date: 2022-03-31 09:45:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 21:32:35
 * @FilePath: \Robot_Admin\src\utils\d_tools.ts
 * @Description: 工具函数
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

/** TODO:
 * @description: 将字符串首字母变成大写
 * @param {string} str 接受一个字符串类型的字母
 * @return {*} 返回处理后的单词字符串
 */
export const d_toUperCaseFirstLetter = (str: string): string =>
  str.replace(/( |^)[a-z]/g, L => L.toUpperCase())

// 把驼峰转换成横杠链接
export const d_toLine = (value: string) => {
  return value.replace(/(A-Z)g/, '-$1').toLowerCase()
}

/** TODO:
 * @description:处理文件模块为一个map结构去重后的对象集
 * @param {any} ctx import.meta引入的文件模块
 * @param {string} dir 要处理的文件目录
 * @return {*} 处理后的对象集，便于export导出使用
 */
export const d_indexFileExportAllModule = (
  ctx: unknown,
  dir: string
): object => {
  const arr: unknown[] = []
  const modules: Map<string, unknown> = new Map()

  //  将Module改造成一个map结构，并map对象赋值并二次规避重复
  const _importFn = (module: unknown): void => {
    if (typeof module === 'object' && module !== null) {
      Object.entries(module).forEach(([k, v]) => modules.set(k, v))
    }
  }

  // 将 map 对象变成一个传统的对象
  const _strMapToObj = (strMap: [string, unknown][]): object => {
    const obj = Object.create(null) // 相当于申明了一个空对象{}容器 不继承任何原型 么有__proto__
    for (const [k, v] of strMap) {
      obj[k] = v // 把Map 对象的键值 给obj
    }
    return obj
  }

  // 先将当前index.ts文件给过滤并变成一个数组
  Object.entries(ctx as Record<string, unknown>)
    .filter(([key]) => {
      return key !== `../${dir}/index.ts`
    })
    .forEach(([, value]) => {
      arr.push(value)
    })

  arr.forEach(item => _importFn(item))

  return _strMapToObj([...modules])
}

/**
 * @description: 获取本地图片处理
 * @param {string} name 图片名称
 * @param {*} suffix 图片类型
 * @return {*}
 */
export const d_getImageUrl = (name: string, suffix = '.png') =>
  new URL(`/src/assets/images/${name}${[suffix]}`, import.meta.url).href

/**
 * @description:js中把数字转换成汉字输出
 * 支持9位以上也就是亿级别的，如果需要钱的那种单位，把注释放开就行
 */
export const toChineseBig = (num: unknown) => {
  // 将接收到的num转换为字符串
  const strNum = String(num)
  // 定义单位
  // var unit = ['拾', '佰', '仟', '万', '拾', '佰', '仟', '亿', '拾', '佰', '仟']
  const unit = [
    '十',
    '百',
    '千',
    '万',
    '十',
    '百',
    '千',
    '亿',
    '十',
    '百',
    '千',
  ]
  // 结果中放一个符号，用来解决最后的零去不掉的问题
  const result = ['@']
  // 单位下标
  let unitNo = 0
  // 从后往前遍历接收到的数据，省略结束条件
  for (let i = strNum.length - 1; ; i--) {
    // 调用转大写函数，将每一个数字转换成中文大写，一次放入一个到结果数组中
    result.unshift(numToChinese(strNum[i]))
    // 如果不大于0
    if (i <= 0) {
      // 结束循环
      break
    }
    // 放入一个数字，放入一个单位
    result.unshift(unit[unitNo])
    // 单位下标加1
    unitNo++
  }
  // 将结果数组转换成字符串，并使用正则替换一些关键位置，让结果符合语法
  // return result.join('').replace(/(零[仟佰拾]){1,3}/g, '零').replace(/零{2,}/g, '零').replace(/零([万亿])/g, '$1').replace(/亿万/g, '亿').replace(/零*@/g, '')
  return result
    .join('')
    .replace(/(零[千百十]){1,3}/g, '零')
    .replace(/零{2,}/g, '零')
    .replace(/零([万亿])/g, '$1')
    .replace(/亿万/g, '亿')
    .replace(/零*@/g, '')

  function numToChinese(n: string) {
    // var chineseBigNum = '零壹贰叁肆伍陆柒捌玖'
    const chineseBigNum = '零一二三四五六七八九'
    return chineseBigNum[parseInt(n, 10)]
  }
}
