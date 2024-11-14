export { type ValueTypes } from '../zeus'
export * from './controller'

// Утилита для преобразования всех полей типа в обязательные, сохраняя вложенные объекты
export type MakeAllFieldsRequired<T> = {
  [P in keyof Omit<T, `__${string}`>]-?: T[P] extends object
    ? MakeAllFieldsRequired<T[P]> // Рекурсивно применяем к вложенным объектам
    : boolean // Для конечных полей используем boolean
}

export interface ClientConnectionOptions {
  baseUrl: string
  headers?: Record<string, string>
}
