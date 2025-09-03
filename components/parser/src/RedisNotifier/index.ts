import Redis from 'ioredis'
import { redisHost, redisPassword, redisPort, redisStreamLimit } from '../config'

// const redis = new Redis(redisPort)

const redis = new Redis({
  port: Number(redisPort),
  host: redisHost,
  password: redisPassword,
  // другие опции при необходимости
})

const streamName = 'notifications'

export async function publishEvent(type: string, event: object) {
  const message = JSON.stringify({ type, event })

  await redis.xadd(streamName, '*', 'event', message)
  await redis.xtrim(streamName, 'MAXLEN', '~', redisStreamLimit)
}

export async function publishDelta(type: string, delta: object) {
  const message = JSON.stringify({ type, delta })

  await redis.xadd(streamName, '*', 'delta', message)
  await redis.xtrim(streamName, 'MAXLEN', '~', redisStreamLimit)
}

export async function publishFork(type: string, block_num: number) {
  const message = JSON.stringify({ type, block_num })

  await redis.xadd(streamName, '*', 'fork', message)
  await redis.xtrim(streamName, 'MAXLEN', '~', redisStreamLimit)
}
