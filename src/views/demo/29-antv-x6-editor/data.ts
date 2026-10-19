/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 图编辑工作台的独立场景模板
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  DiagramType,
  DiagramData,
} from '@robot-admin/naive-ui-components/C_AntV'
export const DIAGRAM_TYPES = [
  { value: 'bpmn', label: '业务流程', note: '任务、事件与流程连接' },
  { value: 'er', label: '数据模型', note: '表结构与关联关系' },
  { value: 'uml', label: '类图', note: '属性、方法与类关系' },
] as const
/** 每次返回独立数据，防止场景间共享修改。 */
export function createDiagramData(type: DiagramType): DiagramData | undefined {
  switch (type) {
    case 'er':
      return {
        tables: [
          {
            id: 'user_table',
            name: '用户表',
            comment: '系统用户信息',
            fields: [
              {
                name: 'id',
                type: 'BIGINT',
                isPrimaryKey: true,
                isRequired: true,
                isForeignKey: false,
              },
              {
                name: 'username',
                type: 'VARCHAR(50)',
                isPrimaryKey: false,
                isRequired: true,
                isForeignKey: false,
              },
              {
                name: 'email',
                type: 'VARCHAR(100)',
                isPrimaryKey: false,
                isRequired: true,
                isForeignKey: false,
              },
              {
                name: 'created_at',
                type: 'DATETIME',
                isPrimaryKey: false,
                isRequired: true,
                isForeignKey: false,
              },
            ],
            position: { x: 100, y: 100 },
          },
        ],
        relations: [],
      }
    case 'bpmn':
      return {
        nodes: [
          {
            id: 'start_1',
            type: 'start' as const,
            name: '开始',
            position: { x: 100, y: 150 },
            properties: {},
          },
          {
            id: 'task_1',
            type: 'task' as const,
            name: '审核任务',
            position: { x: 300, y: 150 },
            properties: {
              assignee: '审核员',
              description: '审核用户提交的申请',
            },
          },
          {
            id: 'end_1',
            type: 'end' as const,
            name: '结束',
            position: { x: 500, y: 150 },
            properties: {},
          },
        ],
        flows: [
          {
            id: 'flow_1',
            source: 'start_1',
            target: 'task_1',
            name: '提交',
          },
          {
            id: 'flow_2',
            source: 'task_1',
            target: 'end_1',
            name: '完成',
          },
        ],
      }
    case 'uml':
      return {
        classes: [
          {
            id: 'user_class',
            name: 'User',
            attributes: [
              { name: 'id', type: 'Long', visibility: 'private' },
              { name: 'username', type: 'String', visibility: 'private' },
              { name: 'email', type: 'String', visibility: 'private' },
            ],
            methods: [
              { name: 'getId', returnType: 'Long', visibility: 'public' },
              {
                name: 'getUsername',
                returnType: 'String',
                visibility: 'public',
              },
              {
                name: 'setUsername',
                returnType: 'void',
                visibility: 'public',
              },
            ],
            position: { x: 100, y: 100 },
          },
        ],
        relations: [],
      }
    default:
      return undefined // 改为undefined而不是null
  }
}
