import { candidatesPaginationSelector } from '../../selectors/registration/paginationSelectors'
import { $, type ModelTypes, Selector } from '../../zeus/index'

export const getCandidatesQuery = Selector('Query')({
  candidates: [
    {
      filter: $('filter', 'CandidateFilterInput'),
      options: $('options', 'PaginationInput'),
    },
    candidatesPaginationSelector,
  ],
})

export interface IGetCandidatesInput {
  filter?: ModelTypes['CandidateFilterInput']
  options?: ModelTypes['PaginationInput']
}
