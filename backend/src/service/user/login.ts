import type { FastifyInstance } from 'fastify'
import { HttpStatus } from '@jot-list/shared'
import { PasswordSalt } from '../../config/constants'
import { hashSecret, md5Hex } from '../../utils/md5'
import { PrismaClient, User } from '../../generated/prisma/client'
import { randomDigits, randomString } from '../../utils/random'
import { error, success } from '../reply'
import { PASSWORD_REGEX } from '@jot-list/shared'

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
            const { phone, password } = req.body as User

            // 密码正则校验
            if (!PASSWORD_REGEX.test(password)) {
                return error(reply, '密码必须为6位且包含字母和数字', HttpStatus.BAD_REQUEST)
            }

            // 统一使用常量盐
            const secret = hashSecret(password, PasswordSalt)

            // 查询是否存在用户
            let user = await prisma.user.findUnique({ where: { phone } })
            if (!user) {
                // 自动创建用户：6位随机数密码 + 6位随机字符串用户名
                const initialPassword = randomDigits(6)
                const userName = randomString(6)
                user = await prisma.user.create({
                    data: {
                        userName,
                        phone,
                        password: secret.digest
                    }
                })
                // 登录成功和新建用户时都生成并返回 authorization 字段。
                const authorization = randomString(32)
                const newUser = { ...user, password: initialPassword, authorization }
                return success(reply, newUser, HttpStatus.CREATED)
            }

            // 校验密码
            if (user.password !== secret.digest) {
                // 标准 HTTP：认证失败返回 401
                return error(reply, '手机号或密码错误')
            }

            // 登录成功生成 Authorization
            const authorization = randomString(32)
            await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            // 标准 HTTP：成功返回 200，响应体为业务数据
            return success(reply, { userId: user.id, userName: user.userName, phone: user.phone, authorization })
        }
    )
}
