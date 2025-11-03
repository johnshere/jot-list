// import { HttpStatus, SuccessResult, type RequestResult } from '@jot-list/shared'
// import { ReplyGenericInterface } from 'fastify/types/reply'
// import { RawReplyDefaultExpression, RawServerBase, RawServerDefault, ReplyDefault } from 'fastify/types/utils'

// // 使用泛型自动推断 data 的类型，避免 any
// export const success = <T>(reply: RawReplyDefaultExpression<RawServerBase>, data: T): SuccessResult<T> => {
//     return reply
//         .code(HttpStatus.OK)
//         .send({ userId: user.id, userName: user.userName, phone: user.phone } satisfies LoginOk)
// }
