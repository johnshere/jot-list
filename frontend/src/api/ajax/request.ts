// 当前文件不校验any
// eslint-disable @typescript-eslint/no-explicit-any
import { alertError, toLogin } from '@/libs'
import { useUserStore } from '@/stores'
import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios'

interface AbortInstance {
    // url: string
    // params: Record<string, any>
    // data: any
    config: AxiosRequestConfig
    controller: AbortController
}
export class AbortUtil {
    // 用于存储控制器对象
    static controllerMap = new Map<string, AbortInstance>()
    /**
     * 取消全部请求
     */
    static cancelAllRequest() {
        for (const [, { controller }] of this.controllerMap) {
            // 取消请求
            controller.abort()
        }
        this.controllerMap.clear()
    }
    /**
     * 取消指定的请求
     * @param url 待取消的请求URL
     */
    static cancelRequest(url: string | string[], baseURL = '') {
        const urlList = Array.isArray(url) ? url : [url]
        for (const _url of urlList) {
            for (const [key, { config, controller }] of this.controllerMap) {
                if (_url.startsWith('http') || !baseURL) {
                    if (config.url !== _url) continue
                } else {
                    if (baseURL + _url !== (config.baseURL || '') + config.url) continue
                }
                // 取消请求
                controller?.abort()
                this.controllerMap.delete(key)
            }
        }
    }
}

/**
 * 判断是否是文件类型响应
 * @param response
 * @returns
 */
export const isFile = (response: AxiosResponse) => {
    const contentType = response.headers['content-type'] || response.headers['Content-Type']
    if (!contentType) {
        return false
    }
    return (
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/pdf') ||
        contentType.includes('application/vnd.ms-excel') ||
        contentType.includes('application/zip')
    )
}

/**
 * content-disposition设置了名称，则认为是文件下载；否则就需要自行处理
 * @param response 响应体
 */
export const fileReponseDown = (response: AxiosResponse) => {
    if (!isFile(response)) {
        return
    }
    let name = response.headers['content-disposition'] && response.headers['content-disposition'].split('=')[1]
    name = name || (response.headers['Content-Disposition'] && response.headers['Content-Disposition'].split('=')[1])
    if (!name) {
        console.warn('文件名称为空，请处理名称')
        return
    }
    const blob = new Blob([response.data], {
        type: `application/msword;application/vnd.ms-excel;application/x-zip-compressed;charset=utf-8`
    })
    // const blob = new Blob([response.data], { type: `application/vnd.ms-excel;charset=utf-8` });

    const downloadElement = document.createElement('a')
    // 创建下载的链接
    const href = window.URL.createObjectURL(blob)
    downloadElement.href = href
    // 下载后文件名
    downloadElement.download = name
    document.body.appendChild(downloadElement)
    // 点击下载
    downloadElement.click() // 下载完成移除元素
    document.body.removeChild(downloadElement)
}

export class Request {
    // axios实例
    instance: AxiosInstance
    // 构造函数
    constructor(config?: CreateAxiosDefaults) {
        // 创建axios实例
        this.instance = axios.create(config)
        // 设置拦截器
        this.setInterceptors(this.instance)
    }
    // 请求
    request<R>(config: AxiosRequestConfig): Promise<R> {
        // console.log('config', config)
        return this.instance(config)
    }
    // 拦截器
    setInterceptors(request: AxiosInstance) {
        // 请求拦截器
        request.interceptors.request.use(config => {
            // toDo 也可以在这里做一个重复请求的拦截
            // https://github.com/axios/axios/tree/main#abortcontroller
            // 随机数作为请求key
            const requestKey = Math.random().toString(36).slice(2)
            config.requestKey = requestKey
            // 实例化控制器
            const controller = new AbortController()
            // 将控制器实例与请求绑定
            config.signal = controller.signal
            // 将控制器实例存储到Map中
            AbortUtil.controllerMap.set(requestKey, { config, controller })
            // 设置请求头
            if (config && config.headers) {
                const auth = useUserStore().Authorization
                if (auth) config.headers.set('Authorization', auth)
            }
            return config
        })
        // 响应拦截器
        request.interceptors.response.use(
            (res: AxiosResponse<RequestResult<Obj>, Obj>) => {
                // console.log('res', res)
                const requestKey = res.config.requestKey
                // 请求完成后，将控制器实例从Map中移除
                if (requestKey) AbortUtil.controllerMap.delete(requestKey)
                if (axios.isCancel(res)) {
                    console.log('Request canceled', res)
                    return Promise.reject(res)
                }
                if (isFile(res)) {
                    fileReponseDown(res)
                    return Promise.resolve(res)
                }
                if (res.status === 200) {
                    // 未登录
                    if (res.data.code === 401 || res.data.code === '1002') {
                        toLogin()
                        return Promise.reject(res)
                    }
                    if (!res.data.success && res.config.showErrorMessage !== false) {
                        alertError(res.data?.message || res.data?.msg || `接口响应为失败状态`)
                    }
                    return Promise.resolve(res.data as unknown as AxiosResponse)
                } else {
                    if (res.config.showErrorMessage !== false) {
                        alertError(res.data?.message || res.data?.msg || `接口调用失败`)
                    }
                    console.error(res)
                    return Promise.reject(res)
                }
            },
            (error: AxiosError) => {
                console.log(error)
                if (error.config?.showErrorMessage !== false) {
                    if (!axios.isCancel(error)) {
                        alertError(`接口调用失败`)
                    }
                }
                throw error
            }
        )
    }
    // GET请求
    get<R, P = RequestResult<R>>(url: string, params?: BaseObj, options?: AxiosRequestConfig<Obj>) {
        return this.request<P>({ ...options, url, params, method: 'GET' })
    }
    // POST请求
    post<R, P = RequestResult<R>>(url: string, data?: Obj | FormData, options?: AxiosRequestConfig<Obj>) {
        return this.request<P>({ ...options, url, data, method: 'POST' })
    }
}

/**
 * 检查请求是否成功，大部分不需要判定code，但是工作流相关需要判定code=‘1’
 */
export const Success = <D>(res: RequestResult<D>): res is SuccessResult<D> => res.success && res.code == '1'

/**
 * 基础请求，扩展的话在下方新增
 */
export const request = new Request({ baseURL: '/api' })
