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
