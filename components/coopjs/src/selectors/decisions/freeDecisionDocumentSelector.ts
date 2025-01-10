import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/documentSelector";

// Определяем объект вручную, чтобы избежать потери типов
export const rawFreeDecisionDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    project_id: true, // Уникальное дополнение
    decision_id: true,
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['FreeDecisionDocument']> =
rawFreeDecisionDocumentSelector;

  // Передаём raw в селектор
export const freeDecisionDocumentSelector = Selector("FreeDecisionDocument")(rawFreeDecisionDocumentSelector);
