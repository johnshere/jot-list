<template>
    <Popover v-model:visible="showPopover" trigger="manual" placement="bottom-end" :offset="10">
        <template #trigger>
            <div class="user-info" @click="togglePopover">
                <div class="user-avatar">{{ initials }}</div>
                <div class="user-details">
                    <div class="user-name">{{ displayName }}</div>
                    <div v-if="displayPhone" class="user-phone">{{ displayPhone }}</div>
                </div>
            </div>
        </template>
        <div class="user-popover">
            <button class="logout-btn" type="button" :disabled="logoutLoading" @click="handleLogout">
                {{ logoutLoading ? '退出中...' : '退出' }}
            </button>
        </div>
    </Popover>
</template>

<script setup lang="ts">
import { computed, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import Popover from '@/components/popover/index.vue'
import { logout as logoutRequest } from '@/api/ajax/common'
import { useUserStore } from '@/stores'
import { toLogin } from '@/libs'

interface UserInfoShape {
    userName?: string | null
    phone?: string | null
}

const props = defineProps<{ user: MaybeRefOrGetter<UserInfoShape> }>()

const userStore = useUserStore()
const showPopover = ref(false)
const logoutLoading = ref(false)

const userData = computed<UserInfoShape>(() => toValue(props.user) ?? {})

const displayName = computed(() => userData.value.userName?.trim() || '用户')
const displayPhone = computed(() => userData.value.phone?.trim() || '')
const initials = computed(() => displayName.value.charAt(0).toUpperCase() || 'U')

const togglePopover = () => {
    showPopover.value = !showPopover.value
}

const closePopover = () => {
    showPopover.value = false
}

const handleLogout = async () => {
    if (logoutLoading.value) return
    logoutLoading.value = true
    try {
        const res = await logoutRequest()
        if (res.success) {
            userStore.clearAuthorization()
            userStore.clearUserInfo()
            closePopover()
            toLogin()
        }
    } finally {
        logoutLoading.value = false
    }
}
</script>

<style scoped lang="scss">
.user-info {
    height: 64px;
    padding: 0 18px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:hover {
        background: var(--color-light);
    }
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
        135deg,
        var(--color-primary) 0%,
        color-mix(in srgb, var(--color-primary) 60%, transparent) 100%
    );
    color: var(--color-on-primary);
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
    text-transform: uppercase;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.4;
}

.user-phone {
    font-size: 12px;
    color: var(--color-secondary);
    line-height: 1.4;
}

.user-popover {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 120px;
}

.logout-btn {
    width: 100%;
    padding: 4px 12px;
    border: 0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    color: var(--color-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;

    &:hover {
        background: var(--color-primary);
        color: var(--color-on-primary);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
}
</style>
