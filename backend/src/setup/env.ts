import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// 解析当前文件所在目录（ESM 下没有 __dirname）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// backend 根目录
const backendRoot = path.resolve(__dirname, '..', '..')
// 仓库根目录（backend 的上一级）
const repoRoot = path.resolve(backendRoot, '..')

// 依次尝试加载 backend/.env 与 repo/.env
const candidateEnvPaths = [
    path.join(backendRoot, '.env'),
    path.join(repoRoot, '.env')
]

for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
        loadEnv({ path: envPath })
        break
    }
}

// 若仍未提供 DATABASE_URL，则对 sqlite 提供一个安全默认值
if (!process.env.DATABASE_URL) {
    // 相对 backend 根目录的 prisma/dev.db
    process.env.DATABASE_URL = 'file:./prisma/dev.db'
}


