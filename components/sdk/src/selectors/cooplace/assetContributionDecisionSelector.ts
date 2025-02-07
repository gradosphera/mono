import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus'
import { rawDocumentMetaSelector, rawDocumentSelector } from '../common/documentSelector'
import { rawCommonRequestSelector } from './commonRequestResponseSelector'

// Определяем объект вручную, чтобы избежать потери типов
const rawAssetContributionDecisionDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    decision_id: true,
    request_id: true,
  },
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['AssetContributionDecisionDocument']>
  = rawAssetContributionDecisionDocumentSelector

// Передаём raw в селектор
export const assetContributionDecisionDocumentSelector = Selector('AssetContributionDecisionDocument')(rawAssetContributionDecisionDocumentSelector)
