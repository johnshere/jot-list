<template>
    <div class="jots-page">
        <div class="jots-scroll" ref="scrollContainer">
            <div
                class="pull-indicator"
                :class="{ 'pull-indicator--active': pullState.distance > 0 || state.refreshing || state.loading }"
                :style="{ height: `${pullState.distance}px` }"
            >
                <div class="pull-indicator__content">
                    <span v-if="state.refreshing || state.loading">刷新中…</span>
                    <span v-else>{{ pullState.distance >= pullThreshold ? '释放刷新' : '下拉刷新' }}</span>
                </div>
            </div>

            <section class="page-header">
                <div class="page-title">
                    <div>
                        <h1>我的清单</h1>
                        <p>{{ headerSubtitle }}</p>
                    </div>
                    <div>
                        <button class="add-btn" @click="handleAddJot">
                            <span class="add-text">添加</span>
                        </button>
                    </div>
                </div>
                <div class="metric-strip">
                    <div
                        v-for="metric in metrics"
                        :key="metric.key"
                        class="metric-card"
                        :class="`metric-card--${metric.key}`"
                    >
                        <span class="metric-value">{{ metric.value }}</span>
                        <span class="metric-label">{{ metric.label }}</span>
                    </div>
                </div>
            </section>

            <section class="filter-bar">
                <div class="filter-scroll">
                    <div class="filter-field">
                        <label for="filter-title">标题</label>
                        <input
                            id="filter-title"
                            v-model="filters.title"
                            type="search"
                            placeholder="搜索标题关键字"
                            autocomplete="off"
                        />
                    </div>
                    <div class="filter-field">
                        <label for="filter-start">开始日期</label>
                        <input id="filter-start" v-model="filters.startDate" type="date" />
                    </div>
                    <div class="filter-field">
                        <label for="filter-end">结束日期</label>
                        <input
                            id="filter-end"
                            v-model="filters.endDate"
                            type="date"
                            :min="filters.startDate || undefined"
                        />
                    </div>
                </div>
                <div class="filter-actions">
                    <button type="button" class="reset-btn" @click="resetFilters">重置</button>
                </div>
            </section>

            <section class="card-grid">
                <template v-if="state.initialLoading">
                    <article v-for="s in 4" :key="`skeleton-${s}`" class="card card--placeholder">
                        <div class="card-thumb skeleton"></div>
                        <div class="card-body">
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text skeleton-text--short"></div>
                        </div>
                    </article>
                </template>

                <template v-else>
                    <article v-for="item in state.list" :key="item.id" class="card" @click="openEditor(item.id)">
                        <div class="card-thumb">
                            <img v-if="item.thumbnail" :src="item.thumbnail" alt="" loading="lazy" />
                            <div v-else class="card-thumb__placeholder" :style="getPlaceholderStyle(item)">
                                <span>{{ getInitial(item.title) }}</span>
                            </div>
                            <div class="card-thumb__badges">
                                <span v-if="item.isImportant" class="thumb-badge thumb-badge--important">重要</span>
                                <span v-if="item.isUrgent" class="thumb-badge thumb-badge--urgent">紧急</span>
                                <span v-if="item.isCompleted" class="thumb-badge thumb-badge--completed">完成</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <header class="card-header">
                                <h3 class="card-title">{{ item.title || '未命名清单' }}</h3>
                                <span v-if="item.isCompleted" class="card-status card-status--done">已完成</span>
                                <span v-else class="card-status card-status--active">进行中</span>
                            </header>
                            <div class="card-flags">
                                <span v-if="item.isImportant" class="flag flag--important">重点</span>
                                <span v-if="item.isUrgent" class="flag flag--urgent">优先</span>
                                <span
                                    v-if="!item.isCompleted && !item.isImportant && !item.isUrgent"
                                    class="flag flag--normal"
                                >
                                    待处理
                                </span>
                            </div>
                            <p class="card-summary">{{ item.summary || '暂无摘要' }}</p>
                            <div v-if="item.tags.length" class="card-tags">
                                <span v-for="tag in item.tags" :key="tag" class="chip">#{{ tag }}</span>
                            </div>
                            <div class="card-meta">
                                <span class="meta-item">
                                    <span class="meta-dot"></span>
                                    {{ formatDateRange(item) || '时间未设定' }}
                                </span>
                                <span class="meta-item">更新于 {{ formatUpdate(item.updateTime) }}</span>
                            </div>
                        </div>
                    </article>

                    <div v-if="!state.loading && !state.list.length" class="empty-state">
                        <h3>没有找到清单</h3>
                        <p>请尝试调整搜索条件或创建新的清单。</p>
                    </div>
                </template>
            </section>

            <div class="load-status">
                <div v-if="state.loadingMore" class="load-status__item">
                    <span class="spinner"></span>
                    <span>加载中…</span>
                </div>
                <div v-else-if="!state.hasMore && state.list.length" class="load-status__item load-status__item--done">
                    已经到底啦
                </div>
            </div>

            <div ref="loadMoreTrigger" class="observer-trigger"></div>
        </div>
    </div>
