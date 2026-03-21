/**
 * micro-app 类型声明
 */

declare global {
  interface Window {
    microApp?: {
      getData: () => any
      dispatch: (data: any) => void
      addDataListener: (callback: (data: any) => void) => void
      removeDataListener: (callback: (data: any) => void) => void
      setData: (appName: string, data: any) => void
    }
    __MICRO_APP_ENVIRONMENT__?: boolean
    __MICRO_APP_NAME__?: string
    __MICRO_APP_BASE_ROUTE__?: string
  }
}

declare module '@micro-zoe/micro-app' {
  const microApp: {
    start: (options?: {
      'disable-memory-router'?: boolean
      'disable-patch-request'?: boolean
      [key: string]: any
    }) => void
    setData: (appName: string, data: any) => void
    getData: (appName: string) => any
    addDataListener: (appName: string, callback: (data: any) => void) => void
    removeDataListener: (appName: string, callback: (data: any) => void) => void
  }
  export default microApp
}

export {}
