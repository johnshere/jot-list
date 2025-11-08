import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/ajax/common'
import type { User } from '@jot-list/shared'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<User | null>(null)
    const Authorization = ref(localStorage.getItem('Authorization') || '')
    const clearAuthorization = () => {
        Authorization.value = ''
        localStorage.removeItem('Authorization')
    }
    const setAuthorization = (token: string) => {
        Authorization.value = token
        localStorage.setItem('Authorization', token)
    }
    const clearUserInfo = () => {
        userInfo.value = null
    }

    const fetchUserInfo = async () => {
        const res = await getUserInfo()
        if (res.success) {
            userInfo.value = res.data
            return res.data
        }
    }
    return {
        userInfo,
        Authorization,
        fetchUserInfo,
        clearAuthorization,
        setAuthorization,
        clearUserInfo
    }
})
