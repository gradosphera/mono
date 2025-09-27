import { approvalSelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chairmanConfirmApprove'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ConfirmApproveInput!') }, approvalSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ConfirmApproveInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
