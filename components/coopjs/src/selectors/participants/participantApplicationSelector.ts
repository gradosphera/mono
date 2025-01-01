import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/rawDocumentSelector";

// Определяем объект вручную, чтобы избежать потери типов
const rawParticipantApplicationDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ParticipantApplicationDocument']> =
rawParticipantApplicationDocumentSelector;

// Передаём raw в селектор
export const participantApplicationDocumentSelector = Selector("ParticipantApplicationDocument")(rawParticipantApplicationDocumentSelector);
