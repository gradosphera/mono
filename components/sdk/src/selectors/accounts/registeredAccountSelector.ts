import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { rawAccountSelector } from './accountSelector'

export const rawTokenSelector = {
  expires: true,
  token: true,
}

export const rawTokensSelector = {
  access: rawTokenSelector,
  refresh: rawTokenSelector,
}

export const rawRegisteredAccountSelector = {
  account: rawAccountSelector,
  tokens: rawTokensSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['RegisteredAccount']> = rawRegisteredAccountSelector

export const registeredAccountSelector = Selector('RegisteredAccount')(
  rawRegisteredAccountSelector,
)
