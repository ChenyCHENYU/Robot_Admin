/**
 * C_Header 组件数据配置
 */

// 系统项接口
export interface SystemItem {
  id: string
  name: string
  icon: string
  isGroup?: boolean
  parent?: string
}

// 系统列表配置
export const systemList: SystemItem[] = [
  { id: 'favorite', name: '我的收藏', icon: 'i-ri:star-line', isGroup: false },
  { id: 'my-systems', name: '我的系统', icon: 'i-ri:apps-line', isGroup: true },
  {
    id: 'base-platform',
    name: '基础平台系统管理',
    icon: 'i-ri:dashboard-line',
    parent: 'my-systems',
  },
  {
    id: 'robot-admin',
    name: 'Robot Admin 框架系统',
    icon: 'i-ri:robot-line',
    parent: 'my-systems',
  },
  {
    id: 'logistics',
    name: '智慧物流管理系统',
    icon: 'i-ri:truck-line',
    parent: 'my-systems',
  },
  {
    id: 'procurement',
    name: '大宗采购管理系统',
    icon: 'i-ri:shopping-cart-line',
    parent: 'my-systems',
  },
  {
    id: 'sales',
    name: '销售管理系统',
    icon: 'i-ri:line-chart-line',
    parent: 'my-systems',
  },
  {
    id: 'cost',
    name: '日清月结智慧成本管理系统',
    icon: 'i-ri:money-dollar-circle-line',
    parent: 'my-systems',
  },
  {
    id: 'warehouse',
    name: '仓储管理系统',
    icon: 'i-ri:archive-line',
    parent: 'my-systems',
  },
  {
    id: 'performance',
    name: '即时绩效管理系统',
    icon: 'i-ri:bar-chart-box-line',
    parent: 'my-systems',
  },
  {
    id: 'energy',
    name: '能源安环管理系统',
    icon: 'i-ri:leaf-line',
    parent: 'my-systems',
  },
  {
    id: 'equipment',
    name: '设备管理系统',
    icon: 'i-ri:settings-4-line',
    parent: 'my-systems',
  },
]

// 菜单项接口
export interface MenuItem {
  name: string
  path: string
  icon?: string
  isGroup?: boolean
  isSubGroup?: boolean
  isLeaf?: boolean
  children?: MenuItem[]
}

// 菜单组接口
export interface MenuGroup {
  title: string
  items: MenuItem[]
}

// 系统菜单接口
export interface SystemMenu {
  id: string
  name: string
  icon: string
  menuGroups: MenuGroup[]
}

