import eslint from '@eslint/js'
import globals from 'globals'
import tsEslint from 'typescript-eslint'
import eslintPluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import cspellConfigs from '@cspell/eslint-plugin/configs'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default tsEslint.config(
  /** 忽略文件 */
  { ignores: ['node_modules', 'dist', 'public', '**/*.min.{js,cjs,mjs}'] },

  /** 兼容 */
  ...compat.config({ extends: ['./eslintrc-auto-import.json'] }),

  /** 检查文件 */
  { files: ['**/*.{js,mjs,cjs,ts,vue}'] },

  // 全局变量
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },

  /** js推荐配置 */
  eslint.configs.recommended,
  /** cspell推荐配置 */
  cspellConfigs.recommended,
  /** ts推荐配置 */
  ...tsEslint.configs.recommended,
  /** vue推荐配置 */
  ...eslintPluginVue.configs['flat/recommended'],

  /**  代码风格 */
  stylistic.configs.customize({
    jsx: true,
    braceStyle: '1tbs',
    arrowParens: 'always',
  }),

  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tsEslint.parser,
        ecmaFeatures: { jsx: true },
      },
    },
  },

  {
    rules: {
      // ts
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          // 允许短路表达式
          allowShortCircuit: true,
          // 允许三元表达式
          allowTernary: true,
          // 允许模板字符串
          allowTaggedTemplates: true,
        },
      ],

      // vue
      'vue/multi-word-component-names': ['error', { ignores: ['index'] }],

      // stylistic
      '@stylistic/brace-style': ['off', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },

  /** prettier 配置 */
  eslintPluginPrettierRecommended,
)
