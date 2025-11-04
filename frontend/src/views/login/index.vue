<template>
    <div class="login-container">
        <form @submit.prevent="onSubmit" class="login-form">
            <div>
                <label>手机号</label>
                <input v-model="phone" type="text" maxlength="32" placeholder="请输入手机号" />
                <span v-if="phoneError" class="error">{{ phoneError }}</span>
            </div>
            <div>
                <label>密码</label>
                <input v-model="password" type="password" maxlength="128" placeholder="请输入密码" />
                <span v-if="passwordError" class="error">{{ passwordError }}</span>
            </div>
            <button type="submit" :disabled="loading">登录</button>
            <span v-if="loginError" class="error">{{ loginError }}</span>
        </form>
    </div>
</template>
<script lang="ts">
export default { title: '登录' }
</script>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PASSWORD_REGEX, type LoginRes } from '@jot-list/shared'
import { useUserStore } from '@/stores/useUserStore'
import { request } from '@/api/ajax/request'

const phone = ref('')
const password = ref('')
const phoneError = ref('')
const passwordError = ref('')
const loginError = ref('')
const loading = ref(false)
const router = useRouter()
const userStore = useUserStore()

function validatePhone(val: string) {
    if (!val) return '手机号不能为空'
    if (!/^\d{6,32}$/.test(val)) return '手机号格式错误'
    return ''
}
function validatePassword(val: string) {
    if (!val) return '密码不能为空'
    if (!PASSWORD_REGEX.test(val)) return '密码必须为6位且包含字母和数字'
    return ''
}

async function onSubmit() {
    phoneError.value = validatePhone(phone.value)
    passwordError.value = validatePassword(password.value)
    loginError.value = ''
    if (phoneError.value || passwordError.value) return
    loading.value = true
    try {
        const res = await request.post<LoginRes>('/login', { phone: phone.value, password: password.value })
        if (res.success) {
            if (res.data?.authorization) {
                userStore.setAuthorization(res.data.authorization)
            }
            router.back()
        } else {
            loginError.value = res.message || '登录失败'
        }
    } catch (e) {
        loginError.value = e?.response?.data?.message || '网络错误'
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.login-container {
    width: 440px;
    margin: 0 auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-50%);
    padding: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: #fff;

    @media screen and (max-width: 1024px) {
        width: 340px;
    }

    @media screen and (max-width: 750px) {
        width: 360px;
    }

    @media screen and (max-width: 600px) {
        width: 380px;
    }
}

.login-form label {
    display: block;
    margin-bottom: 6px;
}

.login-form input {
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.login-form button {
    width: 100%;
    padding: 10px;
    background: #409eff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 18px;
}

.login-form button:disabled {
    background: #bcdcff;
    cursor: not-allowed;
}

.error {
    color: #f56c6c;
    font-size: 13px;
    margin-bottom: 8px;
    display: block;
}
</style>
