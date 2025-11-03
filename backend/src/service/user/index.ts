import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { loginService } from './login'

export const userService: FastifyPluginAsync = async (instance: FastifyInstance) => {
    loginService(instance)
}
