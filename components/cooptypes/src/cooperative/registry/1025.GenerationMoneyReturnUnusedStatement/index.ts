import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1025

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление о возврате неиспользованных средств генерации'
export const description = 'Форма заявления о возврате неиспользованных средств из генерации'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ О ВОЗВРАТЕ СРЕДСТВ ГЕНЕРАЦИИ</h2></div><p>Прошу вернуть неиспользованные средства из генерации кооператива.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}
