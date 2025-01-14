import { projectFreeDecisionDocumentSelector } from '../../selectors/documents/projectFreeDecisionSelector';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'generateProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'ProjectFreeDecisionGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput!')}, projectFreeDecisionDocumentSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['ProjectFreeDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput'];
}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;

