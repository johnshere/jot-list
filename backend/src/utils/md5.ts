import crypto from 'node:crypto'

export type HashOrder = 'prefix' | 'suffix' | 'none'

export interface HashOptions {
    uppercase?: boolean
    order?: HashOrder
}

export function md5Hex(input: string, uppercase = false): string {
    const digest = crypto.createHash('md5').update(input, 'utf8').digest('hex')
    return uppercase ? digest.toUpperCase() : digest
}

export function generateSalt(byteLength = 16): string {
    return crypto.randomBytes(byteLength).toString('hex')
}

export function hashSecret(secret: string, salt?: string, options: HashOptions = {}): { salt: string; digest: string } {
    const { uppercase = false, order = 'prefix' } = options
    const useSalt = salt ?? generateSalt(16)
    let combined: string
    switch (order) {
        case 'prefix':
            combined = useSalt + secret
            break
        case 'suffix':
            combined = secret + useSalt
            break
        case 'none':
            combined = secret
            break
    }
    const digest = md5Hex(combined, uppercase)
    return { salt: useSalt, digest }
}

export function verifySecret(
    secret: string,
    expectedDigest: string,
    salt?: string,
    options: HashOptions = {}
): boolean {
    const { uppercase = false, order = 'prefix' } = options
    const { digest } = hashSecret(secret, salt, { uppercase, order })
    return digest === expectedDigest
}
