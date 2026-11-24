/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @Description: 图编辑、审批流与签名页面对正式包公共接口的消费回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, type Component, type PropType } from 'vue'
import {
  NDialogProvider,
  NMessageProvider,
  NRadioGroup,
  NSelect,
  NSlider,
} from 'naive-ui'
import type { WorkflowData } from '@robot-admin/naive-ui-components/C_WorkFlow'
import type { SignatureStroke } from '@robot-admin/naive-ui-components/C_Signature'
import DiagramPage from '@/views/demo/29-antv-x6-editor/index.vue'
import WorkflowPage from '@/views/demo/28-work-flow-editor/index.vue'
import SignaturePage from '@/views/demo/42-signature/index.vue'
import { workflowScenarios } from '@/views/demo/28-work-flow-editor/data'

vi.mock('@/stores/theme', () => ({ s_themeStore: () => ({ isDark: false }) }))
const DiagramProbe = defineComponent({
  name: 'C_AntV',
  props: ['data', 'readonly', 'type'],
  emits: ['dataChange'],
  /** 不创建图形 SDK，仅观察页面是否更换实例和只读属性。 */
  setup: () => () => h('div', { class: 'diagram-probe' }),
})
const WorkflowProbe = defineComponent({
  name: 'C_WorkFlow',
  props: {
    modelValue: { type: Object as PropType<WorkflowData>, required: true },
    conditionFields: Array,
  },
  emits: ['update:modelValue', 'nodeClick', 'edgeClick'],
  /** 保留实际页面的模型与公共事件绑定。 */
  setup(props, { expose }) {
    expose({
      validateWorkflow: () => [
        {
          nodeId: props.modelValue.nodes[1].id,
          nodeName: '审批',
          message: '请重新检查审批人',
        },
      ],
    })
    return () => h('div', { class: 'workflow-probe' })
  },
})
const savedStrokes: SignatureStroke[] = [
  {
    points: [{ x: 8, y: 12, timestamp: 1 }],
    color: '#000000',
    width: 3,
    opacity: 1,
    mode: 'pen',
  },
]
const getSignatureData = vi.fn(() => savedStrokes)
const loadSignatureData = vi.fn()
const SignatureProbe = defineComponent({
  name: 'C_Signature',
  props: ['eraserConfig'],
  emits: ['change'],
  /** 快照隔离由包负责，这里只确认应用直接使用公开方法。 */
  setup(_, { expose }) {
    expose({ getSignatureData, loadSignatureData })
    return () => h('div', { class: 'signature-probe' })
  },
})
/** 页面继续使用真实 Naive 控件与 Provider，只替换重型运行时。 */
function mountPage(page: Component) {
  return mount(
    defineComponent({
      setup: () => () =>
        h(NDialogProvider, null, {
          default: () => h(NMessageProvider, null, { default: () => h(page) }),
        }),
    }),
    {
      global: {
        stubs: {
          C_AntV: DiagramProbe,
          C_WorkFlow: WorkflowProbe,
          C_Signature: SignatureProbe,
          C_Icon: true,
        },
      },
    }
  )
}

test('图编辑切换只读保留实例和业务数据，权限由组件原位更新', async () => {
  const wrapper = mountPage(DiagramPage)
  const diagram = wrapper.getComponent(DiagramProbe)
  const identity = diagram.vm.$.uid
  const initial = diagram.props('data')
  wrapper.getComponent(NRadioGroup).vm.$emit('update:value', 'preview')
  await flushPromises()
  expect(wrapper.getComponent(DiagramProbe).vm.$.uid).toBe(identity)
  expect(diagram.props('readonly')).toBe(true)
  expect(diagram.props('data')).toBe(initial)
  wrapper.getComponent(NRadioGroup).vm.$emit('update:value', 'edit')
  await flushPromises()
  expect(wrapper.getComponent(DiagramProbe).vm.$.uid).toBe(identity)
  expect(diagram.props('readonly')).toBe(false)
})

