import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import type { ValueTypes } from '../../zeus/index'
import { rawEntrepreneurSelector } from './entrepreneurSelector'
import { rawIndividualSelector } from './individualSelector'
import { rawOrganizationSelector } from './organizationSelector'
// Селектор для подписи документа
export const rawUserUnionSelector = {
  '...on Entrepreneur': rawEntrepreneurSelector,
  '...on Individual': rawIndividualSelector,
  '...on Organization': rawOrganizationSelector,
}

export const userUnionSelector = rawUserUnionSelector

// Проверка валидности селектора документа на первом попавшемся типе т.к. абстрактные типы zeus в документацию не затягивает
const _validate: MakeAllFieldsRequired<ValueTypes['UserDataUnion']> = rawUserUnionSelector
