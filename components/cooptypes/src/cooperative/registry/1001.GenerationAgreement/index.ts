import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1001

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Договор участия в хозяйственной деятельности'
export const description = 'Форма договора участия в хозяйственной деятельности'
export const context = '<div class="digital-document"><div style="text-align: center"><h1>ДОГОВОР УЧАСТИЯ В ХОЗЯЙСТВЕННОЙ ДЕЯТЕЛЬНОСТИ</h1></div><p>Текст договора участия в хозяйственной деятельности кооператива.</p><p>Подписано электронной подписью.</p></div>'

export const translations = {}
export const exampleData = {}
