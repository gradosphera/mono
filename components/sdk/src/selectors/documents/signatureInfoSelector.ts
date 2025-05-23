import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import type { ModelTypes, ValueTypes } from '../../zeus/index'
import { Selector } from '../../zeus/index'
import { rawUserCertificateUnionSelector } from '../common/userCertificateUnionSelector'

export const rawSignatureInfoSelector = {
  id: true,
  signer: true,
  public_key: true,
  signature: true,
  signed_at: true,
  is_valid: true,
  signer_certificate: rawUserCertificateUnionSelector,
  signed_hash: true,
  meta: true,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['SignatureInfo']> = rawSignatureInfoSelector

export type SignatureInfoModel = ModelTypes['SignatureInfo']
export const signatureInfoSelector = Selector('SignatureInfo')(rawSignatureInfoSelector)
