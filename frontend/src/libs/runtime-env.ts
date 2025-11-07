import { router } from '@/router'

export const toLogin = () => {
    localStorage.removeItem('Authorization')
    const path = router?.currentRoute.value.fullPath
    router.push(`/login?redirect=${path}`)
}
