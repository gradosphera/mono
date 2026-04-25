import { ledger2AdjustmentResultSelector } from '../../selectors/ledger2/ledger2AdjustmentResultSelector'
import { $, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'revertOperation'

/**
 * Откат ранее проведённой операции зеркальной проводкой (operation `o.adj.rev`).
 * Только председатель. Запрещено откатывать миграционные операции (o.mig.*).
 */
export const mutation = Selector('Mutation')({
  [name]: [{ input: $('input', 'RevertOperationInput!') }, ledger2AdjustmentResultSelector],
})

export interface IInput {
  input: ModelTypes['RevertOperationInput']
}

export interface IOutput {
  [name]: ModelTypes['Ledger2AdjustmentResult']
}
