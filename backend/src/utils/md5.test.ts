import { PasswordSalt } from '../config/constants.ts'
import { hashSecret } from './md5.ts'

const p = hashSecret('lj1991', PasswordSalt).digest
console.log(p)
