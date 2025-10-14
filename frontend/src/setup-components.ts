import type { App } from 'vue'
import directives from '@/api/directives'

export default {
    install(app: App) {
        app.use(directives)
    }
}
