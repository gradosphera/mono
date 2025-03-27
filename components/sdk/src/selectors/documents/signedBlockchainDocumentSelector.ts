import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus/index";

export const rawSignedBlockchainDocumentSelector = {
  hash: true,
  meta: true,
  public_key: true,
  signature: true,
};


// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['SignedBlockchainDocument']> = rawSignedBlockchainDocumentSelector;

export type SignedBlockchainDocumentModel = ModelTypes['SignedBlockchainDocument'];
export const signedBlockchainDocumentSelector = Selector('SignedBlockchainDocument')(rawSignedBlockchainDocumentSelector);
