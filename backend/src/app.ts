import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { ApiPrefix } from './config/constants'
import { authInterceptor } from './plugins/interceptors'
import { userService } from './service/user'

export async function buildApp(): Promise<FastifyInstance> {
    const app = Fastify({ logger: true })

    await app.register(cors, { origin: true })

    // 统一注册到 /api 前缀下，并挂载拦截器与路由分组
    await app.register(
        async instance => {
            await instance.register(authInterceptor)
            await instance.register(userService)
        },
        { prefix: ApiPrefix }
    )

    return app
}

export default buildApp
