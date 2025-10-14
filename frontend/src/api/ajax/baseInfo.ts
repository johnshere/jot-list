import { isPlatform } from 'runtime-origin'
import { Request, upmsRequest } from './request'
import { Base } from '@/api/consts/Request'

/**
 * 登录
 * @params data
 * @retruns
 */
export const getUserInfo = (): Promise<RequestResult<UserInfo>> => {
    if (isPlatform) {
        const url = `${Base.Cportal}/member/findBaseInfo`
        return new Request().get<PlatformUserInfo>(url, {})
    } else {
        const url = '/user/get'
        return upmsRequest.get<DeployUserInfo>(url, {})
    }
}
