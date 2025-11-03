// 全局常量配置（使用帕斯卡命名法）

export const ApiPrefix = '/api'
export const DefaultPort = 3000
export const HostBind = '0.0.0.0'

export const PasswordSalt = '306f922ef73629646f51313c0fdd1'

// 公开路由（相对路径，挂载在 ApiPrefix 下）
export const NoAuthPaths = new Set<string>(['/login'])
