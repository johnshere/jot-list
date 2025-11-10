<template>
    <div class="input-tag" @click="focusInput">
        <div
            v-for="tag in displayTags"
            :key="`${tag.type}-${tag.value}`"
            class="input-tag__pill"
            :style="{
                '--tag-color': TagColor[tag.type]
            }"
        >
            <span class="input-tag__label">{{ tag.text }}</span>
            <button type="button" class="input-tag__remove" aria-label="移除标签" @click.stop="removeTag(tag)">
                ×
            </button>
        </div>
        <input
            ref="inputEl"
            v-model="inputValue"
            class="input-tag__input"
            :placeholder="placeholder"
            @keydown="handleKeydown"
            @blur="commitFromInput"
        />
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Jot } from '@jot-list/shared'

type TagType = keyof Omit<Jot, 'id' | 'userId' | 'content' | 'tags' | 'createTime' | 'updateTime' | 'isDeleted'>
export type TitleTagModel = Record<TagType, string>
type TagItem = {
    text: string
    type: TagType
    value: string
}

const props = defineProps<{
    modelValue: TitleTagModel
}>()
const emit = defineEmits<{
    (event: 'update:modelValue', value: TitleTagModel): void
}>()

const BOOLEAN_TAGS: TagType[] = ['isImportant', 'isUrgent', 'isCompleted']
const DATE_TAGS: TagType[] = ['startDate', 'endDate']
const TIME_TAGS: TagType[] = ['startTime', 'endTime']

const defaultValue: TitleTagModel = {
    title: '',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    isImportant: 'false',
    isUrgent: 'false',
    isCompleted: 'false'
}

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

const TAG_ALIAS: Record<TagType, string[]> = {
    title: ['title', 't', 'subject', '主题', '标题', '文本'],
    startTime: ['starttime', 'stime', 'startt', '开始时间', '开始时刻', 'st'],
    endTime: ['endtime', 'etime', 'endt', '结束时间', '结束时刻', 'et'],
    startDate: ['startdate', 'sd', 'start', 'from', '开始日期', '开始', '起始'],
    endDate: ['enddate', 'ed', 'end', 'to', '截止日期', '结束', '截止'],
    isImportant: ['important', 'isimportant', '重点', '重要'],
    isUrgent: ['urgent', 'isurgent', '紧急'],
    isCompleted: ['completed', 'done', 'finish', 'finished', 'iscompleted', '完成', '已完成']
}

const aliasMap = new Map<string, TagType>()
Object.entries(TAG_ALIAS).forEach(([type, aliases]) => {
    aliases.forEach(alias => {
        aliasMap.set(alias.toLowerCase(), type as TagType)
    })
})

const inputValue = ref<string>('')
const inputEl = ref<HTMLInputElement>()
const placeholder = '输入描述，例如：明天 10:00 重要 紧急'
const innerValue = ref<TitleTagModel>({
    ...defaultValue,
    ...props.modelValue
})

watch(
    () => props.modelValue,
    value => {
        innerValue.value = {
            ...defaultValue,
            ...value
        }
    },
    { immediate: true, deep: true }
)

const displayTags = computed<TagItem[]>(() => {
    const tags: TagItem[] = []

    if (innerValue.value.title.trim()) {
        tags.push({
            type: 'title',
            value: innerValue.value.title,
            text: innerValue.value.title
        })
    }

    if (innerValue.value.startDate) {
        tags.push({
            type: 'startDate',
            value: innerValue.value.startDate,
            text: `开始 ${innerValue.value.startDate}`
        })
    }

    if (innerValue.value.endDate) {
        tags.push({
            type: 'endDate',
            value: innerValue.value.endDate,
            text: `结束 ${innerValue.value.endDate}`
        })
    }

    if (innerValue.value.startTime) {
        tags.push({
            type: 'startTime',
            value: innerValue.value.startTime,
            text: `开始 ${innerValue.value.startTime}`
        })
    }

    if (innerValue.value.endTime) {
        tags.push({
            type: 'endTime',
            value: innerValue.value.endTime,
            text: `结束 ${innerValue.value.endTime}`
        })
    }

    if (innerValue.value.isImportant === 'true') {
        tags.push({
            type: 'isImportant',
            value: 'true',
            text: '重要'
        })
    }

    if (innerValue.value.isUrgent === 'true') {
        tags.push({
            type: 'isUrgent',
            value: 'true',
            text: '紧急'
        })
    }

    if (innerValue.value.isCompleted === 'true') {
        tags.push({
            type: 'isCompleted',
            value: 'true',
            text: '已完成'
        })
    }

    return tags
})

