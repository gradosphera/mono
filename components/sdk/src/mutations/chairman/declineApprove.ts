import { approvalSelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chairmanDeclineApprove'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeclineApproveInput!') }, approvalSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeclineApproveInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
