import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1042

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Акт приема-передачи результата интеллектуальной деятельности'
export const description = 'Форма акта приема-передачи результата интеллектуальной деятельности'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>АКТ ПРИЕМА-ПЕРЕДАЧИ РИД</h2></div><p>Между кооперативом и пайщиком составлен акт о передаче результата интеллектуальной деятельности.</p><p>Подписи сторон.</p></div>'

export const translations = {}
export const exampleData = {}
