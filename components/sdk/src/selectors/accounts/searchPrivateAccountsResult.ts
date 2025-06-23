import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { rawEntrepreneurSelector, rawIndividualSelector, rawOrganizationSelector } from '../common'
import { rawAccountSelector } from './accountSelector'


export const rawSearchPrivateAccountsResultSelector = {
  type: true,
  score: true,
  highlightedFields: true,
  data: {
    '...on Individual': rawIndividualSelector,
    '...on Entrepreneur': rawEntrepreneurSelector,
    '...on Organization': rawOrganizationSelector,
  },
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['PrivateAccountSearchResult']> = rawSearchPrivateAccountsResultSelector

export const privateAccountSearchResultSelector = Selector('PrivateAccountSearchResult')(
  rawSearchPrivateAccountsResultSelector,
)
