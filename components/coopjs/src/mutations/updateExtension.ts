import { getExtensionsSelector } from '../queries/getExtensions';
import type { ValueTypes } from '../types'
import { $, Selector } from '../zeus';

export const updateExtension = Selector('Mutation')({
  updateExtension: [{data: $('data', 'ExtensionInput!')}, getExtensionsSelector]
});

export type IUpdateExtensionInput = ValueTypes['ExtensionInput']
