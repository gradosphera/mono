import { getExtensionsSelector } from '../queries/getExtensions';
import type { ValueTypes } from '../types'
import { $, Selector } from '../zeus';

export const installExtension = Selector('Mutation')({
  installExtension: [{data: $('data', 'ExtensionInput!')}, getExtensionsSelector]
});

export type IInstallExtensionInput = ValueTypes['ExtensionInput']
