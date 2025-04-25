import type { GraphQLTypes, InputType, ModelTypes } from '../../zeus/index'
import { rawPaymentSelector } from '../../selectors/payments'
import { paginationSelector } from '../../utils/paginationSelector'
import { $, Selector } from '../../zeus/index'

const paymentPaginationSelector = { ...paginationSelector, items: rawPaymentSelector }
const name = 'getPayments'

/**
 * Извлекает платежи
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetPaymentsInput') }, paymentPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetPaymentsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
