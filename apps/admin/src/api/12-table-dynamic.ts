import { getEmployeesDynamicList } from './generated'

/**
 * @description: 获取员工动态管理列表接口
 * @param params 查询参数，包含分页和过滤条件
 * @return {Promise<GetEmployeesDynamicListResponse>} 员工动态管理列表响应数据
 */
export const getDynamicEmployeesListApi = (params?: any) =>
  getEmployeesDynamicList({ query: params })
