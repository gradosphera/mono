import { rawCurrentTableStateSelector } from '../../selectors/common/currentTableStateSelector'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index'

export const name = 'getCurrentTableStates'
const paginatedCurrentTableStatesSelector = { ...paginationSelector, items: rawCurrentTableStateSelector }

// Селектор запроса
export const query = Selector('Query')({
  [name]: [
    {
      filters: $('filters', 'CurrentTableStatesFiltersInput'),
      pagination: $('pagination', 'PaginationInput'),
    },
    paginatedCurrentTableStatesSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
  filters?: ModelTypes['CurrentTableStatesFiltersInput']
  pagination?: ModelTypes['PaginationInput']
}

// Тип выходных данных
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
