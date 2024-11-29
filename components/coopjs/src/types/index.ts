import type { AliasType } from '../zeus';

export { type ValueTypes } from '../zeus'
export * from './controller'

export interface ClientConnectionOptions {
  baseUrl: string
  headers?: Record<string, string>
  blockchainUrl: string
  chainId: string
}
