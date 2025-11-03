import Fastify from 'fastify'
import cors from '@fastify/cors'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })

app.get('/health', async () => ({ status: 'ok' }))

// Example API route for jot-list items (placeholder)
app.get('/api/items', async () => ({ items: [] }))

const port = Number(process.env.PORT ?? 3000)
try {
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`Backend listening on http://localhost:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}