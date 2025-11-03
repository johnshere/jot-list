import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.get('/health', async () => ({ status: 'ok' }))
}

export default healthRoutes