import { getEmployeesExpandList } from './generated'

/**
 * * @description: 获取员工展开列表接口
 * ! @return {Promise<GetEmployeesExpandListResponse>} 员工展开列表响应数据，包含嵌套的项目/需求/服务信息
 */
export const getEmployeesExpandListApi = (params?: any) =>
  getEmployeesExpandList({ query: params })
