import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

const itemsRoutes: FastifyPluginAsync = async (instance: FastifyInstance) => {
  // Example API route for jot-list items (placeholder)
  instance.get('/items', async () => ({ items: [] }))
}

export default itemsRoutes