import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getToken } from '@/api/ajax/common'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref({
        userId: '',
        userName: '',
        phone: ''
    })
    const Authorization = ref('')
    const getAuthorization = async () => {
        const res = await getToken()
        if (!res?.success) return
        // 允许从缓存中获取，便于调试
        let token = res.data as string | null
        if (!token && import.meta.env.DEV) {
            token = decodeURIComponent(location.href.split('&Auth=').pop() || '')
        }
        if (token) {
            Authorization.value = token
        } else {
            console.log('获取的token数据为空')
        }
    }
    const clearAuthorization = () => (Authorization.value = '')
    const fetchUserInfo = async () => {}
    return {
        userInfo,
        Authorization,
        getAuthorization,
        fetchUserInfo,
        clearAuthorization
    }
})
