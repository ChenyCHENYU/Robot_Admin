---
name: prototype-scan
description: 'Use when: analyzing Axure exported HTML prototype files or detailed design documents to extract page inventory, classify interaction patterns, and produce a structured page-spec JSON for Vue 3 + Naive UI development. Triggers on: prototype analysis, axure scan, page inventory, 原型解析, 页面清单, axure转vue, 详设文档, design doc.'
---

# Skill: 原型解析（prototype-scan）

将 **Axure 导出的 HTML 原型包** 或 **详细设计文档（MD/Word/表格）** 解析为结构化的 **page-spec JSON 页面清单**，作为后续接口约定和代码生成的输入。

> **两种输入，同一输出**：输出格式完全相同（page-spec JSON），消费方（page-codegen）无需感知来源。

---

## 触发

- **模式 A（Axure）**：提供 Axure HTML 文件包目录，AI 全量扫描 HTML
- **模式 B（详设文档）**：提供 MD/Word/表格格式的详细设计文档，AI 解析结构化字段

---

## 步骤

### 1. 全量扫描 HTML（模式 A）

遍历所有 `.html` 文件，提取：

| 区域 | 提取内容                                               |
| ---- | ------------------------------------------------------ |
| 标题 | `<title>` / 标题文本 → 页面名称                        |
| 表格 | `<table>` / 网格布局 → 表格列定义                      |
| 表单 | `<input>` / `<select>` / 标签文本 → 查询条件和表单字段 |
| 按钮 | `<button>` / 链接文本 → 操作按钮列表                   |
| 弹窗 | 遮罩层 / 弹出层 → 弹窗组件                             |
| 树形 | 侧边栏 / 树形导航 → 树形结构                           |
| 注释 | Axure 注解 → 业务说明                                  |

### 2. 解析详设文档（模式 B）

从 MD/Word/表格中提取：

- 每个页面的功能描述
- 字段列表（中文名 + 类型 + 必填 + 校验规则）
- 接口 URL 约定
- 按钮/操作定义
- 业务流程说明

### 3. 交互模式分类

| 模式            | 特征                         | Robot Admin 组件                       |
| --------------- | ---------------------------- | -------------------------------------- |
| `LIST`          | 查询区 + 表格 + 分页         | C_Form(search) + C_Table + C_ActionBar |
| `MASTER_DETAIL` | 上方主表 + 下方明细表        | C_SplitPane + 两个 C_Table             |
| `TREE_LIST`     | 左侧树 + 右侧表格            | C_SplitPane + C_Tree + C_Table         |
| `FORM_PAGE`     | 独立表单页面（多Tab/多字段） | C_Form(tabs/steps) + 独立路由          |
| `FORM_MODAL`    | 弹窗中的表单                 | NModal + C_Form                        |
| `DETAIL_TABS`   | 详情页 + 子表Tab             | NTabs + 多个 C_Table                   |
| `DASHBOARD`     | 数据大屏/统计面板            | ECharts + NGrid + NStatistic           |
| `COMPOSITE`     | 多种组合                     | 组合使用                               |

### 4. 字段提取

对每个页面提取 3 类字段（字段名建议 camelCase）：

**查询字段：**

```
中文名 | 建议字段名(camelCase) | 组件类型 | 备注
```

组件类型对照（C_Form options 中使用）：

| 原型表现   | type 值       | 备注                |
| ---------- | ------------- | ------------------- |
| 普通输入框 | `input`       | 默认类型            |
| 下拉选择   | `select`      | 配 options 选项数据 |
| 单日期     | `date`        | —                   |
| 日期范围   | `daterange`   | —                   |
| 月份选择   | `month`       | —                   |
| 数字输入   | `inputNumber` | —                   |
| 开关       | `switch`      | —                   |
| 级联选择   | `cascader`    | —                   |
| 树选择     | `treeSelect`  | —                   |

**表格列：**

```
列名(中文) | 字段名(camelCase) | 宽度建议 | 是否可排序 | 渲染方式(tag/text/custom)
```

**表单字段（弹窗/独立页面）：**

```
中文名 | 字段名(camelCase) | 类型 | 是否必填 | 校验规则 | 组件类型
```

