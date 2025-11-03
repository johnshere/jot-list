import { BizCode } from './codes'

// 标准错误响应体（非2xx）
export interface ApiError {
  error: BizCode | string
  message: string
}