<template>
    <div class="input-tag"></div>
</template>
<script setup lang="ts">
type TagType = 'text' | 'tag' | 'time'
type TagItem = {
    text: string
    type: TagType
}
const props = defineProps<{
    modelValue: TagItem[]
}>()
const emit = defineEmits<{
    (event: 'update:modelValue', value: TagItem[]): void
}>()
const TagColor: Record<TagType, string> = {
    text: 'var(--color-primary)',
    tag: 'var(--color-secondary)',
    time: 'var(--color-success)'
}
const showInput = computed<TagItem[]>(() => {
    return props.modelValue.map(item => {
        if (typeof item === 'string') {
            return {
                text: item,
                type: 'text'
            }
        }
        return item
    })
})
</script>
