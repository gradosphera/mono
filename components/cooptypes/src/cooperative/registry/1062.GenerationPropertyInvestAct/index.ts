import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1062

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Акт приема-передачи имущества в генерацию'
export const description = 'Форма акта приема-передачи имущества в генерацию кооператива'
export const context = '<div class="digital-document"><div style="text-align: center"><h2>АКТ ПРИЕМА-ПЕРЕДАЧИ ИМУЩЕСТВА В ГЕНЕРАЦИЮ</h2></div><p>Между кооперативом и пайщиком составлен акт о передаче имущества в генерацию.</p><p>Подписи сторон.</p></div>'

export const translations = {}
export const exampleData = {}
