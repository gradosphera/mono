import { approvalsPaginationSelector } from '../../selectors/chairman'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chairmanApprovals'

export const query = Selector('Query')({
  [name]: [
    {
      filter: $('filter', 'ApprovalFilter'),
      options: $('options', 'PaginationInput'),
    },
    approvalsPaginationSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['ApprovalFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
