import type { JotListQuery, JotListResponse } from '@jot-list/shared'
import { request } from './ajax/request'

export const fetchJotList = (params: JotListQuery) => {
    return request.get<JotListResponse>('/jots', params as BaseObj)
}
