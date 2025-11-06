<template>
    <div class="home-container"></div>
</template>
<script lang="ts">
export default { title: '随想', path: '' }
</script>
<script setup lang="ts">
const router = useRouter()
router.replace('/space/dashboard')
</script>

<style lang="scss" scoped></style>
