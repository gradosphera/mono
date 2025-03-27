import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { paginationSelector } from '../../utils/paginationSelector'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawBlockchainAccountSelector } from '../common/blockchainAccountSelector'
import { rawAccountSelector } from './accountSelector'
import { rawMonoAccountSelector } from './monoAccountSelector'
import { rawParticipantAccountSelector } from './participantAccountSelector'
import { rawUserAccountSelector } from './userAccountSelector'

const rawAccountsPaginationSelector = { ...paginationSelector, items: rawAccountSelector }

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['AccountsPaginationResult']> = rawAccountsPaginationSelector
export type accountsModel = ModelTypes['AccountsPaginationResult']
export const accountsPaginationSelector = Selector('AccountsPaginationResult')(rawAccountsPaginationSelector)
