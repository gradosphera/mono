import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['UninstallExtensionInput']

export const name = 'uninstallExtension'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'UninstallExtensionInput!')}, true]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
