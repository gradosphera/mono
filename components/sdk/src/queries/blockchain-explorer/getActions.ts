import { rawBlockchainActionSelector } from '../../selectors/common/blockchainActionSelector'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index'

const paginatedActionsSelector = { ...paginationSelector, items: rawBlockchainActionSelector }

export const name = 'getActions'

// Селектор запроса
export const query = Selector('Query')({
  [name]: [
    {
      filters: $('filters', 'ActionFiltersInput'),
      pagination: $('pagination', 'PaginationInput'),
    },
    paginatedActionsSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
  filters?: ModelTypes['ActionFiltersInput']
  pagination?: ModelTypes['PaginationInput']
}

// Тип выходных данных
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
