// 登录接口的入参/出参模型

export interface User {
    userId: number
    userName: string
    phone: string
}
export interface LoginRes extends User {
    authorization: string
}

export const PASSWORD_REGEX = /^[A-Za-z\d]{6}$/
