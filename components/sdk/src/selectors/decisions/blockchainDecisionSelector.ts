import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus/index";
import { rawSignedBlockchainDocumentSelector } from "../documents/signedBlockchainDocumentSelector";

export const rawBlockchainDecisionSelector = {
  approved: true,
  authorization: rawSignedBlockchainDocumentSelector,
  authorized: true,
  authorized_by: true,
  batch_id: true,
  coopname: true,
  created_at: true,
  expired_at: true,
  id: true,
  meta: true,
  statement: rawSignedBlockchainDocumentSelector,
  type: true,
  username: true,
  validated: true,
  votes_against: true,
  votes_for: true,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['SignedBlockchainDocument']> = rawSignedBlockchainDocumentSelector;

export type blockchainDecisionModel = ModelTypes['SignedBlockchainDocument'];
export const blockchainDecisionSelector = Selector('SignedBlockchainDocument')(rawSignedBlockchainDocumentSelector);
