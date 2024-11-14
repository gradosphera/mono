import type { MakeAllFieldsRequired, ValueTypes } from '../types'
import type { GraphQLTypes, ModelTypes } from '../zeus';
import { $, InputType, Selector } from '../zeus';

// Создаем объект селектора с обязательными полями типа `boolean`, исключая `__` поля
export const getExtensionsSelector: MakeAllFieldsRequired<ValueTypes['Extension']> = {
  name: true,
  available: true,
  installed: true,
  enabled: true,
  updated_at: true,
  created_at: true,
  config: true,
  schema: true,
  title: true,
  description: true,
  image: true,
  tags: true,
  readme: true,
  instructions: true,
}

export const getExtensions = Selector("Query")({
  getExtensions: [{data: $('data', 'GetExtensionsInput')}, getExtensionsSelector]
});

export type IExtension = ModelTypes['Extension']
export type IGetExtensions = InputType<GraphQLTypes['Query'], typeof getExtensions>;
export type IGetExtensionsInput = ValueTypes['GetExtensionsInput']
