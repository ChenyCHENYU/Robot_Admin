/**
 * @Description: 仓库管理数据
 * @Author: Robot Admin
 * @Date: 2025-12-24
 */
import { ref } from 'vue'

export const warehouseList = ref([
  {
    id: 1,
    name: '上海中心仓',
    address: '上海市浦东新区张江高科技园区',
    capacity: '50000㎡',
    usage: 75,
    stock: '37500吨',
  },
  {
    id: 2,
    name: '北京物流中心',
    address: '北京市大兴区亦庄经济开发区',
    capacity: '40000㎡',
    usage: 62,
    stock: '24800吨',
  },
  {
    id: 3,
    name: '深圳南山仓',
    address: '深圳市南山区科技园',
    capacity: '30000㎡',
    usage: 88,
    stock: '26400吨',
  },
  {
    id: 4,
    name: '广州白云仓',
    address: '广州市白云区空港经济区',
    capacity: '35000㎡',
    usage: 54,
    stock: '18900吨',
  },
])
