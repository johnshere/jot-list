export function randomDigits(n = 6): string {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
}

export function randomString(n = 6): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}
