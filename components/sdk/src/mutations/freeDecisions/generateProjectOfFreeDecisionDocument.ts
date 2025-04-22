import { projectFreeDecisionDocumentSelector } from '../../selectors/documents/projectFreeDecisionSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ProjectFreeDecisionGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, projectFreeDecisionDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ProjectFreeDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
