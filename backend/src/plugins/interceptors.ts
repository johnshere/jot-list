import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { ApiPrefix, NoAuthPaths } from '../config/constants'
import { BizCode, HttpStatus } from '@jot-list/shared'

// 登录拦截器：放行 OPTIONS 与白名单路由，其余要求 Bearer Token
const authInterceptor: FastifyPluginAsync = async (instance: FastifyInstance) => {
    instance.addHook('onRequest', async (req, reply) => {
        const method = req.method
        const path = req.url.split('?')[0]
        // 将相对公开路径映射为完整路径（带前缀），避免匹配失误
        const noAuthPathsFull = new Set<string>([...NoAuthPaths].map(p => `${ApiPrefix}${p}`))
        if (method === 'OPTIONS' || noAuthPathsFull.has(path)) {
            return
        }

        const auth = req.headers.authorization
        const hasBearer = typeof auth === 'string' && auth.startsWith('Bearer ') && auth.slice(7).trim().length > 0
        if (!hasBearer) {
            reply.code(HttpStatus.UNAUTHORIZED).send({ error: BizCode.LOGIN_REQUIRED, message: 'Unauthorized' })
            return
        }
    })
}

export { authInterceptor }
