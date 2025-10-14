type PermissionType = 'BUTTON' | 'MENU' | 'ROUTE'
type Permission = {
    id: string
    name: string
    path: string
    type: PermissionType
}
