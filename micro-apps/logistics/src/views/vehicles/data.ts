/**
 * @Description: 车辆调度数据
 * @Author: Robot Admin
 * @Date: 2025-12-24
 */
import { ref } from 'vue'

export const vehicleList = ref([
  {
    id: 1,
    plateNumber: '京A·12345',
    driver: '张师傅',
    type: '重型货车',
    status: 'online',
    statusText: '在线',
    location: '北京市朝阳区',
  },
  {
    id: 2,
    plateNumber: '沪B·67890',
    driver: '李师傅',
    type: '中型货车',
    status: 'online',
    statusText: '在线',
    location: '上海市浦东新区',
  },
  {
    id: 3,
    plateNumber: '粤C·24680',
    driver: '王师傅',
    type: '重型货车',
    status: 'offline',
    statusText: '离线',
    location: '深圳市南山区',
  },
  {
    id: 4,
    plateNumber: '浙D·13579',
    driver: '赵师傅',
    type: '轻型货车',
    status: 'online',
    statusText: '在线',
    location: '杭州市西湖区',
  },
  {
    id: 5,
    plateNumber: '川E·98765',
    driver: '刘师傅',
    type: '中型货车',
    status: 'online',
    statusText: '在线',
    location: '成都市高新区',
  },
  {
    id: 6,
    plateNumber: '鄂F·54321',
    driver: '陈师傅',
    type: '重型货车',
    status: 'offline',
    statusText: '离线',
    location: '武汉市江汉区',
  },
])
