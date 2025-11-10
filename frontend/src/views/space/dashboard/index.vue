<template>
    <div class="dashboard-container">
        <TitleWithTag v-model="title" />
    </div>
</template>
<script lang="ts">
export default { title: '仪表盘', sort: 10 }
</script>
<script setup lang="ts">
import TitleWithTag, { type TitleTagModel } from '@/components/title-with-tag/index.vue'

const title = ref({} as TitleTagModel)
</script>

<style lang="scss" scoped></style>
