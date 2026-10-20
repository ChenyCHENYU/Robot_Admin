/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @Description: 围绕订单履约的流程、数据模型与类图示例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  DiagramType,
  DiagramData,
  ERField,
} from '@robot-admin/naive-ui-components/C_AntV'
export const DIAGRAM_TYPES = [
  {
    value: 'bpmn',
    label: '业务流程',
    note: '订单审核 → 分支处理 → 交付',
    icon: 'mdi:source-branch',
  },
  {
    value: 'er',
    label: '数据模型',
    note: '客户 → 订单 → 订单明细',
    icon: 'mdi:database-outline',
  },
  {
    value: 'uml',
    label: '类图',
    note: '订单与明细之间的职责和关系',
    icon: 'mdi:vector-square',
  },
] as const
/** 字段约束统一生成，外键必须指向真实的示例表。 */
const field = (
  name: string,
  type: string,
  key: 'primary' | 'foreign' | '' = '',
  foreignKey?: string
): ERField => ({
  name,
  type,
  isPrimaryKey: key === 'primary',
  isForeignKey: key === 'foreign',
  isRequired: true,
  ...(foreignKey ? { foreignKey } : {}),
})
/** 每次返回独立示例，场景间不共享修改。 */
export function createDiagramData(type: DiagramType): DiagramData {
  if (type === 'er')
    return {
      tables: [
        {
          id: 'customer',
          name: '客户',
          comment: '下单主体',
          position: { x: 60, y: 120 },
          fields: [
            field('id', 'BIGINT', 'primary'),
            field('name', 'VARCHAR(80)'),
            field('email', 'VARCHAR(120)'),
          ],
        },
        {
          id: 'order',
          name: '订单',
          comment: '客户的业务订单',
          position: { x: 420, y: 120 },
          fields: [
            field('id', 'BIGINT', 'primary'),
            field('customer_id', 'BIGINT', 'foreign', 'customer.id'),
            field('status', 'VARCHAR(20)'),
            field('amount', 'DECIMAL(12,2)'),
          ],
        },
        {
          id: 'order_item',
          name: '订单明细',
          comment: '订单内的商品与数量',
          position: { x: 780, y: 120 },
          fields: [
            field('id', 'BIGINT', 'primary'),
            field('order_id', 'BIGINT', 'foreign', 'order.id'),
            field('product', 'VARCHAR(100)'),
            field('quantity', 'INT'),
          ],
        },
      ],
      relations: [
        {
          id: 'customer-orders',
          type: 'one-to-many',
          sourceTable: 'customer',
          sourceField: 'id',
          targetTable: 'order',
          targetField: 'customer_id',
          name: '拥有多个订单',
        },
        {
          id: 'order-items',
          type: 'one-to-many',
          sourceTable: 'order',
          sourceField: 'id',
          targetTable: 'order_item',
          targetField: 'order_id',
          name: '包含多个明细',
        },
      ],
    }
  if (type === 'uml')
    return {
      classes: [
        {
          id: 'order',
          name: 'Order',
          position: { x: 60, y: 140 },
          attributes: [
            { name: 'id', type: 'Long', visibility: 'private' },
            { name: 'status', type: 'OrderStatus', visibility: 'private' },
          ],
          methods: [
            { name: 'submit', returnType: 'void', visibility: 'public' },
            { name: 'total', returnType: 'Decimal', visibility: 'public' },
          ],
        },
        {
          id: 'item',
          name: 'OrderItem',
          position: { x: 410, y: 140 },
          attributes: [
            { name: 'quantity', type: 'Integer', visibility: 'private' },
            { name: 'price', type: 'Decimal', visibility: 'private' },
          ],
          methods: [
            { name: 'subtotal', returnType: 'Decimal', visibility: 'public' },
          ],
        },
        {
          id: 'product',
          name: 'Product',
          position: { x: 760, y: 140 },
          attributes: [
            { name: 'name', type: 'String', visibility: 'private' },
            { name: 'sku', type: 'String', visibility: 'private' },
          ],
          methods: [
            { name: 'available', returnType: 'Boolean', visibility: 'public' },
          ],
        },
      ],
      relations: [
        {
          id: 'order-items',
          type: 'composition',
          source: 'order',
          target: 'item',
          name: '包含',
          multiplicity: '1..*',
        },
        {
          id: 'item-product',
          type: 'association',
          source: 'item',
          target: 'product',
          name: '对应商品',
          multiplicity: '1',
        },
      ],
    }
  return {
    nodes: [
      {
        id: 'start',
        type: 'start',
        name: '提交订单',
        position: { x: 60, y: 190 },
        properties: {},
      },
      {
        id: 'review',
        type: 'task',
        name: '审核订单',
        position: { x: 240, y: 170 },
        properties: { assignee: '运营专员', description: '核对订单信息与库存' },
      },
      {
        id: 'decision',
        type: 'gateway',
        name: '审核',
        position: { x: 470, y: 180 },
        properties: {},
      },
      {
        id: 'deliver',
        type: 'task',
        name: '安排交付',
        position: { x: 660, y: 60 },
        properties: {
          assignee: '交付专员',
          description: '确认交付计划并安排发货',
        },
      },
      {
        id: 'revise',
        type: 'task',
        name: '补充资料',
        position: { x: 660, y: 300 },
        properties: {
          assignee: '客户经理',
          description: '补充缺少的信息后再次提交',
        },
      },
      {
        id: 'end',
        type: 'end',
        name: '订单完成',
        position: { x: 920, y: 80 },
        properties: {},
      },
    ],
    flows: [
      { id: 'submit-review', source: 'start', target: 'review', name: '提交' },
      { id: 'review-decision', source: 'review', target: 'decision' },
      { id: 'approved', source: 'decision', target: 'deliver', name: '通过' },
      { id: 'rejected', source: 'decision', target: 'revise', name: '退回' },
      { id: 'recheck', source: 'revise', target: 'review', name: '重新提交' },
      { id: 'delivered', source: 'deliver', target: 'end', name: '交付完成' },
    ],
  }
}
