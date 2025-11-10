import type { Jot } from './prisma'

export interface JotListQuery {
    page?: number
    pageSize?: number
    title?: string
    startDate?: string
    endDate?: string
}

export interface JotListItem
    extends Pick<
        Jot,
        'id' | 'title' | 'startDate' | 'endDate' | 'startTime' | 'endTime' | 'isImportant' | 'isUrgent' | 'isCompleted'
    > {
    summary: string
    thumbnail: string | null
    tags: string[]
    updateTime: string
}

export interface JotListResponse {
    list: JotListItem[]
    page: number
    pageSize: number
    total: number
    hasMore: boolean
}
