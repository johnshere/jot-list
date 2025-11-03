import type { App } from 'vue'
import directives from '@/api/directives'
import '@/libs/flexable'

export default {
    install(app: App) {
        app.use(directives)
    }
}
