import { rawOutgoingPaymentSelector } from '../../selectors'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index'

const paginatedPaymentsSelector = { ...paginationSelector, items: rawOutgoingPaymentSelector }

export const name = 'getGatewayPayments'

// Селектор запроса
export const query = Selector('Query')({
  [name]: [
    {
      filters: $('filters', 'GetOutgoingPaymentsInput!'),
      options: $('options', 'PaginationInput!'),
    },
    paginatedPaymentsSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
  filters: ModelTypes['GetOutgoingPaymentsInput']
  options: ModelTypes['PaginationInput']
}

// Тип выходных данных
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
