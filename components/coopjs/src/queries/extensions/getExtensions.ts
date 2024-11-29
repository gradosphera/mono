import type { ValueTypes } from '../../types'
import type { GraphQLTypes, ModelTypes } from '../../zeus';
import { $, InputType, Selector } from '../../zeus';
import { extensionSelector } from '../../selectors/extensions/extensionSelector';

/**
 * Извлекает расширения 
 */
export const getExtensions = Selector("Query")({
  getExtensions: [{data: $('data', 'GetExtensionsInput')}, extensionSelector]
});
