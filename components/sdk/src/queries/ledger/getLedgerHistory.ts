import { rawLedgerHistorySelector } from '../../selectors/ledger/ledgerHistorySelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getLedgerHistory'

/**
 * Получить историю операций по счетам кооператива
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetLedgerHistoryInput!') }, rawLedgerHistorySelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetLedgerHistoryInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query> 