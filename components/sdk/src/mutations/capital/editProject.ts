import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalEditProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'EditProjectInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['EditProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
