/**
 * @Description: 请求响应接口
 */
interface RequestResult<D> {
    data: D
    code?: ResultCode
    message?: string
}
