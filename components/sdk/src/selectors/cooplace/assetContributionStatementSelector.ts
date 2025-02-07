import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus'
import { rawDocumentMetaSelector, rawDocumentSelector } from '../common/documentSelector'
import { rawCommonRequestSelector } from './commonRequestResponseSelector'

// Определяем объект вручную, чтобы избежать потери типов
const rawAssetContributionStatementDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    request: rawCommonRequestSelector,
  },
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['AssetContributionStatementDocument']>
  = rawAssetContributionStatementDocumentSelector

// Передаём raw в селектор
export const assetContributionStatementDocumentSelector = Selector('AssetContributionStatementDocument')(rawAssetContributionStatementDocumentSelector)
