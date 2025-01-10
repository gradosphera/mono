import { extensionSelector, type extensionModel } from '../../selectors/extensions/extensionSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'installExtension'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ExtensionInput!')}, extensionSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['ExtensionInput'],
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
