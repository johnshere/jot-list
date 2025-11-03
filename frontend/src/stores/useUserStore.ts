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
        // 兼容标准 HTTP 响应：可能直接返回字符串或对象
        if (res.data) {
            Authorization.value = res.data
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
