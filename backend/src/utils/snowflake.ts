const epoch = BigInt(1704067200000) // 2024-01-01 00:00:00 UTC

const sequenceBits = 12n
const maxSequence = (1n << sequenceBits) - 1n

let lastTimestamp = 0n
let sequence = 0n

const waitNextMillis = (current: bigint) => {
    let timestamp = current
    while (timestamp === current) {
        timestamp = BigInt(Date.now())
    }
    return timestamp
}

export const generateSnowflakeId = () => {
    let timestamp = BigInt(Date.now())

    if (timestamp === lastTimestamp) {
        sequence = (sequence + 1n) & maxSequence
        if (sequence === 0n) {
            timestamp = waitNextMillis(timestamp)
        }
    } else {
        sequence = 0n
    }

    lastTimestamp = timestamp

    const id = ((timestamp - epoch) << sequenceBits) | sequence
    return id.toString()
}

