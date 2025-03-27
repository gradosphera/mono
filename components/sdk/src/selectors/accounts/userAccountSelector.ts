import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'

export const rawUserAccountSelector = {
  meta: true,
  referer: true,
  registered_at: true,
  registrator: true,
  status: true,
  storages: true,
  type: true,
  username: true,
  verifications: {
    created_at: true,
    is_verified: true,
    last_update: true,
    notice: true,
    procedure: true,
    verificator: true,
  },
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['UserAccount']> = rawUserAccountSelector

export const userAccountSelector = Selector('UserAccount')(
  rawUserAccountSelector,
)
