<template>
    <div class="space-container" :class="{ 'is-collapsed': collapsed }">
        <header class="space-header">
            <div class="system" @click="goHome">
                <span class="system-logo">{{ SystemLogo }}</span>
                <span class="system-title">{{ SystemTitle }}</span>
            </div>
            <div class="header-actions">
                <div class="user-info">
                    <div class="user-avatar">
                        {{ userInfo.userName?.[0]?.toUpperCase() || 'U' }}
                    </div>
                    <div class="user-details">
                        <div class="user-name">{{ userInfo.userName || '用户' }}</div>
                        <div class="user-phone">{{ userInfo.phone || '' }}</div>
                    </div>
                </div>
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

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const userInfo = computed(() => userStore.userInfo)

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
$header-height: 64px;
$sidebar-width: 240px;
$sidebar-width-collapsed: 64px;
$primary-color: #409eff;
$primary-hover: #66b1ff;
$primary-active: #3a8ee6;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #e4e7ed;
$bg-color: #f5f7fa;
$menu-active-bg: #f7fbff;
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

.space-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
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
    padding: 0 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid rgba(228, 231, 237, 0.8);
    // box-shadow: $shadow-sm;
    z-index: 1000;
}

.system {
    display: flex;
    align-items: center;
    gap: 12px;
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
    background: linear-gradient(135deg, $primary-color 0%, $primary-hover 100%);
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.system-title {
    font-weight: 600;
    font-size: 18px;
    color: $text-primary;
    letter-spacing: 0.5px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:hover {
        background: rgba(64, 158, 255, 0.08);
    }
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $primary-color 0%, $primary-hover 100%);
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.4;
}

.user-phone {
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.4;
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
    background: #fff;
    border-right: 1px solid $border-color;
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
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
    }
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 4px;
    border-radius: 10px;
    color: $text-regular;
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
        background: $primary-color;
        border-radius: 0 2px 2px 0;
        transition: height 0.25s ease;
    }

    &:hover {
        background: rgba(64, 158, 255, 0.08);
        color: $primary-color;
        transform: translateX(2px);
    }

    &.active {
        background: $menu-active-bg;
        color: $primary-active;
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
    border: 1px solid $border-color;
    background: #fff;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: $text-regular;
    font-size: 13px;

    &:hover {
        background: rgba(64, 158, 255, 0.08);
        border-color: $primary-color;
        color: $primary-color;
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
