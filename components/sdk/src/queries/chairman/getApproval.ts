import { approvalSelector } from '../../selectors/chairman'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chairmanApproval'

export const query = Selector('Query')({
  [name]: [{ id: $('id', 'String!') }, approvalSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  id: string
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
