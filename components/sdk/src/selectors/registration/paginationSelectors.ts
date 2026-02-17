import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { paginationSelector } from '../../utils/paginationSelector'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawCapitalCandidateSelector } from '../capital/capitalCandidateSelector'
import { rawCandidateSelector } from './candidateSelector'

// Пагинированный селектор для кандидатов
export const rawCandidatesPaginationSelector = { ...paginationSelector, items: rawCandidateSelector }

const _validateCandidates: MakeAllFieldsRequired<ValueTypes['PaginatedCandidatesPaginationResult']>
  = rawCandidatesPaginationSelector

export type candidatesPaginationModel = ModelTypes['PaginatedCandidatesPaginationResult']
export const candidatesPaginationSelector = Selector('PaginatedCandidatesPaginationResult')(
  rawCandidatesPaginationSelector,
)
