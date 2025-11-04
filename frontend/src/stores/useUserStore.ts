import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getToken } from '@/api/ajax/common'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref({
        userId: '',
        userName: '',
        phone: ''
    })
    const Authorization = ref(localStorage.getItem('Authorization') || '')
    const clearAuthorization = () => (Authorization.value = '')
    const setAuthorization = (token: string) => {
        Authorization.value = token
        localStorage.setItem('Authorization', token)
    }
    const fetchUserInfo = async () => {}
    return {
        userInfo,
        Authorization,
        fetchUserInfo,
        clearAuthorization,
        setAuthorization
    }
})
