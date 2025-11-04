// SDK 客户端配置
import { client } from './client.gen'

const { VITE_API_BASE } = import.meta.env

// 配置 SDK 客户端的 baseURL
client.setConfig({
  baseUrl: VITE_API_BASE || '',
})

export { client }
