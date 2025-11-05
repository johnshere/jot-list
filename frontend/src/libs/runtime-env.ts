export const toLogin = () => {
    localStorage.removeItem('Authorization')
    const router = useRouter()
    const path = router.currentRoute.value.fullPath
    router.push(`/login?redirect=${path}`)
}
