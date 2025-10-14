import './assets/style/main.scss'
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import appvue from './App.vue'
import { router } from './router'
import setupComponents from './setup-components'

let app: App<Element>

async function setupApp(rootContainer: Element | string) {
    app = createApp(appvue)
    app.use(createPinia())
    app.use(setupComponents)
    app.use(router)
    app.mount(rootContainer)
}

setupApp('#app')
