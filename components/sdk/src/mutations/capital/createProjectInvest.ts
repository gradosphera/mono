import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateProjectInvest'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProjectInvestInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateProjectInvestInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
