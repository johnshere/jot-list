// 扩展axios请求配置
// eslint-disable-next-line
import * as axios from 'axios';

declare module 'axios' {
    interface AxiosRequestConfig {
        requestKey?: string
        /**
         * 接口请求是否显示错误信息，在接口响应时使用message提示错误信息，
         */
        showErrorMessage?: boolean
    }
}
