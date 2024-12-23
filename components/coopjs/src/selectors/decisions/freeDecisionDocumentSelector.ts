import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/rawDocumentSelector";

// Определяем объект вручную, чтобы избежать потери типов
const rawFreeDecisionDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    project_id: true, // Уникальное дополнение
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ProjectFreeDecisionDocument']> =
rawFreeDecisionDocumentSelector;

  // Передаём raw в селектор
export const projectFreeDecisionDocumentSelector = Selector("ProjectFreeDecisionDocument")(rawFreeDecisionDocumentSelector);