</template>
<script lang="ts">
export default { title: '清单表', path: '' }
</script>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import type { JotListItem, JotListResponse } from '@jot-list/shared'
import { fetchJotList } from '@/api/jot'
import { useRouter } from 'vue-router'

const router = useRouter()

const scrollContainer = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const filters = reactive({
    title: '',
    startDate: '',
    endDate: ''
})

const state = reactive({
    list: [] as JotListItem[],
    currentPage: 0,
    pageSize: 12,
    total: 0,
    hasMore: true,
    loading: false,
    loadingMore: false,
    refreshing: false,
    initialLoading: true
})

const pullState = reactive({
    active: false,
    startY: 0,
    distance: 0
})
const pullThreshold = 70

let filterTimer: number | undefined
let loadObserver: IntersectionObserver | null = null

const metrics = computed(() => {
    const list = state.list
    const total = state.total || list.length
    const completed = list.filter(item => item.isCompleted).length
    const focus = list.filter(item => item.isImportant || item.isUrgent).length
    const active = Math.max(total - completed, 0)
    return [
        { key: 'active', label: '待处理', value: active },
        { key: 'done', label: '已完成', value: completed },
        { key: 'focus', label: '重点关注', value: focus }
    ]
})

const headerSubtitle = computed(() => {
    if (state.loading && !state.list.length) {
        return '正在加载清单...'
    }
    const total = state.total || state.list.length
    if (!total) {
        return '还没有清单，开始记录你的第一条吧'
    }
    const completed = metrics.value.find(metric => metric.key === 'done')?.value ?? 0
    if (!completed) {
        return `共 ${total} 条清单，等待安排`
    }
    return `共 ${total} 条清单，已完成 ${completed} 条`
})

const getPlaceholderStyle = (item: Pick<JotListItem, 'id' | 'title'>): CSSProperties => {
    const key = (item.id || item.title || 'jot').split('').reduce((acc, cur) => acc + cur.charCodeAt(0), 0)
    const hue = key % 360
    const hue2 = (hue + 30) % 360
    return {
        background: `linear-gradient(135deg, hsl(${hue}, 75%, 85%), hsl(${hue2}, 70%, 70%))`
    }
}

const getInitial = (text: string): string => {
    if (!text) return 'J'
    return text.trim().slice(0, 1).toUpperCase()
}

const normalizedFilters = computed(() => ({
    title: filters.title.trim(),
    startDate: filters.startDate || '',
    endDate: filters.endDate || ''
}))

const resetFilters = () => {
    filters.title = ''
    filters.startDate = ''
    filters.endDate = ''
}

const pad = (value: number): string => value.toString().padStart(2, '0')

const formatUpdate = (iso: string): string => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatDateRange = (item: JotListItem): string => {
    const datePart = [item.startDate, item.endDate].filter(Boolean).join(' ~ ')
    const timePart = [item.startTime, item.endTime].filter(Boolean).join(' - ')
    return [datePart, timePart].filter(Boolean).join(' ')
}

const loadPage = async (page: number, append: boolean) => {
    if (state.loading || state.loadingMore) return

    if (append) {
        state.loadingMore = true
    } else {
        state.loading = true
        if (!state.refreshing) {
            state.initialLoading = state.list.length === 0
        }
    }

    try {
        const res = await fetchJotList({
            page,
            pageSize: state.pageSize,
            title: normalizedFilters.value.title || undefined,
            startDate: normalizedFilters.value.startDate || undefined,
            endDate: normalizedFilters.value.endDate || undefined
        })

        if (res.success) {
            const data: JotListResponse = res.data
            state.pageSize = data.pageSize
            state.total = data.total
            state.hasMore = data.hasMore
            state.currentPage = data.page
            state.list = append ? [...state.list, ...data.list] : data.list
        }
    } finally {
        state.loading = false
        state.loadingMore = false
        state.refreshing = false
        state.initialLoading = false
    }
}

const initialize = async () => {
    await loadPage(1, false)
}

const triggerRefresh = async (options?: { usePull?: boolean }) => {
    if (state.loading || state.refreshing) return
    state.hasMore = true
    state.refreshing = !!options?.usePull
    await loadPage(1, false)
}

const loadMore = async () => {
    if (!state.hasMore || state.loading || state.loadingMore) return
    await loadPage(state.currentPage + 1, true)
}

const openEditor = (id?: string) => {
    router.push(id ? `./jots/editor?id=${id}` : './jots/editor')
}

const handleAddJot = () => {
    openEditor()
}

