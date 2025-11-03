import type { FastifyInstance } from 'fastify'
import { PasswordSalt } from '../../config/constants'
import { hashSecret, md5Hex } from '../../utils/md5'
import { PrismaClient } from '../../generated/prisma/client'
import { randomDigits, randomString } from '../../utils/random'

const prisma = new PrismaClient()

export const loginService = (instance: FastifyInstance) => {
    instance.post(
        '/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['phone', 'password'],
                    properties: {
                        phone: { type: 'string', minLength: 6, maxLength: 32 },
                        password: { type: 'string', minLength: 1, maxLength: 128 }
                    }
                }
            }
        },
        async (req, reply) => {
            const { phone, password } = req.body as { phone: string; password: string }

            // 统一使用常量盐
            const secret = hashSecret(password, PasswordSalt)

            // 查询是否存在用户
            let user = await prisma.user.findUnique({ where: { phone } })
            if (!user) {
                // 自动创建用户：6位随机数密码 + 6位随机字符串用户名
                const initialPassword = randomDigits(6)
                const userName = randomString(6)
                const digest = md5Hex(`${PasswordSalt}${initialPassword}`)
                user = await prisma.user.create({
                    data: {
                        userName,
                        phone,
                        password: digest
                    }
                })
                // 标准 HTTP：新建返回 201，响应体为业务数据
                return reply
                    .code(201)
                    .send({ created: true, userId: user.id, userName, phone, initialPassword })
            }

            // 校验密码
            if (user.password !== secret.digest) {
                // 标准 HTTP：认证失败返回 401
                return reply.code(401).send({ error: 'INVALID_CREDENTIALS', message: '手机号或密码错误' })
            }

            await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            // 标准 HTTP：成功返回 200，响应体为业务数据
            return reply.code(200).send({ userId: user.id, userName: user.userName, phone: user.phone })
        }
    )
}
