import { extensionSelector, type extensionModel } from '../../selectors/extensions/extensionSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['ExtensionInput']
export const name = 'installExtension'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ExtensionInput!')}, extensionSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