test('流程直接消费连线快照，人员按选择顺序写回且场景切换清理详情', async () => {
  const wrapper = mountPage(WorkflowPage)
  const workflow = wrapper.getComponent(WorkflowProbe)
  const model = workflow.props('modelValue')
  workflow.vm.$emit('edgeClick', model.edges[0])
  await flushPromises()
  expect(wrapper.get('[aria-label="选中连线"]').text()).toContain(
    '发起人 → 直属领导审批'
  )
  workflow.vm.$emit('nodeClick', model.nodes[1])
  await flushPromises()
  expect(wrapper.find('[aria-label="选中连线"]').exists()).toBe(false)
  const members = wrapper
    .findAllComponents(NSelect)
    .find(select => select.attributes('aria-label') === '配置节点人员')!
  members.vm.$emit('update:value', ['9', '4'])
  await flushPromises()
  const approval = workflow
    .props('modelValue')
    .nodes.find(node => node.type === 'approval')
  expect(approval?.data.approvers?.map(user => user.id)).toEqual(['9', '4'])
  workflow.vm.$emit('edgeClick', model.edges[0])
  await flushPromises()
  workflow.vm.$emit('update:modelValue', {
    ...workflow.props('modelValue'),
    edges: [],
  })
  await flushPromises()
  expect(wrapper.find('[aria-label="选中连线"]').exists()).toBe(false)
  await wrapper
    .findAll('.flow-scenarios button')
    .find(button => button.text().includes('费用报销'))!
    .trigger('click')
  const expense = wrapper.getComponent(WorkflowProbe)
  expect(expense.props('conditionFields')).toEqual([
    {
      key: 'amount',
      label: '报销金额（元）',
      type: 'number',
      operators: ['less_than', 'greater_than', 'equals'],
    },
  ])
  const condition = expense
    .props('modelValue')
    .nodes.find(node => node.type === 'condition')
  expect(
    condition?.data.conditions?.map(branch => branch.targetNodeId)
  ).toEqual(['approval-1', 'approval-2'])
  expect(condition?.data.conditions?.[1].isDefault).toBe(true)
  expect(
    workflowScenarios.find(scenario => scenario.id === 'expense-approval')
      ?.template.edges
  ).toHaveLength(3)
})

test('流程通过检查项选择节点后清理连线，模型更新使旧检查结果失效', async () => {
  const wrapper = mountPage(WorkflowPage)
  const workflow = wrapper.getComponent(WorkflowProbe)
  const model = workflow.props('modelValue')
  workflow.vm.$emit('edgeClick', model.edges[0])
  await wrapper
    .findAll('button')
    .find(button => button.text() === '检查流程')!
    .trigger('click')
  await wrapper.get('button.flow-issue').trigger('click')
  expect(wrapper.find('[aria-label="选中连线"]').exists()).toBe(false)
  workflow.vm.$emit('update:modelValue', { ...model, edges: [] })
  await flushPromises()
  expect(wrapper.find('button.flow-issue').exists()).toBe(false)
  expect(wrapper.text()).toContain('点击“检查流程”')
})

test('签名尺寸传给公开橡皮配置，快照直接存取且不误称 SVG 为矢量', async () => {
  const wrapper = mountPage(SignaturePage)
  const signature = wrapper.getComponent(SignatureProbe)
  signature.vm.$emit('change', savedStrokes)
  await flushPromises()
  const eraser = wrapper
    .findAllComponents(NSlider)
    .find(slider => slider.attributes('aria-label') === '橡皮尺寸')!
  eraser.vm.$emit('update:value', 60)
  await flushPromises()
  expect(signature.props('eraserConfig')).toEqual({ size: 60 })
  await wrapper
    .findAll('button')
    .find(button => button.text() === '保存笔迹快照')!
    .trigger('click')
  await wrapper
    .findAll('button')
    .find(button => button.text() === '恢复快照')!
    .trigger('click')
  expect(getSignatureData).toHaveBeenCalledOnce()
  expect(loadSignatureData).toHaveBeenCalledWith(savedStrokes)
  expect(loadSignatureData.mock.calls[0]?.[0]).toBe(savedStrokes)
  expect(wrapper.text()).toContain('SVG 嵌入当前画布图片')
  expect(wrapper.text()).not.toContain('矢量笔迹')
})
