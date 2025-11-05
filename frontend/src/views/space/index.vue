<template>
    <div class="space-container">
        <div class="space-header">
            <h1>header</h1>
        </div>
        <div class="space-sidebar">sidebar</div>
        <div class="space-content">
            <router-view v-slot="{ Component }" class="space-container">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
    </div>
</template>
<script lang="ts">
export default { title: '空间', path: '' }
</script>
<script setup lang="ts">
const router = useRouter()
</script>
<style lang="scss" scoped>
$header-height: 60px;
$sidebar-width: 200px;

.space-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: $header-height;
    background-color: #fff;
    z-index: 100;
}

.space-sidebar {
    position: fixed;
    width: $sidebar-width;
    top: $header-height;
    left: 0;
    bottom: 0;
    background-color: #fff;
}

.space-content {
    flex: 1;
    padding: $header-height 0 0 $sidebar-width;
}
</style>