const scheduleFilterRefresh = () => {
    if (filterTimer) {
        window.clearTimeout(filterTimer)
    }
    filterTimer = window.setTimeout(() => {
        triggerRefresh()
    }, 320)
}

const handleTouchStart = (event: TouchEvent) => {
    const container = scrollContainer.value
    if (!container) return
    if (container.scrollTop > 0 || state.loading || state.refreshing) {
        pullState.active = false
        pullState.distance = 0
        return
    }
    const touch = event.touches?.[0]
    if (!touch) {
        pullState.active = false
        pullState.distance = 0
        return
    }
    pullState.active = true
    pullState.startY = touch.clientY
    pullState.distance = 0
}

const handleTouchMove = (event: TouchEvent) => {
    if (!pullState.active) return
    const touch = event.touches?.[0]
    if (!touch) {
        pullState.active = false
        pullState.distance = 0
        return
    }
    const currentY = touch.clientY
    const delta = currentY - pullState.startY
    if (delta <= 0) {
        pullState.active = false
        pullState.distance = 0
        return
    }
    pullState.distance = Math.min(delta, 120)
    if (pullState.distance > 0) {
        event.preventDefault()
    }
}

const handleTouchEnd = () => {
    if (!pullState.active) return
    const shouldRefresh = pullState.distance >= pullThreshold
    pullState.active = false
    pullState.distance = 0
    if (shouldRefresh) {
        triggerRefresh({ usePull: true })
    }
}

const bindTouchListeners = (el: HTMLElement | null) => {
    if (!el) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
}

const unbindTouchListeners = (el: HTMLElement | null) => {
    if (!el) return
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
}

const setupObserver = () => {
    if (loadObserver) {
        loadObserver.disconnect()
        loadObserver = null
    }
    if (!loadMoreTrigger.value) return

    loadObserver = new IntersectionObserver(
        entries => {
            const entry = entries[0]
            if (entry?.isIntersecting) {
                loadMore()
            }
        },
        {
            root: scrollContainer.value,
            rootMargin: '220px 0px 0px 0px'
        }
    )

    loadObserver.observe(loadMoreTrigger.value)
}

watch(
    () => normalizedFilters.value,
    () => {
        scheduleFilterRefresh()
    },
    { deep: true }
)

watch(
    () => filters.startDate,
    value => {
        if (filters.endDate && value && filters.endDate < value) {
            filters.endDate = value
        }
    }
)

watch([() => loadMoreTrigger.value, () => scrollContainer.value], () => {
    setupObserver()
})

onMounted(async () => {
    await nextTick()
    bindTouchListeners(scrollContainer.value)
    setupObserver()
    initialize()
})

onBeforeUnmount(() => {
    if (filterTimer) {
        window.clearTimeout(filterTimer)
    }
    if (loadObserver) {
        loadObserver.disconnect()
        loadObserver = null
    }
    unbindTouchListeners(scrollContainer.value)
})
</script>

<style lang="scss" scoped>
.jots-page {
    &.content-wrapper {
        padding-top: 12px;
    }
    height: 100%;
    background: transparent;
}

.jots-scroll {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--color-bg) 92%, white) 0%,
        var(--color-bg) 40%,
        color-mix(in srgb, var(--color-bg) 80%, white) 100%
    );
}

.pull-indicator {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    color: var(--color-secondary);
    font-size: 13px;
    transition: height 0.2s ease;
}

.pull-indicator__content {
    padding: 6px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-surface) 80%, transparent);
    box-shadow: 0 6px 16px rgba(17, 17, 17, 0.08);
    opacity: 0;
    transform: translateY(8px);
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.pull-indicator--active .pull-indicator__content {
    opacity: 1;
    transform: translateY(0);
}

.page-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: color-mix(in srgb, var(--color-surface) 90%, var(--color-primary) 4%);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--space-3);
}
.page-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.page-title h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: 0.2px;
}

.page-title p {
    font-size: 14px;
    color: var(--color-secondary);
}

.add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: var(--radius-lg);
    background: var(--color-primary);
    color: var(--color-on-primary);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.2px;
    transition: all 0.2s ease;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(17, 17, 17, 0.12);
    }
    &:active {
        transform: scale(0.98);
    }
}

.metric-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-2);

    @media (max-width: 480px) {
        grid-template-columns: repeat(3, minmax(92px, 1fr));
        overflow-x: auto;
        padding-bottom: 4px;
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }
}

.metric-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-light) 85%, transparent);
    min-width: 92px;
    box-shadow: 0 4px 12px rgba(17, 17, 17, 0.06);
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }

    .metric-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-primary);
    }

    .metric-label {
        font-size: 12px;
        color: var(--color-secondary);
    }
}

.metric-card--active {
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 15%, white), var(--color-surface));
}
.metric-card--done {
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-success) 25%, white), var(--color-surface));
}
.metric-card--focus {
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-warning) 25%, white), var(--color-surface));
}

