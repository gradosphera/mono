import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus/index";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/documentSelector";

// Определяем объект вручную, чтобы избежать потери типов
export const rawParticipantApplicationDecisionDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    decision_id: true
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ParticipantApplicationDecisionDocument']> =
rawParticipantApplicationDecisionDocumentSelector;

// Передаём raw в селектор
export const participantApplicationDecisionDocumentSelector = Selector("ParticipantApplicationDecisionDocument")(rawParticipantApplicationDecisionDocumentSelector);
