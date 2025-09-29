import { paginatedAgreementsSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'agreements'

export const query = Selector('Query')({
  [name]: [
    {
      filter: $('filter', 'AgreementFilter'),
      options: $('options', 'PaginationInput'),
    },
    paginatedAgreementsSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['AgreementFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
