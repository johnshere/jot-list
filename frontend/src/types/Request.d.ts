/**
 * @Description: 请求响应接口
 */
type RequestResult<D> = FailedResult | SuccessResult<D>
type ResultCode = 100 | 200 | 401 | 300 | string
interface FailedResult {
    success: false
    code: ResultCode
    message: string
    msg: string
}

interface SuccessResult<D> {
    success: true
    data: D
    code?: ResultCode
    message?: string
    msg?: string
}
