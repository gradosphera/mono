import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { rawOrganizationWithBankSelector } from '../common'

export const rawInstallationStatusSelector = {
  has_private_account: true,
  init_by_server: true,
  organization_data: rawOrganizationWithBankSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['InstallationStatus']> = rawInstallationStatusSelector

export const installationStatusSelector = Selector('InstallationStatus')(rawInstallationStatusSelector)
