import { nprogress } from '@/libs/index'
import type { Router } from 'vue-router'
import { useUserStore } from '@/stores'
import { isRouteOrMenu } from '@/libs/permission'
const whiteList = ['/forbidden', '/login']
export const useGuards = (router: Router & { previous?: string }) => {
    //导航守卫
    router.beforeEach(async (to, from, next) => {
        const userStore = useUserStore()
        if (!whiteList.some(item => to.path.includes(item))) {
            if (!userStore.Authorization) {
                next({ path: '/login' })
                return
            }
            await userStore.fetchUserInfo()
            const isExists = router.getRoutes().some(r => r.path === to.path)
            if (isExists) {
                const isAllowed = await isRouteOrMenu(to.path)
                if (!isAllowed) {
                    return next(`/forbidden`)
                }
            }
        }
        nprogress.start()
        next()
    })
    router.afterEach(to => {
        nprogress.done()
        if (to.meta.title) document.title = to.meta.title as string
    })
    router.onError(error => {
        nprogress.done()
        console.error(error)
    })
}
