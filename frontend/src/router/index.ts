import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useGuards } from './guards'
import { name } from '../../package.json'

const Root = {} as RouteRecordRaw
const routes: RouteRecordRaw[] = [
    Root,
    {
        path: '/:pathMatch(.*)',
        name: Symbol('abnorm'),
        meta: { title: '404 - 页面不存在' },
        component: () => import('@/views/exception/404.vue')
    }
]

const findParent = (fn: (r: RouteRecordRaw) => boolean, rs?: RouteRecordRaw[]): RouteRecordRaw | undefined => {
    rs = rs || [Root]
    for (const r of rs || []) {
        const p = findParent(fn, r.children)
        if (p) return p
        if (fn(r)) return r
    }
}

const views = import.meta.glob<View>('@/views/**/index.vue', { eager: true })
const getFolders = (path: string) => /\/views(\/.*)\/index\.vue/.exec(path)?.[1]?.split('/').filter(Boolean) ?? []
const getName = (paths: string[]) => paths.filter(Boolean).join('-')
const components = Object.entries(views)
    .map(([k, v]) => (v.default.folders = getFolders(k)) && v.default)
    .sort((a, b) => a.folders.length - b.folders.length)
for (const component of components) {
    const { title, folders, meta } = component
    if (title === undefined || title === null) {
        throw new Error(`the title of view page(${folders}) can not be empty`)
    }
    const name = getName(folders)
    const path = folders.slice().pop() ?? ''
    const route = {
        path: component.path ?? path,
        name,
        component: component,
        meta: { title, ...meta },
        children: [] as RouteRecordRaw[]
    }
    if (!folders.length) {
        Object.assign(Root, route, { path: '/' })
    } else {
        const parent = findParent(r => name === getName([r.name as string, path]))
        parent?.children?.push(route)
    }
}

// 创建新的路由实例
const inst = createRouter({
    history: createWebHistory(name),
    routes
})

useGuards(inst)

export const router = inst
