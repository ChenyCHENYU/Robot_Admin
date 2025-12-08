import { ref, reactive, computed, readonly, type Ref } from 'vue'
import { Node, Edge, type Graph } from '@antv/x6'
import type { ERTable, ERDiagramData } from '@/types/antv'

/**
 * ER图表组合函数
 * @param {Ref<Graph | null>} graph - 图表实例引用
 * @returns ER图表相关的状态和方法
 */
export function useERDiagram(graph: Ref<Graph | null>) {
  const selectedTable = ref<ERTable | null>(null)
  const showTableEditor = ref(false)
  const showSQLModal = ref(false)

  // 表单数据
  const tableForm = reactive<ERTable>({
    id: '',
    name: '',
    comment: '',
    fields: [],
    position: { x: 0, y: 0 },
  })

  // 字段类型选项
  const fieldTypeOptions = [
    { label: 'bigint', value: 'bigint' },
    { label: 'int', value: 'int' },
    { label: 'varchar(100)', value: 'varchar(100)' },
    { label: 'varchar(255)', value: 'varchar(255)' },
    { label: 'text', value: 'text' },
    { label: 'decimal(10,2)', value: 'decimal(10,2)' },
    { label: 'datetime', value: 'datetime' },
    { label: 'timestamp', value: 'timestamp' },
    { label: 'boolean', value: 'boolean' },
  ]

  /**
   * 生成SQL语句
   */
  const generatedSQL = computed(() => {
    const fields = tableForm.fields
      .map(field => {
        let sql = `  ${field.name} ${field.type}`
        if (field.isPrimaryKey) sql += ' PRIMARY KEY'
        if (field.isRequired && !field.isPrimaryKey) sql += ' NOT NULL'
        if (field.comment) sql += ` COMMENT '${field.comment}'`
        return sql
      })
      .join(',\n')

    return `CREATE TABLE ${tableForm.name} (
${fields}
)${tableForm.comment ? ` COMMENT='${tableForm.comment}'` : ''};`
  })

  /**
   * 注册ER图节点和边类型
   */
  const registerERNodes = () => {
    // 注册ER表节点
    Node.registry.register('er-table', {
      inherit: 'rect',
      width: 200,
      height: 'auto' as any,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#fff',
          rx: 4,
          ry: 4,
        },
        header: {
          fill: '#5F95FF',
          height: 30,
          strokeWidth: 0,
        },
        title: {
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#fff',
          textAnchor: 'middle',
        },
      },
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'rect', selector: 'header' },
        { tagName: 'text', selector: 'title' },
        { tagName: 'foreignObject', selector: 'fields' },
      ],
    } as any)

    // 注册ER关系边
    Edge.registry.register('er-relation', {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'classic',
            size: 8,
          },
        },
      },
    } as any)
  }

  /**
   * 创建表节点
   * @param {ERTable} table - 表数据
   * @returns 创建的节点实例
   */
  const createTableNode = (table: ERTable) => {
    if (!graph.value) return null

    return graph.value.addNode({
      id: table.id,
      shape: 'er-table',
      x: table.position.x,
      y: table.position.y,
      width: 200,
      height: 30 + table.fields.length * 24,
      data: table,
      attrs: {
        title: {
          text: table.name,
          x: 100,
          y: 20,
        },
      },
    } as any)
  }

  /**
   * 更新节点显示内容
   * @param {Node} node - 节点实例
   * @param {ERTable} table - 表数据
   */
  const updateNodeContent = (node: Node, table: ERTable) => {
    // 使用DOM操作更新节点内容
    const fieldsHtml = table.fields
      .map(
        field => `
      <div class="field-row ${field.isPrimaryKey ? 'primary-key' : ''}">
        <span class="field-name">${field.name}</span>
        <span class="field-type">${field.type}</span>
        ${field.isPrimaryKey ? '<i class="key-icon">🔑</i>' : ''}
        ${field.isRequired ? '<span class="required">*</span>' : ''}
      </div>
    `
      )
      .join('')

    // 在实际使用中，可以通过DOM选择器找到节点元素并更新内容
    const nodeElement = document.querySelector(
      `[data-cell-id="${node.id}"] .fields`
    )
    if (nodeElement) {
      nodeElement.innerHTML = fieldsHtml
    }
  }

  /**
   * 添加新表
   * @returns 创建的节点实例
   */
  const addTable = () => {
    if (!graph.value) return

    const newTable: ERTable = {
      id: `table_${Date.now()}`,
      name: '新表',
      fields: [
        {
          name: 'id',
          type: 'bigint',
          isPrimaryKey: true,
          isRequired: true,
          isForeignKey: false,
        },
        {
          name: 'name',
          type: 'varchar(100)',
          isPrimaryKey: false,
          isRequired: true,
          isForeignKey: false,
        },
      ],
      position: { x: 100, y: 100 },
    }

    return createTableNode(newTable)
  }

  /**
   * 编辑表
   * @param {ERTable} table - 要编辑的表数据
   */
  const editTable = (table: ERTable) => {
    selectedTable.value = table
    Object.assign(tableForm, { ...table, fields: [...table.fields] })
    showTableEditor.value = true
  }

  /**
   * 保存表数据
   * @returns 保存的表数据
   */
  const saveTable = () => {
    if (!graph.value || !selectedTable.value) return

    const node = graph.value.getCellById(selectedTable.value.id) as Node
    if (node) {
      node.setData({ ...tableForm })
      updateNodeContent(node, tableForm)
    }

    closeTableEditor()
    return { ...tableForm }
  }

  /**
   * 关闭表编辑器
   */
  const closeTableEditor = () => {
    showTableEditor.value = false
    selectedTable.value = null
  }

  /**
   * 添加字段
   */
  const addField = () => {
    tableForm.fields.push({
      name: '',
      type: 'varchar(100)',
      isPrimaryKey: false,
      isRequired: false,
      isForeignKey: false,
      comment: '',
    })
  }

  /**
   * 删除字段
   * @param {number} index - 字段索引
   */
  const removeField = (index: number) => {
    tableForm.fields.splice(index, 1)
  }

  /**
   * 获取当前图表数据
   * @returns ER图数据
   */
  const getCurrentData = (): ERDiagramData => {
    if (!graph.value) return { tables: [], relations: [] }

    const tables = graph.value.getNodes().map((node: Node) => ({
      ...node.getData(),
      position: node.getPosition(),
    }))

    const relations = graph.value.getEdges().map((edge: Edge) => edge.getData())

    return { tables, relations }
  }

  /**
   * 加载数据到图表
   * @param {ERDiagramData} data - 要加载的ER图数据
   */
  const loadData = (data: ERDiagramData) => {
    if (!graph.value) return

    graph.value.clearCells()
    data.tables.forEach(table => createTableNode(table))
    // TODO: 创建关系连线
  }

  return {
    // 状态
    selectedTable: readonly(selectedTable),
    showTableEditor,
    showSQLModal,
    tableForm,
    fieldTypeOptions,
    generatedSQL,

    // 方法
    registerERNodes,
    createTableNode,
    updateNodeContent,
    addTable,
    editTable,
    saveTable,
    closeTableEditor,
    addField,
    removeField,
    getCurrentData,
    loadData,
  }
}
