import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1050

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление на получение займа'
export const description = 'Форма заявления на получение займа от кооператива'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ НА ПОЛУЧЕНИЕ ЗАЙМА</h2></div><p>Прошу предоставить мне заем от кооператива на определенных условиях.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}