import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '../../generated/prisma/client'
import { getUserIdByToken } from '../../auth/session'
import { replyError, replySuccess } from '../../utils/reply'
import { HttpStatus, type JotListItem, type JotListQuery, type JotListResponse } from '@jot-list/shared'

const prisma = new PrismaClient()

const MAX_PAGE_SIZE = 50

const extractSummaryAndThumbnail = (raw: unknown): { summary: string; thumbnail: string | null } => {
    if (!raw) {
        return { summary: '', thumbnail: null }
    }

    if (typeof raw === 'string') {
        return { summary: raw.slice(0, 160), thumbnail: null }
    }

    if (typeof raw === 'object') {
        const content = raw as Record<string, unknown>
        let summary = ''
        let thumbnail: string | null = null

        if (typeof content.summary === 'string') {
            summary = content.summary
        } else if (Array.isArray(content.blocks)) {
            for (const block of content.blocks) {
                if (block && typeof block === 'object' && typeof (block as Record<string, unknown>).text === 'string') {
                    summary = (block as Record<string, unknown>).text as string
                    if (summary) break
                }
            }
        }

        if (typeof content.thumbnail === 'string') {
            thumbnail = content.thumbnail
        } else if (Array.isArray(content.images) && content.images.length > 0) {
            const firstImage = content.images.find(item => typeof item === 'string')
            if (typeof firstImage === 'string') {
                thumbnail = firstImage
            }
        }

        return { summary: summary.slice(0, 160), thumbnail }
    }

    return { summary: '', thumbnail: null }
}

export const jotListService = (instance: FastifyInstance) => {
    instance.get(
        '/jots',
        {
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1 },
                        pageSize: { type: 'integer', minimum: 1, maximum: MAX_PAGE_SIZE },
                        title: { type: 'string', maxLength: 128 },
                        startDate: { type: 'string', maxLength: 32 },
                        endDate: { type: 'string', maxLength: 32 }
                    }
                }
            }
        },
        async (req, reply) => {
            const auth = req.headers.authorization
            const token =
                typeof auth === 'string' && auth.startsWith('Bearer ')
                    ? auth.slice(7).trim()
                    : typeof auth === 'string'
                      ? auth.trim()
                      : ''

            if (!token) {
                return replyError(reply, 'Unauthorized', HttpStatus.UNAUTHORIZED)
            }

            const userId = getUserIdByToken(token)
            if (!userId) {
                return replyError(reply, 'Unauthorized', HttpStatus.UNAUTHORIZED)
            }

            const query = req.query as Partial<JotListQuery> & Record<string, unknown>

            const pageRaw = Number(query.page ?? 1)
            const pageSizeRaw = Number(query.pageSize ?? 12)
            const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
            const currentPageSize =
                Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? Math.min(Math.floor(pageSizeRaw), MAX_PAGE_SIZE) : 12
            const skip = (currentPage - 1) * currentPageSize

            const title =
                typeof query.title === 'string' && query.title.trim().length > 0 ? query.title.trim() : undefined
            const startDate =
                typeof query.startDate === 'string' && query.startDate.trim().length > 0
                    ? query.startDate.trim()
                    : undefined
            const endDate =
                typeof query.endDate === 'string' && query.endDate.trim().length > 0 ? query.endDate.trim() : undefined

            const where = {
                isDeleted: false,
                userId,
                ...(title
                    ? {
                          title: {
                              contains: title,
                              mode: 'insensitive'
                          }
                      }
                    : {}),
                ...(startDate
                    ? {
                          startDate: {
                              gte: startDate
                          }
                      }
                    : {}),
                ...(endDate
                    ? {
                          endDate: {
                              lte: endDate
                          }
                      }
                    : {})
            }

            const [total, rows] = await prisma.$transaction([
                prisma.jot.count({ where }),
                prisma.jot.findMany({
                    where,
                    orderBy: [{ isImportant: 'desc' }, { updateTime: 'desc' }],
                    skip,
                    take: currentPageSize
                })
            ])

            const list: JotListItem[] = rows.map(row => {
                const { summary, thumbnail } = extractSummaryAndThumbnail(row.content)
                const tags =
                    typeof row.tags === 'string'
                        ? row.tags
                              .split(',')
                              .map(tag => tag.trim())
                              .filter(Boolean)
                        : []

                return {
                    id: row.id,
                    title: row.title,
                    startDate: row.startDate,
                    endDate: row.endDate,
                    startTime: row.startTime,
                    endTime: row.endTime,
                    isImportant: row.isImportant,
                    isUrgent: row.isUrgent,
                    isCompleted: row.isCompleted,
                    summary: summary || row.title,
                    thumbnail,
                    tags,
                    updateTime: row.updateTime.toISOString()
                }
            })

            const response: JotListResponse = {
                list,
                page: currentPage,
                pageSize: currentPageSize,
                total,
                hasMore: skip + rows.length < total
            }

            return replySuccess(reply, response)
        }
    )
}
