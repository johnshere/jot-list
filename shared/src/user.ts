// 登录接口的入参/出参模型

export interface LoginRequest {
    phone: string
    password: string
}

export interface LoginOk {
    userId: number
    userName: string
    phone: string
}
