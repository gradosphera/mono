import config from '../configs'
import { initExtensionsInPostgres, initSystemStatus } from '../postgres-init'
import { installExtraData, installInitialData, startInfra } from './infra'
import { CooperativeClass, startCoop } from './cooperative'

export async function boot() {
  const blockchain = await startInfra()
  await installInitialData(blockchain, false) // Создать базовый совет

  console.log('Инициализируем статус системы в PostgreSQL')
  await initSystemStatus()

  await startCoop()
}

export async function bootClean() {
  const blockchain = await startInfra()

  console.log('Создаём программы (Благорост и маркетплейс)')

  const cooperative = new CooperativeClass(blockchain)
  await cooperative.createPrograms(config.provider)
}

export async function bootExtra() {
  const blockchain = await startInfra()
  await installInitialData(blockchain, true) // Создать расширенный совет (устанавливает статус 'active' в MongoDB)
  await installExtraData(blockchain) // Добавить дополнительных пайщиков

  console.log('Инициализируем статус системы в PostgreSQL')
  await initSystemStatus() // Устанавливает статус 'active' в PostgreSQL

  console.log('Инициализируем extensions в PostgreSQL')
  await initExtensionsInPostgres() // Инициализирует таблицу extensions с данными capital
}
