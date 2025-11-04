import { BizCode, ErrorResult, HttpStatus, SuccessResult } from '@jot-list/shared'
import { FastifyReply } from 'fastify/types/reply'

// 使用泛型自动推断 data 的类型，避免 any
export const success = <T>(reply: FastifyReply, data: T, status?: HttpStatus) => {
    return reply.code(status || HttpStatus.OK).send({ success: true, failed: false, data } satisfies SuccessResult<T>)
}
export const error = (reply: FastifyReply, message: string, status: HttpStatus | BizCode = HttpStatus.BAD_REQUEST) => {
    const result = { success: false, failed: true, message } as ErrorResult
    if (typeof status === 'string') {
        result.code = status
        status = HttpStatus.BAD_REQUEST
    }

    return reply.code(status).send(result)
}
