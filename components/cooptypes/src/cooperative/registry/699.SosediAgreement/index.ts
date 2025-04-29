import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'

export const registry_id = 699

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
}

export const title = 'Согласие с условиями ЦПП «СОСЕДИ»'
export const description = 'Форма присоединения к целевой потребительской программе «СОСЕДИ»'
export const context = '<div class="digital-document">Пустой документ</div><style>\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader{\npadding-bottom: 20px;\n}\n</style>'

export const translations = {
  ru: {
  },
  // ... другие переводы
}
