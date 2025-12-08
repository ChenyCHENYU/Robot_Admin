/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-08 14:14:01
 * @FilePath: \Robot_Admin\apps\robot-admin-internal\eslint.config.ts
 * @Description: oxlint 和 eslint 配置文件，不要随便改，改了要同步干系人（注意）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import jsdocPlugin from 'eslint-plugin-jsdoc'

export default defineConfigWithVueTs(
  //MARK: 基础配置组
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/src/api/generated/**', // 忽略自动生成的 API 文件
      '**/lang/**', // 忽略 i18n 插件生成的文件
    ],
  },

  //MARK： 核心规则组（按优先级排序）

  ...oxlint.configs['flat/recommended'], // 高性能基础校验

  //! 忽略转义字符
  {
    rules: {
      'no-useless-escape': 'off',
    },
  },

  pluginVue.configs['flat/essential'], // Vue 专用规则
  vueTsConfigs.recommended, // TS 专用规则

  //MARK: 新增文件类型覆盖规则

  //! 变量使用规则
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },

  //MARK: 自定义规则组（优先级最高）
  {
    plugins: {
      jsdoc: jsdocPlugin, // 添加 JSDoc 插件
    },
    rules: {
      //! 新增 JSDoc 注释规则
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false, // 强制箭头函数注释
            FunctionExpression: true, // 强制函数表达式注释
          },
          contexts: [
            // 'TSInterfaceDeclaration',
            // 'TSTypeAliasDeclaration',
            'FunctionDeclaration',
            'ClassDeclaration',
            'ClassProperty',
            'MethodDefinition',
            // 'ArrowFunctionExpression', // 覆盖箭头函数
            'FunctionExpression', // 覆盖函数表达式
          ],
          checkConstructors: true, // 检查构造函数
          checkGetters: true, // 检查 getter
          checkSetters: true, // 检查 setter
        },
      ],

      //! 关闭与 oxlint 重复的 ESLint 规则
      'no-undef': 'off',

      //! 引号规范

      '@typescript-eslint/quotes': ['error', 'single'],
      'vue/html-quotes': ['error', 'double'],

      //! TypeScript 安全
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
        },
      ],

      //! 代码复杂度
      // 限制代码块的最大嵌套深度为4层，过深的嵌套难以理解和维护，如回调地狱
      'max-depth': ['error', 4],
      // 函数复杂度阈值警告（超过 10 个逻辑分支时提示）
      complexity: ['warn', 10],

      //! 表达式规范
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true, // 允许短路表达式
          allowTernary: false, // 允许三元表达式
          allowTaggedTemplates: false, // 禁止标签模板
          enforceForJSX: true, // 对 Vue/React 组件加强检查
        },
      ],

      //! 异步代码规范
      // 禁止在循环中使用await，可能导致性能问题
      'no-await-in-loop': 'error',

      // Vue 规范
      //! PascalCase 命名规范
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false, // 关键修改
          ignores: [
            'router-view',
            'router-link',
            'transition',
            'draggable',
            // 添加自定义组件前缀匹配过滤检查
            '/^icon-/i',
            '/^C_/',
            '/^c_/',
            // 第三方插件的组件
            'v-md-editor',
          ],
        },
      ],
      // 新增多单词组件名例外规则
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['index'], // 允许单单词组件名为 index
        },
      ],
      //! 禁止在模板中注册但未使用的组件
      'vue/no-unused-components': 'error',
      //! 主动禁止 Vue 2 写法
      'vue/no-deprecated-props-default-this': 'error',
      'vue/no-deprecated-events-api': 'error',
      'vue/no-deprecated-filter': 'error',
      'vue/no-deprecated-functional-template': 'error',

      //MARK: 格式规范
      // "off" 或 0 - 关闭该规则
      // "warn" 或 1 - 启用并警告（不影响现有代码）
      // "error" 或 2 - 启用并报错（错误代码 1）
      //! 规则标准
      'no-irregular-whitespace': 'error', // 禁止不规则的空格
      'no-multi-spaces': 'error', // 禁止多个空格
      'space-infix-ops': 'error', // 运算符前后禁止多个空格
      'array-bracket-spacing': ['error', 'never'], // 数组统一空格
      'arrow-spacing': ['error', { before: true, after: true }], // 箭头前后有空格
      'max-params': ['warn', 6], // 函数参数最大数量为 6
      'no-eval': 'error', // 禁止使用 eval
      'prefer-const': 'warn', // 建议使用 const 声明不变的变量
      'no-var': 'warn', // 建议使用 let/const 替代 var
      // 'no-console': ['error', { allow: ['warn', 'error', 'debug', 'info'] }],
      'prefer-destructuring': [
        1,
        { object: true, array: false }, // 建议使用解构赋值
      ],
      'no-duplicate-imports': 'error', // 禁止重复导入
    },
  },
  //MARK: 新增ESLINT白名单配置组
  {
    name: 'app/ignore-assets',
    ignores: [
      'src/assets/images/**/*',
      '**/*.d.ts',
      '**/auto-imports.d.ts',
      'src/views/**/components/*.vue',
      'scripts/**/*',
    ],
  },
  //MARK: JSDoc 白名单覆盖规则
  {
    files: [
      'src/router/**/*.ts',
      'src/stores/**/*.ts',
      'src/views/**/components/*.vue', // 对于第三方组件引入的代码不做检查
    ],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/require-jsdoc': 'off',
    },
  },
  skipFormatting
)
