import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

const rawProgramInvestSelector = {
  _id: true,
  id: true,
  block_num: true,
  present: true,
  status: true,
  invest_hash: true,
  coopname: true,
  username: true,
  blockchain_status: true,
  invested_at: true,
  amount: true,
  statement: rawDocumentAggregateSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['CapitalProgramInvest']> = rawProgramInvestSelector

export type programInvestModel = ModelTypes['CapitalProgramInvest']

export const programInvestSelector = Selector('CapitalProgramInvest')(rawProgramInvestSelector)
export { rawProgramInvestSelector }
