<template>
    <div :class="bem.b('wrap')">
        <router-view v-slot="{ Component }" :class="bem.b('content')">
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
<script lang="ts" setup>
import { useBEM } from 'ui-base'
import { useRoute } from 'vue-router'

const bem = useBEM('root-view')

const route = useRoute()
const title = computed(() => route.meta.title)
</script>
<style lang="scss" scoped>
@use 'ui-base/src/style/mixins' as *;

@include namespace(root-view);
@include b(wrap) {
    height: 100%;
}
@include b(content) {
    padding: 20px 18px;
}
</style>
