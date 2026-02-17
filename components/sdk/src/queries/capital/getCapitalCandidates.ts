import { capitalCandidatesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCandidates'

export const query = Selector('Query')({
  [name]: [
    {
      filter: $('filter', 'CandidateFilterInput'),
      options: $('options', 'PaginationInput'),
    },
    capitalCandidatesPaginationSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['CandidateFilterInput']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
