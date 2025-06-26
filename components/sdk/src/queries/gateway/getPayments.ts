import { rawPaymentSelector } from '../../selectors/gateway/paymentSelector'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus/index'

const paginatedPaymentsSelector = { ...paginationSelector, items: rawPaymentSelector }

export const name = 'getPayments'

// Селектор запроса
export const query = Selector('Query')({
  [name]: [
    {
      data: $('data', 'PaymentFiltersInput'),
      options: $('options', 'PaginationInput'),
    },
    paginatedPaymentsSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
  data?: ModelTypes['PaymentFiltersInput']
  options?: ModelTypes['PaginationInput']
}

// Тип выходных данных
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
