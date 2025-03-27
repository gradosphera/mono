import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus/index";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/documentSelector";

// Определяем объект вручную, чтобы избежать потери типов
export const rawProjectFreeDecisionDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    project_id: true, // Уникальное дополнение
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['ProjectFreeDecisionDocument']> =
rawProjectFreeDecisionDocumentSelector;

  // Передаём raw в селектор
export const projectFreeDecisionDocumentSelector = Selector("ProjectFreeDecisionDocument")(rawProjectFreeDecisionDocumentSelector);
