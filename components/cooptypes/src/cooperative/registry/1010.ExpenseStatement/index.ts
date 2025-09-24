import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1010

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление о расходах'
export const description = 'Форма заявления о произведенных расходах'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ О РАСХОДАХ</h2></div><p>Прошу рассмотреть и утвердить произведенные расходы на нужды кооператива.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}
