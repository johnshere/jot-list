import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { jotListService } from './list'

export const jotService: FastifyPluginAsync = async (instance: FastifyInstance) => {
    jotListService(instance)
}
