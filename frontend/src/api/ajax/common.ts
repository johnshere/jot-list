import type { User } from '@jot-list/shared'
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
    return request.get<User>('/user/get', {})
}
