import type { FastifyInstance } from 'fastify'

export const loginService = (instance: FastifyInstance) => {
    instance.get('/login', async () => ({ status: 'ok' }))
}
