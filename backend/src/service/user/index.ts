import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { loginService } from './login'
import { userInfoService } from './user'

export const userService: FastifyPluginAsync = async (instance: FastifyInstance) => {
    loginService(instance)
    userInfoService(instance)
}
