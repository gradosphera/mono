import { freeDecisionDocumentSelector } from '../../selectors/decisions'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'FreeDecisionGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, freeDecisionDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['FreeDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
