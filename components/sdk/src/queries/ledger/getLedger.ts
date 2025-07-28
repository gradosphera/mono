import { ledgerStateSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getLedger'

/**
 * Получить полное состояние плана счетов кооператива
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetLedgerInput!') }, ledgerStateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetLedgerInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query> 