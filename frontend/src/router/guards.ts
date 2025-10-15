import { nprogress } from '@/libs/index'
import type { Router } from 'vue-router'
import { useUserStore } from '@/stores'
import { isRouteOrMenu } from '@/libs/permission'
const whiteList = ['/forbidden']
export const useGuards = (router: Router & { previous?: string }) => {
    //导航守卫
    router.beforeEach(async (to, from, next) => {
        const userStore = useUserStore()
        // console.log(
        //     to.path,
        //     whiteList.some(item => to.path.includes(item)),
        //     userStore.Authorization
        // )
        if (to.path.includes('undefined') || to.path === '/') {
            if (router.previous) return next(router.previous)
        }
        if (to.path !== from.path) router.previous = from.fullPath
        if (!whiteList.some(item => to.path.includes(item))) {
            if (!userStore.Authorization) {
                try {
                    await userStore.getAuthorization()
                    await userStore.fetchUserInfo()
                } catch (error) {
                    console.log(error)
                }
            }
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
