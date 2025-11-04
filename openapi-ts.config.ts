export default {
  input: './openapi.json',
  output: 'src/api/generated',
  plugins: [
    '@hey-api/typescript', // 生成类型
    {
      name: '@hey-api/sdk', // 🆕 生成 SDK 函数
      asClass: false, // 使用函数导出 (tree-shakeable)
    },
  ],
  types: {
    enums: 'javascript', // 用对象而不是 enum
  },
}
