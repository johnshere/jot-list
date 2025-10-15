import { request } from './request'

export const getToken = () => {
    return request.get<string>('/user/token', {})
}
/**
 * 登录
 * @params data
 * @retruns
 */
export const getUserInfo = () => {
    return request.get<UserInfo>('/user/get', {})
}
