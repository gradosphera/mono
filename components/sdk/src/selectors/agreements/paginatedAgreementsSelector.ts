import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { agreementSelector } from './agreementSelector'

export const rawPaginatedAgreementsSelector = {
  items: agreementSelector,
  totalCount: true,
  totalPages: true,
  currentPage: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['PaginatedAgreementsPaginationResult']> = rawPaginatedAgreementsSelector

export const paginatedAgreementsSelector = Selector('PaginatedAgreementsPaginationResult')(rawPaginatedAgreementsSelector)
