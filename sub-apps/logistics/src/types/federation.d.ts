/*
 * @Description: Logistics 子应用 — 远程组件类型声明
 */

// =================== robotAdmin 远程模块声明 ===================
declare module 'robotAdmin/Table' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
  export default component
}

declare module 'robotAdmin/Form' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
  export default component
}

declare module 'robotAdmin/Tree' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
  export default component
}

declare module 'robotAdmin/Icon' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
  export default component
}

declare module 'robotAdmin/Editor' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
  export default component
}
