<template>
    <div class="views-wrap">
        <router-view v-slot="{ Component }" class="views-content">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>
<script lang="ts">
export default {
    name: 'RootView',
    title: import.meta.env.VITE_SYSTEM_NAME
}
</script>
<script lang="ts" setup></script>
<style lang="scss" scoped>
.views-wrap {
    height: 100%;
}
.views-content {
    padding: 20px 18px;
}
</style>
