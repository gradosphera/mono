import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1070

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление об инвестировании имущества в капитализацию'
export const description = 'Форма заявления об инвестировании имущества в капитализацию кооператива'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ ОБ ИНВЕСТИРОВАНИИ ИМУЩЕСТВА В КАПИТАЛИЗАЦИЮ</h2></div><p>Прошу принять мое имущество в качестве инвестиций в программу капитализации кооператива.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}