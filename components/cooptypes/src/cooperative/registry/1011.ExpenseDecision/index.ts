import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1011

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  request_id: number
  decision_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Решение совета о расходах'
export const description = 'Форма решения совета о произведенных расходах'
export const context = '<div class="digital-document"><h1>ПРОТОКОЛ № 1</h1><p>Собрания Совета кооператива ВОСХОД</p><p>Решение: Одобрить произведенные расходы пайщика Иван Иванович.</p><p>Подпись: Алексей Муравьев</p></div>'

export const translations = {}
export const exampleData = {}