<template>
    <div class="input-tag"></div>
</template>
<script setup lang="ts">
import type { Jot } from '@jot-list/shared'

type TagType = keyof Omit<Jot, 'id' | 'userId' | 'content' | 'tags' | 'createTime' | 'updateTime' | 'isDeleted'>
type TagItem = {
    text: string
    type: TagType
}
const props = defineProps<{
    modelValue: Record<TagType, string>
}>()
const emit = defineEmits<{
    (event: 'update:modelValue', value: Record<TagType, string>): void
}>()
const TagColor: Record<TagType, string> = {
    title: 'var(--color-primary)',
    startTime: 'var(--color-success)',
    endTime: 'var(--color-success)',
    startDate: 'var(--color-success)',
    endDate: 'var(--color-success)',
    isImportant: 'var(--color-warning)',
    isUrgent: 'var(--color-warning)',
    isCompleted: 'var(--color-warning)'
}
const inputValue = ref<string>('')
const showInput = computed<TagItem[]>(() => {
    return [{ text: inputValue.value, type: 'title' }]
})
</script>
