import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1040

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Заявление на внесение результата интеллектуальной деятельности'
export const description = 'Форма заявления на внесение результата интеллектуальной деятельности'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>ЗАЯВЛЕНИЕ О ВНЕСЕНИИ РИД</h2></div><p>Прошу принять результат интеллектуальной деятельности в качестве паевого взноса.</p><p>Подпись: Иван Иванович</p></div>'

export const translations = {}
export const exampleData = {}