.filter-bar {
    position: sticky;
    top: 0;
    z-index: 9;
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-surface) 96%, transparent);
    box-shadow: var(--shadow-sm);
    border: 1px solid color-mix(in srgb, var(--color-muted) 55%, transparent);
    backdrop-filter: blur(6px);
    margin-bottom: var(--space-3);
}

.filter-scroll {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    flex: 1;

    &::-webkit-scrollbar {
        display: none;
    }
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 160px;

    label {
        font-size: 12px;
        color: var(--color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    input {
        height: 40px;
        padding: 0 var(--space-2);
        border: 1px solid color-mix(in srgb, var(--color-muted) 65%, transparent);
        border-radius: var(--radius-md);
        background: color-mix(in srgb, var(--color-light) 85%, transparent);
        font-size: 14px;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

        &:focus {
            border-color: var(--color-primary);
            outline: none;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
            background: var(--color-surface);
        }
    }
}

.filter-actions .reset-btn {
    height: 40px;
    padding: 0 16px;
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
    color: var(--color-primary);
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;

    &:active {
        transform: scale(0.98);
    }

    &:hover {
        background: var(--color-primary);
        color: var(--color-on-primary);
        border-color: var(--color-primary);
    }
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: var(--space-3);

    @media (min-width: 768px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.card {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--color-muted) 50%, transparent);
    box-shadow: 0 12px 24px rgba(17, 17, 17, 0.08);
    min-height: 260px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    cursor: pointer;

    &:active {
        transform: scale(0.995);
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 32px rgba(17, 17, 17, 0.12);
    }
}

.card-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: color-mix(in srgb, var(--color-light) 70%, transparent);
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.card-thumb__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.28);
    font-size: 40px;
    font-weight: 700;
}

.card-thumb__badges {
    position: absolute;
    left: 12px;
    bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.thumb-badge {
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 999px;
    color: var(--color-on-primary);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 12px rgba(17, 17, 17, 0.25);

    &--important {
        background: color-mix(in srgb, var(--color-warning) 75%, rgba(0, 0, 0, 0.1));
    }
    &--urgent {
        background: color-mix(in srgb, #dc2626 80%, rgba(0, 0, 0, 0.1));
    }
    &--completed {
        background: color-mix(in srgb, var(--color-success) 80%, rgba(0, 0, 0, 0.1));
    }
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
}

.card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
}

.card-title {
    font-size: var(--font-size);
    color: var(--color-primary);
    font-weight: 600;
    flex: 1;
}

.card-status {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-light) 80%, transparent);
    color: var(--color-secondary);

    &--done {
        background: color-mix(in srgb, var(--color-success) 22%, var(--color-light));
        color: var(--color-success);
    }

    &--active {
        background: color-mix(in srgb, var(--color-primary) 12%, var(--color-light));
        color: var(--color-primary);
    }
}

.card-flags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.flag {
    font-size: 11px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--color-light) 80%, transparent);
    color: var(--color-secondary);

    &--important {
        background: color-mix(in srgb, var(--color-warning) 16%, var(--color-light));
        color: var(--color-warning);
    }

    &--urgent {
        background: color-mix(in srgb, #dc2626 18%, var(--color-light));
        color: #b91c1c;
    }

    &--normal {
        background: color-mix(in srgb, var(--color-primary) 8%, var(--color-light));
        color: color-mix(in srgb, var(--color-primary) 60%, black);
    }
}

.card-summary {
    color: var(--color-secondary);
    line-height: 1.6;
    min-height: 48px;
}

.card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
}

.chip {
    background: color-mix(in srgb, var(--color-primary) 10%, var(--color-light));
    color: var(--color-primary);
    padding: 2px 8px;
    border-radius: var(--radius-md);
    font-size: 12px;
}

.card-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: var(--color-secondary);

    @media (min-width: 640px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-2);
    }
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.meta-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-primary) 60%, var(--color-muted));
}

.card--placeholder {
    .skeleton {
        background: linear-gradient(90deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.06) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.2s ease-in-out infinite;
        border-radius: var(--radius-md);
    }

    .skeleton-title {
        height: 20px;
        width: 70%;
    }

    .skeleton-text {
        height: 14px;
        width: 95%;
        &--short {
            width: 55%;
        }
    }
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 48px 0;
    color: var(--color-secondary);

    h3 {
        font-size: var(--font-size);
        margin-bottom: var(--space-1);
    }
}

.load-status {
    display: flex;
    justify-content: center;
    padding: var(--space-2) 0;
    color: var(--color-secondary);
}

.load-status__item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-light) 70%, transparent);

    &--done {
        background: transparent;
    }
}

.spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
    border-top-color: var(--color-primary);
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.observer-trigger {
    width: 100%;
    height: 1px;
}
</style>
