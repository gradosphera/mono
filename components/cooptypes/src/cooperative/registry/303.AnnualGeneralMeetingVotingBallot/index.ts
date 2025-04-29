import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'

export const registry_id = 303

// Модель действия для генерации
export interface Action extends IGenerate {
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
}

export const title = 'Бюллетень голосования на общем собрании пайщиков'
export const description = 'Форма бюллетеня голосования на общем собрании пайщиков'

export const context = '<div class="digital-document"><div style="text-align: right; margin:">\n\n</div></div>\n<style>\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n};\n</style>\n\n'

export const translations = {
  ru: {
  },
  // ... другие переводы
}
