import type { MakeAllFieldsRequired, ValueTypes } from '../types'

// Создаем объект селектора с обязательными полями типа `boolean`, исключая `__` поля
export const getExtensionSelector: MakeAllFieldsRequired<ValueTypes['Extension']> = {
  name: true,
  config: true,
  enabled: true,
  updated_at: true,
  created_at: true,
}
