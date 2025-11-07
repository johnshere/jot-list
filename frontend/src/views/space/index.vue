<template>
    <div class="space-container" :class="{ 'is-collapsed': collapsed }">
        <header class="space-header">
            <div class="system" @click="goHome">
                <span class="system-logo">{{ SystemLogo }}</span>
                <span class="system-title">{{ SystemTitle }}</span>
            </div>
            <div class="header-actions">
                <User :user="userInfo" />
            </div>
        </header>

        <aside class="space-sidebar">
            <nav class="menu">
                <router-link
                    v-for="m in menus"
                    :key="m.path"
                    :to="`/space/${m.path}`"
                    class="menu-item"
                    :class="{ active: isActive(m.path) }"
                >
                    <span class="menu-icon"></span>
                    <span class="menu-text">{{ m.label }}</span>
                </router-link>
            </nav>
            <div class="sidebar-footer">
                <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? '展开菜单' : '收起菜单'">
                    <span class="collapse-icon">{{ collapsed ? '▶' : '◀' }}</span>
                    <span class="collapse-text">{{ collapsed ? '展开' : '收起' }}</span>
                </button>
            </div>
        </aside>

        <main class="space-content">
            <div class="content-wrapper">
                <router-view v-slot="{ Component }">
                    <transition name="fade-slide" mode="out-in">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </main>
    </div>
</template>
<script lang="ts">
export default { title: '空间' }
</script>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SystemLogo, SystemTitle } from '@jot-list/shared'
import { useUserStore } from '@/stores'
import User from '@/components/user/index.vue'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const { userInfo } = storeToRefs(userStore)

function toggleCollapse() {
    collapsed.value = !collapsed.value
}
function isActive(path: string) {
    return route.path.startsWith(`/space/${path}`)
}
function goHome() {
    const first = menus.value[0]
    if (first) router.replace(`/space/${first.path}`)
    else router.replace('/')
}

type MenuItem = { path: string; label: string }
const modules = import.meta.glob<View>('./*/index.vue', { eager: true })
const menus = computed<MenuItem[]>(() => {
    return Object.entries(modules)
        .map(([k, mod]) => {
            const m = mod?.default ?? {}
            const folder = /\.\/([^/]+)\/index\.vue$/.exec(k)?.[1] ?? ''
            return { path: m.path || folder, label: m.title || folder, sort: m.sort ?? 0 }
        })
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})
</script>
<style lang="scss" scoped>
@use '@/assets/style/mixins.scss' as *;

$header-height: 64px;
$sidebar-width: 240px;
$sidebar-width-collapsed: 64px;
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

.space-container {
    min-height: 100vh;
    background: linear-gradient(
        135deg,
        var(--color-bg) 0%,
        color-mix(in srgb, var(--color-bg) 70%, var(--color-surface)) 100%
    );
}

.space-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-surface);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid color-mix(in srgb, var(--color-muted) 85%, transparent);
    // box-shadow: $shadow-sm;
    z-index: 1000;
}

.system {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 24px;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
}

.system-logo {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
        135deg,
        var(--color-primary) 0%,
        color-mix(in srgb, var(--color-primary) 60%, transparent) 100%
    );
    color: var(--color-on-primary);
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.system-title {
    font-weight: 600;
    font-size: 18px;
    color: var(--color-text);
    letter-spacing: 0.5px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.space-sidebar {
    position: fixed;
    top: $header-height;
    left: 0;
    bottom: 0;
    width: $sidebar-width;
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--color-surface);
    border-right: 1px solid var(--color-muted);
    // box-shadow: $shadow-md;
    overflow: hidden;
    z-index: 999;
}

.space-container.is-collapsed .space-sidebar {
    width: $sidebar-width-collapsed;
}

.menu {
    flex: 1;
    padding: 16px 12px;
    overflow: hidden;
    @include scrollbary;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 4px;
    border-radius: 10px;
    color: var(--color-primary);
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: var(--color-primary);
        border-radius: 0 2px 2px 0;
        transition: height 0.25s ease;
    }

    &:hover {
        background: var(--color-light);
        transform: translateX(2px);
    }

    &.active {
        background: var(--color-light);
        font-weight: 600;

        &::before {
            height: 60%;
        }
    }
}

.menu-icon {
    font-size: 18px;
    flex-shrink: 0;
    width: 20px;
    text-align: center;
}

.menu-text {
    white-space: nowrap;
    font-size: 16px;
    transition: opacity 0.2s ease;
}

.space-container.is-collapsed .menu-text {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.sidebar-footer {
    padding: 12px;
    // border-top: 1px solid $border-color;
}

.collapse-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--color-muted);
    background: var(--color-surface);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-secondary);
    font-size: 13px;

    &:hover {
        background: var(--color-light);
        border-color: var(--color-light);
        color: var(--color-primary);
        transform: translateY(-1px);
        box-shadow: $shadow-sm;
    }

    &:active {
        transform: translateY(0);
    }
}

.collapse-icon {
    font-size: 12px;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.collapse-text {
    white-space: nowrap;
    transition: opacity 0.2s ease;
}

.space-container.is-collapsed .collapse-text {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.space-content {
    padding: $header-height 0 0 $sidebar-width;
    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: calc(100vh - #{$header-height});
}

.space-container.is-collapsed .space-content {
    padding-left: $sidebar-width-collapsed;
}

.content-wrapper {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
}

// 子路由切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
}
</style>
