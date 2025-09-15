import { rawDeltaSelector } from '../../selectors/common/deltaSelector'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index'

const paginatedDeltasSelector = { ...paginationSelector, items: rawDeltaSelector }

export const name = 'getDeltas'

// Селектор запроса
export const query = Selector('Query')({
  [name]: [
    {
      filters: $('filters', 'DeltaFiltersInput'),
      pagination: $('pagination', 'PaginationInput'),
    },
    paginatedDeltasSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
  filters?: ModelTypes['DeltaFiltersInput']
  pagination?: ModelTypes['PaginationInput']
}

// Тип выходных данных
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
