<template>
    <router-view v-slot="{ Component }" class="views-content">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </router-view>
</template>
<script lang="ts">
export default {
    name: 'RootView',
    title: import.meta.env.VITE_SYSTEM_NAME
}
</script>
<script lang="ts" setup></script>
<style lang="scss" scoped></style>
