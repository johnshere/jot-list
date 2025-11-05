import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/ajax/common'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref({
        id: '',
        userName: '',
        phone: ''
    })
    const Authorization = ref(localStorage.getItem('Authorization') || '')
    const clearAuthorization = () => (Authorization.value = '')
    const setAuthorization = (token: string) => {
        Authorization.value = token
        localStorage.setItem('Authorization', token)
    }
    const fetchUserInfo = async () => {
        const res = await getUserInfo()
        if (res.success) {
            const data = res.data
            userInfo.value = {
                id: String(data.id ?? ''),
                userName: data.userName ?? '',
                phone: data.phone ?? ''
            }
        }
        return res
    }
    return {
        userInfo,
        Authorization,
        fetchUserInfo,
        clearAuthorization,
        setAuthorization
    }
})
