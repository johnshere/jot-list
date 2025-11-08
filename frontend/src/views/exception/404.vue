<template>
    <div class="exception404-wrap">
        <div class="exception404-content">
            <div class="code">404</div>
            <div class="message">页面不存在或已被移除</div>
            <div class="actions">
                <button class="btn primary" @click="goHome">返回首页</button>
                <button class="btn" @click="goBack">返回上一页</button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => router.push('/')
const goBack = () => router.back()
</script>

<style scoped lang="scss">
.exception404-wrap {
    height: 100%;
    padding: 36px;
}

.exception404-content {
    text-align: center;
    margin: 36px auto;
}

.code {
    font-size: 90px;
    font-weight: 700;
    line-height: 1;
    color: var(--color-text);
}

.message {
    margin-top: 16px;
    font-size: var(--font-size-md);
    color: var(--color-secondary);
}

.actions {
    margin-top: 26px;
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--color-muted) 85%, transparent);
    background: var(--color-surface);
    color: var(--color-secondary);
    cursor: pointer;
    font-size: var(--font-size-md);
}

.btn.primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-on-primary);
}

.btn:hover {
    filter: brightness(0.95);
}
</style>
