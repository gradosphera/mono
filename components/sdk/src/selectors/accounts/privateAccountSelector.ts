import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { entrepreneurSelector, individualSelector, organizationSelector } from '../common'

export const rawPrivateAccountSelector = {
  type: true,
  individual_data: individualSelector,
  organization_data: organizationSelector,
  entrepreneur_data: entrepreneurSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['PrivateAccount']> = rawPrivateAccountSelector

export const privateAccountSelector = Selector('PrivateAccount')(
  rawPrivateAccountSelector,
)
