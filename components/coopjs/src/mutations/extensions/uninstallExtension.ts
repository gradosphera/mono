import { extensionSelector } from '../../selectors/extensions/extensionSelector';
import type { ValueTypes } from '../../types'
import { $, Selector, type ModelTypes } from '../../zeus';

export const uninstallExtension = Selector('Mutation')({
  uninstallExtension: [{data: $('data', 'UninstallExtensionInput!')}, true]
});

export type IUninstallExtensionInput = ModelTypes['UninstallExtensionInput']