### 5. 按钮提取

**工具栏按钮（C_ActionBar）：**

```
按钮标签 | 类型(primary/default/error/warning) | 图标 | 权限码(可选)
```

**操作列按钮：**

```
按钮标签 | 类型 | 条件显示(show函数描述) | 权限码(可选)
```

> ⚠️ **注意事项**：
>
> - Axure HTML DOM 顺序 ≠ 视觉顺序（绝对定位），以截图/实际渲染为准
> - 按钮颜色必须看原型实际颜色：primary=蓝, error=红, warning=橙
> - "新增"类按钮永远排 toolbarActions 第一个
> - 操作列按钮严格与原型一一对应，不可自编

### 6. 组件匹配

对照 Robot Admin 已有组件：

| 功能区     | 组件                   | 来源                             |
| ---------- | ---------------------- | -------------------------------- |
| 查询表单   | C_Form                 | @robot-admin/naive-ui-components |
| 操作工具栏 | C_ActionBar            | @robot-admin/naive-ui-components |
| 数据表格   | C_Table                | @robot-admin/naive-ui-components |
| 图标       | C_Icon                 | @robot-admin/naive-ui-components |
| 分割面板   | C_SplitPane            | @robot-admin/naive-ui-components |
| 树形面板   | C_Tree                 | @robot-admin/naive-ui-components |
| 折叠面板   | C_CollapsePanel        | @robot-admin/naive-ui-components |
| 步骤表单   | C_Form(steps layout)   | @robot-admin/naive-ui-components |
| Tab 表单   | C_Form(tabs layout)    | @robot-admin/naive-ui-components |
| 文件上传   | C_Upload               | @robot-admin/naive-ui-components |
| 签名       | C_Signature            | @robot-admin/naive-ui-components |
| 弹窗       | NModal / NDrawer       | naive-ui                         |
| 分页       | 内置于 C_Table         | —                                |
| 消息通知   | useMessage / useDialog | naive-ui                         |

---

## 输出格式：page-spec JSON

```json
{
  "module": "模块中文名",
  "pages": [
    {
      "name": "kebab-case-页面名",
      "title": "页面中文标题",
      "path": "src/views/[domain]/[module]/[kebab-case-name]/",
      "mode": "LIST | MASTER_DETAIL | TREE_LIST | FORM_PAGE | FORM_MODAL | DETAIL_TABS | DASHBOARD | COMPOSITE",
      "routeMeta": {
        "title": "菜单中文名",
        "icon": "mdi:icon-name",
        "keepAlive": true
      },
      "query": [
        {
          "label": "字段中文名",
          "prop": "fieldName",
          "type": "input | select | date | daterange | ...",
          "options": "选项数据说明（如有）",
          "rules": "校验规则说明（如有）"
        }
      ],
      "columns": [
        {
          "title": "列标题",
          "key": "fieldName",
          "width": 120,
          "sortable": true,
          "render": "tag | text | custom",
          "tagMap": { "值": "success | warning | error | info" }
        }
      ],
      "toolbar": [
        {
          "label": "新增",
          "type": "primary",
          "icon": "mdi:plus",
          "permission": "sys:xxx:add"
        }
      ],
      "operations": [
        {
          "label": "编辑",
          "type": "primary",
          "show": "条件描述",
          "permission": "sys:xxx:edit"
        }
      ],
      "form": [
        {
          "label": "字段中文名",
          "prop": "fieldName",
          "type": "input | select | ...",
          "required": true,
          "rules": "PRESET_RULES.xxx"
        }
      ],
      "subTables": [
        {
          "title": "子表名称",
          "apiSuffix": "queryXxxList",
          "columns": []
        }
      ],
      "notes": "业务备注/特殊逻辑说明"
    }
  ]
}
```

---

## 输出后流转

```
page-spec JSON
  ├─→ api-contract SKILL → 生成 api.md
  ├─→ page-codegen SKILL → 生成 index.vue + data.ts + index.scss
  └─→ route-sync SKILL   → 注册到 dynamicRouter.json
```

> **注意**：page-spec 是后续所有 Skill 的唯一输入源，确保数据准确完整。
