import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus/index'
import { rawDocumentMetaSelector, rawDocumentSelector } from '../common/documentSelector'

// Определяем объект вручную, чтобы избежать потери типов
const rawAssetContributionActDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    request_id: true,
    act_id: true,
    braname: true,
    decision_id: true,
    receiver: true,
  },
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['AssetContributionActDocument']>
  = rawAssetContributionActDocumentSelector

// Передаём raw в селектор
export const assetContributionActDocumentSelector = Selector('AssetContributionActDocument')(rawAssetContributionActDocumentSelector)
