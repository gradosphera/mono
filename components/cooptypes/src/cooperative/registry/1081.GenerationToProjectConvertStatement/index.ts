import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1081

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление о конвертации средств генерации в проект'
export const description = 'Форма заявления о конвертации средств из генерации в конкретный проект'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ О КОНВЕРТАЦИИ СРЕДСТВ ГЕНЕРАЦИИ В ПРОЕКТ</h2></div><p>Прошу конвертировать средства из генерации для инвестирования в проект.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}