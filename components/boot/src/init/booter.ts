import { initExtensionsInPostgres, initSystemStatus } from '../postgres-init'
import { installExtraData, installInitialData, startInfra } from './infra'
import { startCoop } from './cooperative'

export async function boot() {
  const blockchain = await startInfra()
  await installInitialData(blockchain, false) // Создать базовый совет

  console.log('Инициализируем статус системы в PostgreSQL')
  await initSystemStatus()

  await startCoop()
}

export async function bootClean() {
  // Только инфраструктура: контракты, фичи, токен, системные параметры.
  // Ни совета, ни программ — программы (createPrograms) требуют существующий
  // совет и создаются в boot/bootExtra внутри installInitialData. В clean их
  // не делаем (иначе soviet::createprog падает с «Совет не найден»).
  await startInfra()
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
