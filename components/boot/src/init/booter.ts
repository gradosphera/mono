import { installInitialData, startInfra } from './infra'
import { startCoop } from './cooperative'

export async function boot() {
  const blockchain = await startInfra()
  await installInitialData(blockchain)
  await startCoop()
}

export async function bootClean() {
  await startInfra()
}
