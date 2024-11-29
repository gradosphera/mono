import { extensionSelector } from '../../selectors/extensions/extensionSelector';
import type { ValueTypes } from '../../types'
import { $, Selector, type ModelTypes } from '../../zeus';

export const installExtension = Selector('Mutation')({
  installExtension: [{data: $('data', 'ExtensionInput!')}, extensionSelector]
});

export type IInstallExtensionInput = ModelTypes['ExtensionInput']
