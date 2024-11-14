import { getExtensionsSelector } from '../queries/getExtensions';
import type { ValueTypes } from '../types'
import { $, Selector } from '../zeus';

export const uninstallExtension = Selector('Mutation')({
  uninstallExtension: [{data: $('data', 'UninstallExtensionInput!')}, true]
});

export type IUninstallExtensionInput = ValueTypes['UninstallExtensionInput']
