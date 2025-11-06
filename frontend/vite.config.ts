import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// @ts-expect-error 忽略类型检查，因为vite-plugin-eslint的类型声明文件存在导出兼容性问题
import eslint from 'vite-plugin-eslint'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// 引入插件
import VitePluginMetaEnv from 'vite-plugin-meta-env'
// gzip压缩
import { visualizer } from 'rollup-plugin-visualizer'
// import viteCompression from 'vite-plugin-compression'
// import viteImagemin from 'vite-plugin-imagemin'
import fs from 'fs'
import VueDevTools from 'vite-plugin-vue-devtools'
import { configDefaults } from 'vitest/config'

const packageJson = fs.readFileSync('./package.json', 'utf-8')
const { name: title, version: APP_VERSION } = JSON.parse(packageJson)

// https://vitejs.dev/config/
export default () => {
    // 增加环境变量
    const metaEnv = {
        APP_VERSION,
        APP_NAME: title,
        APP_BUILD_TIME: new Date().toISOString()
    }

    return defineConfig({
        // 设置打包路径
        base: `/`,
        // 插件
        plugins: [
            vue(),
            vueJsx(),
            eslint(),
            // 按需导入
            AutoImport({
                resolvers: [],
                // targets to transform
                include: [
                    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                    /\.vue$/,
                    /\.vue\?vue/, // .vue
                    /\.vue\.[tj]sx?\?vue/, // .vue (vue-loader with experimentalInlineMatchResource enabled)
                    /\.md$/ // .md
                ],

                // global imports to register
                imports: [
                    'vue',
                    'vue-router',
                    // 指定Reactive导入
                    {
                        from: 'vue',
                        imports: ['Reactive'],
                        type: true
                    }
                ],

                // Filepath to generate corresponding .d.ts file.
                // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
                // Set `false` to disable.
                dts: './auto-imports.d.ts',

                // Inject the imports at the end of other imports
                injectAtEnd: true,

                // Generate corresponding .eslintrc-auto-import.json file.
                // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
                eslintrc: {
                    enabled: true, // Default `false`
                    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
                    globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
                }
            }),
            Components({
                resolvers: []
            }),
            // 环境变量
            VitePluginMetaEnv(metaEnv, 'import.meta.env'),
            VitePluginMetaEnv(metaEnv, 'process.env'),
            // https://github.com/webfansplz/vite-plugin-vue-devtools
            VueDevTools(),
            visualizer({ emitFile: true, filename: 'analysis.html' })
        ],
        // 别名
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: ``
                }
            },
            devSourcemap: true
        },
        // 打包配置
        build: {
            sourcemap: false,
            rollupOptions: {
                external: [],
                output: {
                    chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
                    entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
                    assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等
                    // entryFileNames: 'main-app.js',
                    manualChunks(id, { getModuleInfo }) {
                        // 打包依赖
                        if (id.includes('node_modules')) {
                            // 可能频繁更新
                            const ks =
                                'lodash,jspdf,jszip,exceljs,moment,html2canvas,vconsole,pdfjs-dist,echarts,tinymce'
                            for (const k of ks.split(',')) {
                                if (id.includes(k)) return k
                            }
                            return 'vendor'
                        }
                        const comReg = /(.*)\/src\/components\/(.*)/
                        if (comReg.test(id)) {
                            const len = getModuleInfo(id)?.importers.length || 0
                            if (len > 1) return 'common'
                        }
                        // 切分路由文件
                        // const routeReg = /.*\/src\/views\/(.*)\/index.vue/
                        // if (routeReg.test(id)) {
                        //     const [_, path] = routeReg.exec(id) || ['', '']
                        //     if (path) return 'views-' + path.toLocaleLowerCase().replaceAll('/', '-')
                        // }
                    }
                },
                plugins: [
                    // build.rollupOptions.plugins[]
                    // viteCompression({
                    //     verbose: true, // 是否在控制台中输出压缩结果
                    //     disable: false,
                    //     threshold: 10240, // 如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反
                    //     algorithm: 'gzip', // 压缩算法，可选['gzip'，' brotliccompress '，'deflate '，'deflateRaw']
                    //     ext: '.gz',
                    //     deleteOriginFile: true // 源文件压缩后是否删除(我为了看压缩后的效果，先选择了true)
                    // })
                    // 参数及配置：https://github.com/vbenjs/vite-plugin-imagemin/blob/main/README.zh_CN.md
                    // viteImagemin({
                    //     gifsicle: {
                    //         optimizationLevel: 7,
                    //         interlaced: false
                    //     },
                    //     optipng: {
                    //         optimizationLevel: 7
                    //     },
                    //     mozjpeg: {
                    //         quality: 20
                    //     },
                    //     pngquant: {
                    //         quality: [0.8, 0.9],
                    //         speed: 4
                    //     },
                    //     svgo: {
                    //         plugins: [
                    //             {
                    //                 name: 'removeViewBox'
                    //             },
                    //             {
                    //                 name: 'removeEmptyAttrs',
                    //                 active: false
                    //             }
                    //         ]
                    //     }
                    // })
                ]
            }
        },
        // 本地服务配置
        server: {
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            cors: true,
            open: false,
            port: 9090,
            host: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true
                }
            }
        },
        test: {
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/*'],
            root: fileURLToPath(new URL('./', import.meta.url))
            // transformMode: {
            //     web: [/\.[jt]sx$/]
            // }
        }
    })
}
