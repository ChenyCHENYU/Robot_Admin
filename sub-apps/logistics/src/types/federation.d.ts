/*
 * @Description: Logistics 子应用 — 远程组件类型声明
 */

// =================== robotAdmin 远程模块声明 ===================
declare module 'robotAdmin/Table' {
  const component: typeof import('@robot-admin/naive-ui-components/C_Table').C_Table
  export default component
}

declare module 'robotAdmin/Form' {
  const component: typeof import('@robot-admin/naive-ui-components/C_Form').C_Form
  export default component
}

declare module 'robotAdmin/Tree' {
  const component: typeof import('@robot-admin/naive-ui-components/C_Tree').C_Tree
  export default component
}

declare module 'robotAdmin/Icon' {
  const component: typeof import('@robot-admin/naive-ui-components/C_Icon').C_Icon
  export default component
}

declare module 'robotAdmin/Editor' {
  const component: typeof import('@robot-admin/naive-ui-components/C_Editor').C_Editor
  export default component
}
