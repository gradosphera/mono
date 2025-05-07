import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawSignatureInfoSelector } from './signatureInfoSelector'

export const rawSignedBlockchainDocumentSelector = {
  version: true,
  hash: true,
  doc_hash: true,
  meta_hash: true,
  meta: true,
  signatures: rawSignatureInfoSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['SignedBlockchainDocument']> = rawSignedBlockchainDocumentSelector

export type SignedBlockchainDocumentModel = ModelTypes['SignedBlockchainDocument']
export const signedBlockchainDocumentSelector = Selector('SignedBlockchainDocument')(rawSignedBlockchainDocumentSelector)
