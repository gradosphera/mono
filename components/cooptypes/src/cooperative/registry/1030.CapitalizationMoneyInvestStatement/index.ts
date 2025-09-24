import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1030

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление об инвестировании средств в капитализацию'
export const description = 'Форма заявления об инвестировании средств в целевую потребительскую программу капитализации'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ ОБ ИНВЕСТИРОВАНИИ В КАПИТАЛИЗАЦИЮ</h2></div><p>Прошу принять мое участие в целевой потребительской программе капитализации кооператива.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}