import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { programWalletSelector } from './programWalletSelector'

export const rawProgramWalletsPaginationSelector = {
  items: programWalletSelector,
  totalCount: true,
  totalPages: true,
  currentPage: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['ProgramWalletsPaginationResult']> = rawProgramWalletsPaginationSelector

export const programWalletsPaginationSelector = Selector('ProgramWalletsPaginationResult')(rawProgramWalletsPaginationSelector)