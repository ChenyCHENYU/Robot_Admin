/**
 * @Description: 订单管理数据
 * @Author: Robot Admin
 * @Date: 2025-12-24
 */
import type { DataTableColumns } from 'naive-ui'
import { ref } from 'vue'

export const columns: DataTableColumns = [
  { title: '订单号', key: 'orderNo' },
  { title: '客户名称', key: 'customer' },
  { title: '货物名称', key: 'goods' },
  { title: '数量', key: 'quantity' },
  { title: '状态', key: 'status' },
  { title: '创建时间', key: 'createTime' },
]

export const tableData = ref([
  {
    orderNo: 'LO202412240001',
    customer: '华为技术有限公司',
    goods: '电子元器件',
    quantity: '500箱',
    status: '运输中',
    createTime: '2024-12-24 09:00:00',
  },
  {
    orderNo: 'LO202412240002',
    customer: '小米科技',
    goods: '手机配件',
    quantity: '300箱',
    status: '已签收',
    createTime: '2024-12-24 10:30:00',
  },
  {
    orderNo: 'LO202412240003',
    customer: '比亚迪汽车',
    goods: '汽车零部件',
    quantity: '1000件',
    status: '待发货',
    createTime: '2024-12-24 11:20:00',
  },
])

export const pagination = {
  pageSize: 10,
}
