import { generateSelectBranchDocumentSelector } from '../../selectors/branches/selectBranchDocumentSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index';

export const name = 'generateSelectBranchDocument'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'SelectBranchGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput')}, generateSelectBranchDocumentSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['SelectBranchDocument'],
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
