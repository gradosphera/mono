import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1002

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Приложение к договору участия'
export const description = 'Приложение к договору участия в хозяйственной деятельности'
export const context = '<div class="digital-document"><div style="text-align: center"><h1>ПРИЛОЖЕНИЕ К ДОГОВОРУ УЧАСТИЯ</h1></div><p>Создано: {{ meta.created_at }} {{ meta.block_num }}</p><p>Описание проекта для совместной деятельности.</p><p>Подписано электронной подписью.</p></div>'

export const translations = {}
export const exampleData = {
  meta: {
    created_at: '12.02.2024 00:01',
  },
}
