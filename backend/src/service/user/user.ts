import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '../../generated/prisma/client'
import { getUserIdByToken } from '../../auth/session'
import { replyError, replySuccess } from '../../utils/reply'
import { HttpStatus } from '@jot-list/shared'

const prisma = new PrismaClient()

export const userInfoService = (instance: FastifyInstance) => {
    // GET /user/get 根据 Authorization 提取用户
    instance.get('/user/get', async (req, reply) => {
        const auth = req.headers.authorization
        const token = typeof auth === 'string' && auth.startsWith('Bearer ')
            ? auth.slice(7).trim()
            : (typeof auth === 'string' ? auth.trim() : '')

        if (!token) {
            return replyError(reply, 'Unauthorized', HttpStatus.UNAUTHORIZED)
        }

        const userId = getUserIdByToken(token)
        if (!userId) {
            return replyError(reply, 'Unauthorized', HttpStatus.UNAUTHORIZED)
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return replyError(reply, '用户不存在', HttpStatus.NOT_FOUND)
        }
        return replySuccess(reply, { id: user.id, userName: user.userName, phone: user.phone })
    })
}


