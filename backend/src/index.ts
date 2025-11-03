import { buildApp } from './app'
import type { FastifyInstance } from 'fastify'
import { DefaultPort, HostBind } from './config/constants'

const port = Number(process.env.PORT ?? DefaultPort)
let app: FastifyInstance | undefined
try {
    app = await buildApp()
    await app.listen({ port, host: HostBind })
    app.log.info(`Backend listening on http://localhost:${port}`)
} catch (err) {
    if (app) {
        app.log.error(err as Error)
    } else {
        console.error(err)
    }
    process.exit(1)
}
