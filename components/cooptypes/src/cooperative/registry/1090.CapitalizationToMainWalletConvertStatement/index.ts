import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1090

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление о конвертации средств капитализации в основной кошелек'
export const description = 'Форма заявления о конвертации средств из капитализации в основной кошелек'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ О КОНВЕРТАЦИИ СРЕДСТВ КАПИТАЛИЗАЦИИ В ОСНОВНОЙ КОШЕЛЕК</h2></div><p>Прошу конвертировать средства из программы капитализации в основной кошелек пайщика.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}