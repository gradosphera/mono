import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['UninstallExtensionInput']

export const name = 'uninstallExtension'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'UninstallExtensionInput!')}, true]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['UninstallExtensionInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
