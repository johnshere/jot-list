import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { loginService } from './login'
import { userInfoService } from './user'
import { logoutService } from './logout'

export const userService: FastifyPluginAsync = async (instance: FastifyInstance) => {
    loginService(instance)
    userInfoService(instance)
    logoutService(instance)
}
