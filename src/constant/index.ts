/*
 * @Author: ChenYu
 * @Date: 2022-04-06 01:23:50
 * @LastEditors: Cheny ycyplus@gmail.com
 * @LastEditTime: 2022-12-13 20:13:58
 * @FilePath: \vue3_vite3_elementPlus_admin\src\constant\index.ts
 * @Description: 常量文件夹
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

export const TOKEN: string = 'token'

// token 时间戳
export const TIME_STAMP: string = 'timeStamp'

// * 超时时长：8小时（活跃续期机制）
export const TOKEN_TIMEOUT_VALUE: number = 8 * 3600 * 1000

// * 国际化
export const LANG: string = 'language'

// * 首页地址（默认）
export const HOME_URL: string = '/home'

// * 登录页地址（默认）
export const LOGIN_URL: string = '/login'

// * 默认主题颜色
export const DEFAULT_PRIMARY: string = '#409eff'

// * Tabs（白名单地址，不需要添加到 tabs 的路由地址）
export const TABS_WHITE_LIST: string[] = ['/403', '/404', '/500', LOGIN_URL]

// * 高德地图key
export const MAP_KEY: string = ''

// --- FIXME: 下面变量和 store theme 后面可能弃用 ---
// tags
export const TAGS_VIEW: string = 'tagsView'

// 主题色保存的 key
export const MAIN_COLOR: string = 'mainColor'

// 默认色值
export const DEFAULT_COLOR = '#409eff'
