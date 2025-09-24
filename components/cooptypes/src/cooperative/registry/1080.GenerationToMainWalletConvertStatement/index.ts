import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1080

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление о конвертации средств генерации в основной кошелек'
export const description = 'Форма заявления о конвертации средств из генерации в основной кошелек'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ О КОНВЕРТАЦИИ СРЕДСТВ ГЕНЕРАЦИИ В ОСНОВНОЙ КОШЕЛЕК</h2></div><p>Прошу конвертировать средства из генерации в основной кошелек пайщика.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}