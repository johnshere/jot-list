import type { FastifyInstance } from 'fastify'
import { removeSession } from '../../auth/session'
import { replySuccess } from '../../utils/reply'

export const logoutService = (instance: FastifyInstance) => {
    instance.post('/user/logout', async (req, reply) => {
        const auth = req.headers.authorization
        const token = typeof auth === 'string' && auth.startsWith('Bearer ')
            ? auth.slice(7).trim()
            : (typeof auth === 'string' ? auth.trim() : '')

        if (token) {
            removeSession(token)
        }

        return replySuccess(reply, true)
    })
}

