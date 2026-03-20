/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: 共享 ESLint Flat Config 工厂函数
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import jsdocPlugin from 'eslint-plugin-jsdoc'

/**
 * 创建 ESLint Flat Config
 *
 * @description
 * 统一管理所有 app 的 ESLint 规则，各 app 仅需调用此函数并传入差异化配置。
 * 规则优先级：oxlint → Vue → TypeScript → JSDoc → 自定义 → skipFormatting
 *
 * @param options - 应用级覆盖选项
 * @param options.jsdocIgnoreFiles - 额外的 JSDoc 豁免文件 glob（已内置 router/stores/components）
 * @param options.extraIgnores - 额外的全局忽略 glob
 */
export function createEslintConfig(options?: {
  jsdocIgnoreFiles?: string[]
  extraIgnores?: string[]
}) {
  const { jsdocIgnoreFiles = [], extraIgnores = [] } = options ?? {}

  return defineConfigWithVueTs(
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
        '**/lang/**',
        ...extraIgnores,
      ],
    },

    //MARK: 核心规则组（按优先级排序）

    ...oxlint.configs['flat/recommended'],

    //! 忽略转义字符
    {
      rules: {
        'no-useless-escape': 'off',
      },
    },

    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,

    //MARK: 文件类型覆盖规则

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
        jsdoc: jsdocPlugin,
      },
      rules: {
        //! JSDoc 注释规则
        'jsdoc/require-jsdoc': [
          'error',
          {
            require: {
              FunctionDeclaration: true,
              MethodDefinition: true,
              ClassDeclaration: true,
              ArrowFunctionExpression: false,
              FunctionExpression: true,
            },
            contexts: [
              'FunctionDeclaration',
              'ClassDeclaration',
              'ClassProperty',
              'MethodDefinition',
              'FunctionExpression',
            ],
            checkConstructors: true,
            checkGetters: true,
            checkSetters: true,
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

        //! 表达式规范
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: false,
            allowTaggedTemplates: false,
            enforceForJSX: true,
          },
        ],

        //! 代码复杂度
        'max-depth': ['error', 4],
        complexity: ['warn', 10],

        //! 异步代码规范
        'no-await-in-loop': 'error',

        // Vue 规范
        //! PascalCase 命名规范
        'vue/component-name-in-template-casing': [
          'error',
          'PascalCase',
          {
            registeredComponentsOnly: false,
            ignores: [
              'router-view',
              'router-link',
              'transition',
              'draggable',
              '/^icon-/i',
              '/^C_/',
              '/^c_/',
              'v-md-editor',
            ],
          },
        ],
        'vue/multi-word-component-names': [
          'error',
          {
            ignores: ['index'],
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
        'no-irregular-whitespace': 'error',
        'no-multi-spaces': 'error',
        'space-infix-ops': 'error',
        'array-bracket-spacing': ['error', 'never'],
        'arrow-spacing': ['error', { before: true, after: true }],
        'max-params': ['warn', 6],
        'no-eval': 'error',
        'prefer-const': 'warn',
        'no-var': 'warn',
        'prefer-destructuring': [1, { object: true, array: false }],
        'no-duplicate-imports': 'error',
      },
    },

    //MARK: ESLINT 白名单配置组
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
        'src/views/**/components/*.vue',
        ...jsdocIgnoreFiles,
      ],
      rules: {
        'jsdoc/require-jsdoc': 'off',
        '@typescript-eslint/require-jsdoc': 'off',
      },
    },

    skipFormatting
  )
}
