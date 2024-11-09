export { type ValueTypes } from '../zeus'

// Утилита для преобразования всех полей типа в обязательные с типом `boolean`, исключая поля с `__`
export type MakeAllFieldsRequired<T> = {
  [P in keyof Omit<T, `__${string}`>]-?: boolean;
}

export interface GraphQLClientOptions {
  baseUrl: string
  headers?: Record<string, string>
}
