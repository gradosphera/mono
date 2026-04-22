/* eslint-disable node/prefer-global/process */
import type { Network } from '../types'

function parseChainUrl(url: string) {
  const m = url.match(/^(https?):\/\/([^:/]+)(?::(\d+))?(?:\/.*)?$/)
  if (!m) {
    return { protocol: 'http' as const, host: '127.0.0.1', port: ':8888' }
  }
  const [, protocol, host, port] = m
  return { protocol, host, port: port ? `:${port}` : '' }
}

const { protocol, host, port } = parseChainUrl(process.env.CHAIN_URL || 'http://127.0.0.1:8888')

export const networks: Network[] = [
  {
    name: 'local',
    protocol,
    host,
    port,
  },
]
