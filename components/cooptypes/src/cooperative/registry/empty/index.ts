import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'

export const registry_id = 0 // номер

// Модель действия для генерации
export interface Action extends IGenerate {
}

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
}

export const title = 'Наименование'
export const description = 'Описание'

export const context = '<div class="digital-document"><div style="text-align: right; margin:">\n\n</div></div>\n<style>\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n};\n</style>\n\n'

export const translations = {
  ru: {
  },
  // ... другие переводы
}