function commitUpdate(partial: Partial<TitleTagModel>) {
    const next: TitleTagModel = { ...innerValue.value }
    let changed = false

    Object.entries(partial).forEach(([type, value]) => {
        if (value === undefined) return
        const key = type as TagType
        if (next[key] !== value) {
            next[key] = value
            changed = true
        }
    })

    if (!changed) return

    innerValue.value = next
    emit('update:modelValue', { ...next })
}

function commitFromInput() {
    if (!inputValue.value.trim()) {
        inputValue.value = ''
        return
    }

    const partial = parseInput(inputValue.value, innerValue.value)

    if (Object.keys(partial).length > 0) {
        commitUpdate(partial)
    }

    inputValue.value = ''
}

function handleKeydown(event: KeyboardEvent) {
    if (['Enter', 'Tab'].includes(event.key)) {
        event.preventDefault()
        commitFromInput()
        return
    }

    if (event.key === ',' || event.key === '，' || event.key === ';' || event.key === '；') {
        event.preventDefault()
        commitFromInput()
        return
    }

    if (event.key === 'Backspace' && !inputValue.value) {
        const lastTag = displayTags.value[displayTags.value.length - 1]
        if (lastTag) {
            event.preventDefault()
            removeTag(lastTag)
        }
    }
}

function focusInput() {
    inputEl.value?.focus()
}

function removeTag(tag: TagItem) {
    const reset: Partial<TitleTagModel> = {}

    if (BOOLEAN_TAGS.includes(tag.type)) {
        reset[tag.type] = 'false'
    } else {
        reset[tag.type] = ''
    }

    commitUpdate(reset)
}

function parseInput(raw: string, current: TitleTagModel): Partial<TitleTagModel> {
    const source = raw.trim()
    if (!source) return {}

    const result: Partial<TitleTagModel> = {}
    const mask = new Array<boolean>(source.length).fill(false)

    const kvRegex = /([^\s:：=,，;；]+)\s*[:=：=]\s*("[^"]+"|[^,，;；]+)/g
    let match: RegExpExecArray | null

    while ((match = kvRegex.exec(source))) {
        const full = match[0] ?? ''
        const keyRaw = match[1]
        const valueRaw = match[2]
        if (!keyRaw || !valueRaw) continue
        const type = resolveTagType(keyRaw)
        if (!type) continue
        const normalized = normalizeValue(type, stripQuotes(valueRaw))
        if (typeof normalized === 'string' && normalized !== '') {
            result[type] = normalized
            markRange(mask, match.index, match.index + full.length)
        }
    }

    applyBooleanKeywords(source, mask, result)
    applyDateTime(source, mask, result, current)

    const leftover = extractLeftover(source, mask)
    if (leftover) {
        const existing = result.title ?? ''
        result.title = [existing, leftover].filter(Boolean).join(existing ? ' ' : '')
    }

    return result
}

function resolveTagType(key: string): TagType | null {
    const normalized = key.trim().toLowerCase()
    return aliasMap.get(normalized) ?? null
}

function stripQuotes(value: string): string {
    const trimmed = value.trim()
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1)
    }
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1)
    }
    return trimmed
}

function normalizeValue(type: TagType, raw: string): string | undefined {
    if (BOOLEAN_TAGS.includes(type)) {
        return normalizeBoolean(raw)
    }

    if (DATE_TAGS.includes(type)) {
        return normalizeDate(raw)
    }

    if (TIME_TAGS.includes(type)) {
        return normalizeTime(raw)
    }

    if (type === 'title') {
        return raw.trim()
    }

    return raw.trim()
}

function normalizeBoolean(raw: string): string {
    const value = raw.trim().toLowerCase()
    if (!value) return 'true'

    if (['false', '0', 'no', 'n', 'off', '取消', '否', '不', '未'].some(flag => value.includes(flag))) {
        return 'false'
    }

    return 'true'
}

function normalizeDate(raw: string): string | undefined {
    const cleaned = raw.replace(/[./]/g, '-').trim()
    const parts = cleaned.split('-').filter(Boolean)
    if (parts.length !== 3) return undefined

    const [yearRaw, monthRaw, dayRaw] = parts as [string, string, string]
    let year = yearRaw
    let month = monthRaw
    let day = dayRaw
    if (year.length === 2) {
        year = `20${year}`
    }
    if (month.length === 1) month = `0${month}`
    if (day.length === 1) day = `0${day}`

    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
        return undefined
    }

    return `${year}-${month}-${day}`
}

