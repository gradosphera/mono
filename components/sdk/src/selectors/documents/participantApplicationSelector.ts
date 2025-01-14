import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/documentSelector";

// Определяем объект вручную, чтобы избежать потери типов
export const rawParticipantApplicationDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    // ничего уникального
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ParticipantApplicationDocument']> =
rawParticipantApplicationDocumentSelector;

  // Передаём raw в селектор
export const participantApplicationDocumentSelector = Selector("ParticipantApplicationDocument")(rawParticipantApplicationDocumentSelector);
