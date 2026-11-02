/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-02
 * @FilePath: \Robot_Admin\src\config\dictionary.ts
 * @Description: 应用统一字典配置，远程原码共用接口，稳定枚举按需覆盖
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { getDictionaryOptionsApi } from '@/api/dictionary-options'
import { ORDER_STATUS_OPTIONS } from './enums'

export default {
  load: getDictionaryOptionsApi,
  dictionaries: { 'order-status': ORDER_STATUS_OPTIONS },
}
