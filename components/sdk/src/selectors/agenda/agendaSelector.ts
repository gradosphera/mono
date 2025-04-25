import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawBlockchainActionSelector } from '../common'
import { rawBlockchainDecisionSelector } from '../decisions/blockchainDecisionSelector'
import { rawDocumentPackageAggregateSelector } from './documentPackageAggregateSelector'

export const rawAgendaSelector = {
  action: rawBlockchainActionSelector,
  documents: rawDocumentPackageAggregateSelector,
  table: rawBlockchainDecisionSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['AgendaWithDocuments']> = rawAgendaSelector

export type agendaModel = ModelTypes['AgendaWithDocuments']
export const agendaSelector = Selector('AgendaWithDocuments')(rawAgendaSelector)
