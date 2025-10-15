import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs, configureVueProject } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import eslintConfigPrettier from '@vue/eslint-config-prettier'
import fs from 'fs'

// 导入自动生成的eslint配置
const autoImportGlobals = JSON.parse(fs.readFileSync('./.eslintrc-auto-import.json', 'utf8')).globals || {}

configureVueProject({
    tsSyntaxInTemplates: true,
    scriptLangs: ['ts', 'tsx']
})

export default defineConfigWithVueTs([
    globalIgnores(['**/node_modules/**', '**/dist/**', 'scripts/**']),
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}'],
        languageOptions: { globals: { ...globals.browser, ...globals.node, ...autoImportGlobals } }
    },
    // JavaScript 规则
    js.configs.recommended,
    // Vue 规则
    pluginVue.configs['flat/essential'],
    // TypeScript 规则
    // ...tseslint.configs.recommended,
    vueTsConfigs.recommended,
    // pluginVue.configs['vue3-recommended'],
    skipFormatting,
    // Prettier 规则
    // prettierConfig,
    eslintConfigPrettier,
    // {
    //     plugins: {
    //         prettier
    //     },
    //     rules: {
    //         'prettier/prettier': 'error'
    //     }
    // }
    // Vue 文件特定配置
    // {
    //     files: ['**/*.vue'],
    //     languageOptions: {
    //         // parser: pluginVue.parser,
    //         parserOptions: {
    //             parser: tseslint.parser,
    //             ecmaVersion: 'latest',
    //             sourceType: 'module',
    //             ecmaFeatures: {
    //                 jsx: true
    //             }
    //         }
    //     }
    // }
    {
        rules: {
            'vue/multi-word-component-names': 'off',
            '@typescript-eslint/no-unused-vars': [
                'off',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^e'
                }
            ],
            '@typescript-eslint/no-empty-object-type': 'off',
            'prettier/prettier': 'error',
            'vue/valid-attribute-name': 'off'
        }
    }
])