// 模拟其他系统的菜单数据
export const mockSystemMenus: Record<string, SystemMenu> = {
  'base-platform': {
    id: 'base-platform',
    name: '基础平台系统管理',
    icon: 'i-ri:dashboard-line',
    menuGroups: [
      {
        title: '系统管理',
        items: [
          { name: '用户管理', path: '/platform/users', icon: 'i-ri:user-line' },
          {
            name: '角色管理',
            path: '/platform/roles',
            icon: 'i-ri:admin-line',
          },
          {
            name: '权限管理',
            path: '/platform/permissions',
            icon: 'i-ri:lock-line',
          },
          { name: '菜单管理', path: '/platform/menus', icon: 'i-ri:menu-line' },
        ],
      },
      {
        title: '组织架构',
        items: [
          {
            name: '部门管理',
            path: '/platform/departments',
            icon: 'i-ri:building-2-line',
          },
          {
            name: '岗位管理',
            path: '/platform/positions',
            icon: 'i-ri:briefcase-line',
          },
          {
            name: '员工管理',
            path: '/platform/employees',
            icon: 'i-ri:group-line',
          },
        ],
      },
      {
        title: '系统配置',
        items: [
          {
            name: '字典管理',
            path: '/platform/dictionary',
            icon: 'i-ri:book-line',
          },
          {
            name: '参数配置',
            path: '/platform/config',
            icon: 'i-ri:settings-3-line',
          },
          {
            name: '日志管理',
            path: '/platform/logs',
            icon: 'i-ri:file-list-2-line',
          },
        ],
      },
    ],
  },
  logistics: {
    id: 'logistics',
    name: '智慧物流管理系统',
    icon: 'i-ri:truck-line',
    menuGroups: [
      {
        title: '运输管理',
        items: [
          {
            name: '运单管理',
            path: '/logistics/orders',
            icon: 'i-ri:file-list-line',
          },
          {
            name: '车辆调度',
            path: '/logistics/dispatch',
            icon: 'i-ri:truck-line',
          },
          {
            name: '路线规划',
            path: '/logistics/routes',
            icon: 'i-ri:map-pin-line',
          },
          {
            name: '司机管理',
            path: '/logistics/drivers',
            icon: 'i-ri:user-line',
          },
        ],
      },
      {
        title: '仓储管理',
        items: [
          {
            name: '入库管理',
            path: '/logistics/inbound',
            icon: 'i-ri:inbox-line',
          },
          {
            name: '出库管理',
            path: '/logistics/outbound',
            icon: 'i-ri:share-box-line',
          },
          {
            name: '库存查询',
            path: '/logistics/inventory',
            icon: 'i-ri:stack-line',
          },
          {
            name: '盘点管理',
            path: '/logistics/stocktaking',
            icon: 'i-ri:file-search-line',
          },
        ],
      },
      {
        title: '数据分析',
        items: [
          {
            name: '运输报表',
            path: '/logistics/transport-report',
            icon: 'i-ri:bar-chart-line',
          },
          {
            name: '库存报表',
            path: '/logistics/inventory-report',
            icon: 'i-ri:pie-chart-line',
          },
        ],
      },
    ],
  },
  procurement: {
    id: 'procurement',
    name: '大宗采购管理系统',
    icon: 'i-ri:shopping-cart-line',
    menuGroups: [
      {
        title: '采购业务',
        items: [
          {
            name: '采购申请',
            path: '/procurement/request',
            icon: 'i-ri:file-add-line',
          },
          {
            name: '采购订单',
            path: '/procurement/orders',
            icon: 'i-ri:shopping-bag-line',
          },
          {
            name: '供应商管理',
            path: '/procurement/suppliers',
            icon: 'i-ri:building-line',
          },
          {
            name: '询价管理',
            path: '/procurement/inquiry',
            icon: 'i-ri:question-line',
          },
        ],
      },
      {
        title: '合同管理',
        items: [
          {
            name: '合同列表',
            path: '/procurement/contracts',
            icon: 'i-ri:file-text-line',
          },
          {
            name: '合同审批',
            path: '/procurement/approval',
            icon: 'i-ri:checkbox-line',
          },
          {
            name: '合同归档',
            path: '/procurement/archive',
            icon: 'i-ri:folder-line',
          },
        ],
      },
      {
        title: '财务管理',
        items: [
          {
            name: '付款申请',
            path: '/procurement/payment',
            icon: 'i-ri:wallet-line',
          },
          {
            name: '发票管理',
            path: '/procurement/invoice',
            icon: 'i-ri:bill-line',
          },
        ],
      },
    ],
  },
  sales: {
    id: 'sales',
    name: '销售管理系统',
    icon: 'i-ri:line-chart-line',
    menuGroups: [
      {
        title: '销售业务',
        items: [
          {
            name: '销售订单',
            path: '/sales/orders',
            icon: 'i-ri:file-list-3-line',
          },
          {
            name: '客户管理',
            path: '/sales/customers',
            icon: 'i-ri:user-star-line',
          },
          {
            name: '商机管理',
            path: '/sales/opportunities',
            icon: 'i-ri:lightbulb-line',
          },
          {
            name: '报价管理',
            path: '/sales/quotation',
            icon: 'i-ri:money-dollar-box-line',
          },
        ],
      },
      {
        title: '销售分析',
        items: [
          {
            name: '销售报表',
            path: '/sales/reports',
            icon: 'i-ri:bar-chart-line',
          },
          {
            name: '业绩统计',
            path: '/sales/performance',
            icon: 'i-ri:trophy-line',
          },
          {
            name: '销售预测',
            path: '/sales/forecast',
            icon: 'i-ri:stock-line',
          },
        ],
      },
    ],
  },
  cost: {
    id: 'cost',
    name: '日清月结智慧成本管理系统',
    icon: 'i-ri:money-dollar-circle-line',
    menuGroups: [
      {
        title: '成本核算',
        items: [
          { name: '日清核算', path: '/cost/daily', icon: 'i-ri:calendar-line' },
          {
            name: '月度结算',
            path: '/cost/monthly',
            icon: 'i-ri:calendar-check-line',
          },
          {
            name: '成本分摊',
            path: '/cost/allocation',
            icon: 'i-ri:pie-chart-2-line',
          },
          {
            name: '成本分析',
            path: '/cost/analysis',
            icon: 'i-ri:line-chart-line',
          },
        ],
      },
      {
        title: '预算管理',
        items: [
          {
            name: '预算编制',
            path: '/cost/budget-plan',
            icon: 'i-ri:file-edit-line',
          },
          {
            name: '预算执行',
            path: '/cost/budget-exec',
            icon: 'i-ri:checkbox-circle-line',
          },
          {
            name: '预算对比',
            path: '/cost/budget-compare',
            icon: 'i-ri:contrast-line',
          },
        ],
      },
      {
        title: '报表中心',
        items: [
          {
            name: '成本报表',
            path: '/cost/report',
            icon: 'i-ri:file-chart-line',
          },
          {
            name: '趋势分析',
            path: '/cost/trend',
            icon: 'i-ri:arrow-up-down-line',
          },
        ],
      },
    ],
  },
  warehouse: {
    id: 'warehouse',
    name: '仓储管理系统',
    icon: 'i-ri:archive-line',
    menuGroups: [
      {
        title: '库存管理',
        items: [
          {
            name: '库存总览',
            path: '/warehouse/overview',
            icon: 'i-ri:dashboard-line',
          },
          {
            name: '货位管理',
            path: '/warehouse/locations',
            icon: 'i-ri:grid-line',
          },
          {
            name: '盘点管理',
            path: '/warehouse/stocktaking',
            icon: 'i-ri:file-search-line',
          },
          {
            name: '库存预警',
            path: '/warehouse/alert',
            icon: 'i-ri:alarm-warning-line',
          },
        ],
      },
      {
        title: '出入库',
        items: [
          {
            name: '入库单',
            path: '/warehouse/inbound',
            icon: 'i-ri:inbox-line',
          },
          {
            name: '出库单',
            path: '/warehouse/outbound',
            icon: 'i-ri:send-plane-line',
          },
          {
            name: '调拨单',
            path: '/warehouse/transfer',
            icon: 'i-ri:arrow-left-right-line',
          },
        ],
      },
      {
        title: '质量管理',
        items: [
          {
            name: '质检管理',
            path: '/warehouse/quality',
            icon: 'i-ri:shield-check-line',
          },
          {
            name: '不合格品',
            path: '/warehouse/defective',
            icon: 'i-ri:close-circle-line',
          },
        ],
      },
    ],
  },
  performance: {
    id: 'performance',
    name: '即时绩效管理系统',
    icon: 'i-ri:bar-chart-box-line',
    menuGroups: [
      {
        title: '绩效考核',
        items: [
          {
            name: '考核方案',
            path: '/performance/plan',
            icon: 'i-ri:file-list-line',
          },
          {
            name: '绩效评分',
            path: '/performance/score',
            icon: 'i-ri:star-line',
          },
          {
            name: '考核结果',
            path: '/performance/result',
            icon: 'i-ri:medal-line',
          },
          {
            name: '绩效申诉',
            path: '/performance/appeal',
            icon: 'i-ri:question-answer-line',
          },
        ],
      },
      {
        title: '目标管理',
        items: [
          {
            name: '目标设定',
            path: '/performance/objective',
            icon: 'i-ri:flag-line',
          },
          {
            name: '进度跟踪',
            path: '/performance/progress',
            icon: 'i-ri:time-line',
          },
          {
            name: 'OKR管理',
            path: '/performance/okr',
            icon: 'i-ri:focus-line',
          },
        ],
      },
      {
        title: '数据分析',
        items: [
          {
            name: '绩效报表',
            path: '/performance/report',
            icon: 'i-ri:bar-chart-line',
          },
          {
            name: '排名统计',
            path: '/performance/ranking',
            icon: 'i-ri:trophy-line',
          },
        ],
      },
    ],
  },
  energy: {
    id: 'energy',
    name: '能源安环管理系统',
    icon: 'i-ri:leaf-line',
    menuGroups: [
      {
        title: '能源管理',
        items: [
          {
            name: '能耗监测',
            path: '/energy/monitor',
            icon: 'i-ri:dashboard-2-line',
          },
          {
            name: '用电管理',
            path: '/energy/electricity',
            icon: 'i-ri:flashlight-line',
          },
          { name: '用水管理', path: '/energy/water', icon: 'i-ri:drop-line' },
          {
            name: '能耗分析',
            path: '/energy/analysis',
            icon: 'i-ri:line-chart-line',
          },
        ],
      },
      {
        title: '安全管理',
        items: [
          {
            name: '隐患排查',
            path: '/energy/hazard',
            icon: 'i-ri:search-eye-line',
          },
          {
            name: '事故管理',
            path: '/energy/accident',
            icon: 'i-ri:alert-line',
          },
          {
            name: '应急预案',
            path: '/energy/emergency',
            icon: 'i-ri:shield-line',
          },
        ],
      },
      {
        title: '环保管理',
        items: [
          {
            name: '排放监测',
            path: '/energy/emission',
            icon: 'i-ri:cloud-line',
          },
          {
            name: '环保报表',
            path: '/energy/env-report',
            icon: 'i-ri:file-chart-line',
          },
        ],
      },
    ],
  },
  equipment: {
    id: 'equipment',
    name: '设备管理系统',
    icon: 'i-ri:settings-4-line',
    menuGroups: [
      {
        title: '设备台账',
        items: [
          {
            name: '设备档案',
            path: '/equipment/archive',
            icon: 'i-ri:file-info-line',
          },
          {
            name: '设备分类',
            path: '/equipment/category',
            icon: 'i-ri:folder-line',
          },
          {
            name: '设备台账',
            path: '/equipment/ledger',
            icon: 'i-ri:book-open-line',
          },
        ],
      },
      {
        title: '维保管理',
        items: [
          {
            name: '保养计划',
            path: '/equipment/maintenance',
            icon: 'i-ri:calendar-check-line',
          },
          {
            name: '维修工单',
            path: '/equipment/repair',
            icon: 'i-ri:tools-line',
          },
          {
            name: '巡检记录',
            path: '/equipment/inspection',
            icon: 'i-ri:walk-line',
          },
          {
            name: '备件管理',
            path: '/equipment/spare-parts',
            icon: 'i-ri:box-3-line',
          },
        ],
      },
      {
        title: '设备监控',
        items: [
          {
            name: '运行监控',
            path: '/equipment/monitor',
            icon: 'i-ri:tv-line',
          },
          {
            name: '故障预警',
            path: '/equipment/warning',
            icon: 'i-ri:alarm-warning-line',
          },
          {
            name: '设备报表',
            path: '/equipment/report',
            icon: 'i-ri:file-chart-line',
          },
        ],
      },
    ],
  },
}
