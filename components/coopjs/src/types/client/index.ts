export interface ClientConnectionOptions {
  api_url: string
  headers?: Record<string, string>
  chain_url: string
  chain_id: string
  wif?: string
  username?: string
}
