import { extensionSelector } from '../../selectors/extensions/extensionSelector';
import type { ValueTypes } from '../../types'
import { $, Selector, type ModelTypes } from '../../zeus';

export const updateExtension = Selector('Mutation')({
  updateExtension: [{data: $('data', 'ExtensionInput!')}, extensionSelector]
});

export type IUpdateExtensionInput = ModelTypes['ExtensionInput']
