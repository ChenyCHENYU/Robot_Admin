<!--
  @Author: ChenYu ycyplus@gmail.com
  @Date: 2026-10-07
  @FilePath: \Robot_Admin\docs\form-configuration.md
  @Description: 表单规则、操作与异步提交的直接配置方式
  Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

# 表单配置

`C_Form` 已内置 `@robot-admin/form-validate` 的规则适配。页面只定义模型、字段 `options` 和行为 `config`，无需项目侧类型断言、规则转换或第二套提交状态。

```vue
<template>
  <C_Form
    v-model="model"
    :options="options"
    :config="config"
  />
</template>

<script setup lang="ts">
  import {
    defineFormConfig,
    defineFormOptions,
    PRESET_RULES,
  } from '@robot-admin/naive-ui-components/C_Form'

  defineOptions({ name: 'ProfileForm' })
  interface Profile {
    name: string
    email: string
  }
  const model = ref<Profile>({ name: '', email: '' })
  const options = defineFormOptions<Profile>([
    { type: 'input', prop: 'name', label: '名称', required: true },
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      rules: [PRESET_RULES.optional(PRESET_RULES.email('邮箱'))],
    },
  ])
  const config = defineFormConfig<Profile>({
    submitText: '校验表单',
    resetText: '重置表单',
    submitSuccessText: '本地校验完成（未保存到服务器）',
  })
</script>
```

## 校验规则

- `PRESET_RULES`：单条规则；`NAIVE_COMBOS`：常用规则数组。
- `SPEC_RULES`：框架无关规则，由组件转换为 Naive UI 规则。
- Naive UI 原生 `FormItemRule`、验证库原始 `NaiveRule` 和 `RuleSpec` 均可直接配置，并可混用。
- `required: true` 复用验证库的空值判断，空白字符串和空集合无法通过，`0`、`false` 有效。
- `rulesWhen(model)` 可生成动态规则；规则回调异常会阻止校验与提交，恢复后可正常校验，不会因异常删除规则而绕过校验。

已有字段依赖、跨字段比较、异步选项、嵌套路径、动态增删和多种布局仍使用原配置。无需另建表单 DSL。直接运行时导入统一使用 `/C_Form` 入口，保留按需加载。

## 提交与反馈

普通布局默认提供重置、提交按钮，步骤布局最后一步默认提供提交按钮。`submitText`、`resetText` 配置文案；`submitSuccessText`、`resetSuccessText` 默认为空，仅显式配置后显示提示。

接入接口时，把异步工作放进 `config.onSubmit(payload, context)`，返回其 Promise。组件负责校验、锁定重复提交、按钮加载、异常反馈和清理。保存接口返回业务失败时应抛出错误；组件不会猜测接口响应结构，也不会在未等待异步结果时提示成功。

`context?.signal` 可传给支持取消的请求。表单卸载会发出取消信号；请求即使不支持取消，迟到的提交事件和提示也会被拦截。调用方若需取消网络请求，必须把信号传给请求层。`@submit` 用于完成后的同步通知，异步保存应使用 `config.onSubmit`。

## 自定义操作

只增加预览等业务按钮时，用 `#action-extra="{ submitting, model }"`，保留默认按钮和统一状态；完全自定义操作区可继续使用 `#action`。步骤操作用 `#step-actions="{ isLastStep, submit, submitting }"`，该插槽会替换默认最后一步按钮，避免重复渲染。

草稿、导出、筛选条件等业务状态仍由页面维护。自定义按钮应根据 `submitting` 禁用会修改模型的操作，提交调用组件提供的 `submit()`；不要另建 loading、防抖、二次校验和重复提示。

示例位于 `src/views/demo/07-form/layouts/`：默认和步骤布局直接配置，网格和动态布局展示 `action-extra`，自定义布局展示异步 `onSubmit`。

## 页面接入约定

业务页面也使用同一套 `options + config`，保留原有接口和领域校验。

| 页面                     | 配置方式与保留行为                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------- |
| 个人资料                 | 默认按钮、可选手机、保存后 `markAsClean()` 更新重置基准；加载期间禁用输入             |
| 账号安全、用户重置密码   | `dependsOn + crossFieldValidator` 比较密码；关闭账号密码弹窗清空敏感输入              |
| 用户、角色、权限         | 配置字段、动态显隐、编辑禁用字段；提交使用模型快照，保留公司归属、编码生成与列表刷新  |
| 菜单、字典               | `rulesWhen(model)` 复用领域校验；校验当前内部模型，保留状态数值、重复值保护和缓存同步 |
| 表单容器                 | 普通布局默认操作，步骤最终提交统一入口；`@submit` 成功后关闭弹窗                      |
| 新增员工、下载、文章编辑 | 标准字段直接配置；下载参数有 JSON 校验，文章编辑保留 Markdown、字数统计、草稿和预览   |
| 搜索表单、Mach 表格      | 已有配置接口继续使用；搜索示例统一循环渲染，Mach 的编辑和只读配置继续复用             |
| 操作栏、防抖演示         | 保留示例所演示的按钮栏与防抖指令，字段由统一组件渲染                                  |

Naive UI 原生业务规则数组可以直接传给字段 `rules`。标准选择、单选和多选字段的选项使用 `children`，不要放进 `attrs.options`；树选择器、Markdown 等专用字段使用实例级 `renderers`，无需全局注册，也不新增项目侧表单包装组件。字段禁用放在 `option.disabled`，组件属性放在 `attrs`；不要在 `attrs.disabled` 中配置会被统一状态覆盖的字段策略。

弹窗外部按钮调用 `formRef.submit()`，完成关闭放在 `@submit`，异步保存放在 `config.onSubmit`。业务失败必须抛出，避免捕获后继续触发成功事件。`showActions: false` 隐藏整个操作区，适合外部按钮；使用 `#action` 替换操作区时保留默认的 `showActions: true`。
