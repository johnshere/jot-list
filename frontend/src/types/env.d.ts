/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly BASE_URL: string
    readonly MODE: string
    readonly APP_VERSION: string
    readonly APP_NAME: string
    readonly APP_BUILD_TIME: string
    readonly VITE_BASE_URL: string
    readonly VITE_SYSTEM_NAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

