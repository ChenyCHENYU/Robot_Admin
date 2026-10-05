/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\types\i18n.d.ts
 * @Description: 自动翻译编译协议与原文标记的全局类型
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

declare var $t: typeof import('../utils/d_i18n').translateKey
declare var $changeLang: typeof import('../utils/d_i18n').initializeLanguage
declare var $$t: <T>(value: T) => T
declare var $deepScan: <T>(value: T) => T
declare var $iS: (value: string, args: unknown[]) => string
