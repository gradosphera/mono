import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalFundProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'FundProjectInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['FundProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
