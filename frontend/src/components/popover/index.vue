<template>
    <div ref="wrapperRef" class="popover-wrapper" :class="[`popover-wrapper--${placement}`]">
        <div class="popover-trigger" @click="onTriggerClick" @mouseenter="onTriggerEnter" @mouseleave="onTriggerLeave">
            <slot name="trigger" />
        </div>
        <transition :name="transitionName">
            <div
                v-if="isVisible"
                class="popover"
                :class="[`popover--${placement}`]"
                :style="contentStyle"
                @mouseenter="onContentEnter"
                @mouseleave="onContentLeave"
                @click.stop
            >
                <span class="popover-arrow" aria-hidden="true"></span>
                <div class="popover-inner">
                    <slot />
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        visible?: boolean
        placement?: 'bottom-start' | 'bottom-end' | 'bottom-center'
        offset?: number
        width?: string | number
        transitionName?: string
        trigger?: 'click' | 'hover' | 'manual'
        closeOnOutside?: boolean
    }>(),
    {
        placement: 'bottom-end',
        offset: 12,
        transitionName: 'popover-fade',
        trigger: 'click',
        closeOnOutside: true
    }
)

const emit = defineEmits<{
    (event: 'update:visible', value: boolean): void
    (event: 'show'): void
    (event: 'hide'): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const internalVisible = ref<boolean>(props.visible ?? false)
const isControlled = computed(() => props.visible !== undefined)

watch(
    () => props.visible,
    value => {
        if (value !== undefined) {
            internalVisible.value = value
        }
    }
)

const isVisible = computed(() => props.visible ?? internalVisible.value)

const contentStyle = computed(() => {
    const styles: Record<string, string> = {
        marginTop: `${props.offset}px`
    }
    if (props.width !== undefined) {
        styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
    }
    return styles
})

const transitionName = computed(() => props.transitionName)

const hide = () => {
    if (!isVisible.value) return
    if (!isControlled.value) {
        internalVisible.value = false
    }
    emit('update:visible', false)
    emit('hide')
}

const show = () => {
    if (isVisible.value) return
    if (!isControlled.value) {
        internalVisible.value = true
    }
    emit('update:visible', true)
    emit('show')
}

const toggle = () => {
    if (isVisible.value) hide()
    else show()
}

const onTriggerClick = () => {
    if (props.trigger === 'click') {
        toggle()
    }
}

const onTriggerEnter = () => {
    if (props.trigger === 'hover') show()
}

const onTriggerLeave = () => {
    if (props.trigger === 'hover') hide()
}

const onContentEnter = () => {
    if (props.trigger === 'hover') show()
}

const onContentLeave = () => {
    if (props.trigger === 'hover') hide()
}

const handleOutsideClick = (event: MouseEvent) => {
    if (!props.closeOnOutside) return
    const target = event.target as Node | null
    if (!target) return
    if (!wrapperRef.value?.contains(target)) {
        hide()
    }
}

watch(
    isVisible,
    value => {
        if (value) {
            document.addEventListener('mousedown', handleOutsideClick)
        } else {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<style scoped lang="scss">
.popover-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.popover-trigger {
    display: inline-flex;
    align-items: center;
}

.popover {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 120px;
    border-radius: 12px;
    background-color: var(--color-surface);
    border: 1px solid color-mix(in srgb, var(--color-muted) 80%, transparent);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    z-index: 2000;
}

.popover-inner {
    padding: 18px;
}

.popover-arrow {
    position: absolute;
    top: -9px;
    right: 18px;
    width: 18px;
    height: 18px;
    background: var(--color-surface);
    border-left: 1px solid color-mix(in srgb, var(--color-muted) 80%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--color-muted) 80%, transparent);
    transform: rotate(45deg);
    pointer-events: none;
}

.popover--bottom-start {
    right: auto;
    left: 0;
}

.popover--bottom-start .popover-arrow {
    left: 18px;
    right: auto;
}

.popover--bottom-center {
    right: 50%;
    transform: translateX(50%);
}

.popover--bottom-center .popover-arrow {
    right: 50%;
    transform: translateX(50%) rotate(45deg);
}

.popover-fade-enter-active,
.popover-fade-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
