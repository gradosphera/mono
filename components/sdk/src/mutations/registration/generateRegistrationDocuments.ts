import { generateRegistrationDocumentsOutputSelector } from '../../selectors/registration'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateRegistrationDocuments'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'GenerateRegistrationDocumentsInput!') }, generateRegistrationDocumentsOutputSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GenerateRegistrationDocumentsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
