import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalRegisterContributor'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RegisterContributorInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RegisterContributorInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
