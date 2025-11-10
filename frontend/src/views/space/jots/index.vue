<template>
    <router-view v-slot="{ Component }">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </router-view>
</template>
<script lang="ts">
export default { title: '清单表', sort: 20 }
</script>
<script lang="ts" setup></script>
<style lang="scss" scoped></style>
