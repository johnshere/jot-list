// 简易内存会话：开发环境用于将 authorization token 映射到用户ID
const tokenToUserId = new Map<string, number>()

export const saveSession = (token: string, userId: number) => {
    tokenToUserId.set(token, userId)
}

export const getUserIdByToken = (token: string): number | undefined => {
    return tokenToUserId.get(token)
}

export const removeSession = (token: string) => {
    tokenToUserId.delete(token)
}


