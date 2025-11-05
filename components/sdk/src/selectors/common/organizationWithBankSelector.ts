import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import type { ValueTypes } from '../../zeus/index'
import { rawBankAccountSelector } from './bankAccountSelector'
import { rawOrganizationSelector } from './organizationSelector'

// "Сырой" объект
export const rawOrganizationWithBankSelector = {
  bank_account: rawBankAccountSelector,
  ...rawOrganizationSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['OrganizationWithBankAccount']> = rawOrganizationWithBankSelector

export const organizationWithBankSelector = rawOrganizationWithBankSelector // Используем "сырой" объект напрямую
