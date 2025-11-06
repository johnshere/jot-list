interface View {
    default: {
        title: string
        __file: string
        folders: string[]
        path?: string
        sort?: number
        meta?: Record<string, BaseType>
        children?: RouteRecordRaw[]
    }
}
