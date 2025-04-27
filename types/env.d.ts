import { DefineComponent } from 'vue'

declare module '_views/*' {
  const component: DefineComponent<unknown, unknown, unknown>
  export default component
}

declare module '*.vue' {
  const component: DefineComponent<unknown, unknown, unknown>
  export default component
}
