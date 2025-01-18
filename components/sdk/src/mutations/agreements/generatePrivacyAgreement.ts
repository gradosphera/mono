import { documentSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'generatePrivacyAgreement'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'GenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput')}, documentSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['GenerateDocumentInput'],
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

