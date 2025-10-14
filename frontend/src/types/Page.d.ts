interface View {
    default: {
        title: string
        __file: string
        folders: string[]
        path?: string
        meta?: Record<string, BaseType>
        children?: RouteRecordRaw[]
    }
}