function normalizeTime(raw: string): string | undefined {
    const match = raw.match(/(\d{1,2})(?::|：|点)(\d{1,2})?/)
    if (!match) return undefined

    let hours = match[1] ?? ''
    let minutes = match[2] ?? '00'

    if (!hours) return undefined
    if (hours.length === 1) hours = `0${hours}`
    if (minutes.length === 1) minutes = `0${minutes}`

    const hourNumber = Number(hours)
    const minuteNumber = Number(minutes)

    if (hourNumber > 23 || minuteNumber > 59) return undefined

    return `${hours}:${minutes}`
}

function applyBooleanKeywords(source: string, mask: boolean[], result: Partial<TitleTagModel>) {
    const patterns = [
        { type: 'isImportant', value: 'false', regex: /不重要|取消重要|not\s+important/gi },
        { type: 'isImportant', value: 'true', regex: /重要|important/gi },
        { type: 'isUrgent', value: 'false', regex: /不紧急|取消紧急|not\s+urgent/gi },
        { type: 'isUrgent', value: 'true', regex: /紧急|urgent/gi },
        { type: 'isCompleted', value: 'false', regex: /未完成|todo|待办|not\s+done/gi },
        { type: 'isCompleted', value: 'true', regex: /已完成|完成|done|finished|finish/gi }
    ] as const

    for (const { type, value, regex } of patterns) {
        let match: RegExpExecArray | null
        while ((match = regex.exec(source))) {
            const start = match.index
            const end = start + match[0].length
            if (isMasked(mask, start, end)) continue
            result[type] = value
            markRange(mask, start, end)
        }
    }
}

function applyDateTime(source: string, mask: boolean[], result: Partial<TitleTagModel>, current: TitleTagModel) {
    const dateMatches: Array<{ value: string; start: number; end: number }> = []
    const dateRegex = /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g
    let match: RegExpExecArray | null

    while ((match = dateRegex.exec(source))) {
        const normalized = normalizeDate(match[0])
        if (!normalized) continue
        dateMatches.push({
            value: normalized,
            start: match.index,
            end: match.index + match[0].length
        })
    }

    const timeMatches: Array<{ value: string; start: number; end: number }> = []
    const timeRegex = /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g
    while ((match = timeRegex.exec(source))) {
        const normalized = normalizeTime(match[0])
        if (!normalized) continue
        timeMatches.push({
            value: normalized,
            start: match.index,
            end: match.index + match[0].length
        })
    }

    assignDateMatches(dateMatches, mask, result, current)
    assignTimeMatches(timeMatches, mask, result, current)
}

function assignDateMatches(
    matches: Array<{ value: string; start: number; end: number }>,
    mask: boolean[],
    result: Partial<TitleTagModel>,
    current: TitleTagModel
) {
    matches.forEach((match, index) => {
        if (isMasked(mask, match.start, match.end)) return
        const target: TagType =
            index === 0 ? 'startDate' : index === 1 ? 'endDate' : current.endDate ? 'endDate' : 'startDate'
        result[target] = match.value
        markRange(mask, match.start, match.end)
    })
}

function assignTimeMatches(
    matches: Array<{ value: string; start: number; end: number }>,
    mask: boolean[],
    result: Partial<TitleTagModel>,
    current: TitleTagModel
) {
    matches.forEach((match, index) => {
        if (isMasked(mask, match.start, match.end)) return
        const target: TagType =
            index === 0 ? 'startTime' : index === 1 ? 'endTime' : current.endTime ? 'endTime' : 'startTime'
        result[target] = match.value
        markRange(mask, match.start, match.end)
    })
}

function extractLeftover(source: string, mask: boolean[]): string {
    let leftover = ''
    for (let i = 0; i < source.length; i += 1) {
        if (mask[i]) continue
        leftover += source[i]
    }

    return leftover
        .replace(/[，,;；|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function isMasked(mask: boolean[], start: number, end: number) {
    for (let i = start; i < end; i += 1) {
        if (mask[i]) return true
    }
    return false
}

function markRange(mask: boolean[], start: number, end: number) {
    for (let i = start; i < end; i += 1) {
        mask[i] = true
    }
}
</script>
<style scoped>
.input-tag {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    min-height: 40px;
    cursor: text;
}

.input-tag__pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--tag-color, var(--color-primary));
    border-radius: 999px;
    background-color: color-mix(in srgb, var(--tag-color, var(--color-primary)) 12%, transparent);
    color: var(--tag-color, var(--color-text));
    font-size: var(--font-size-sm);
    line-height: 1;
}

.input-tag__label {
    white-space: nowrap;
}

.input-tag__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 0;
    font-size: var(--font-size-sm);
    line-height: 1;
}

.input-tag__remove:hover {
    background-color: color-mix(in srgb, var(--color-text) 15%, transparent);
}

.input-tag__input {
    flex: 1;
    min-width: 140px;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-size-sm);
    line-height: 1.4;
    padding: var(--space-1) 0;
}
</style>
