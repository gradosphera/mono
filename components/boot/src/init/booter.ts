import { installExtraData, installInitialData, startInfra } from './infra'
import { startCoop } from './cooperative'

export async function boot() {
  const blockchain = await startInfra()
  await installInitialData(blockchain, false) // Создать базовый совет
  await startCoop()
}

export async function bootClean() {
  await startInfra()
}

export async function bootExtra() {
  const blockchain = await startInfra()
  await installInitialData(blockchain, true) // Создать расширенный совет
  await installExtraData(blockchain) // Добавить дополнительных пайщиков
}
