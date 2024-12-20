import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type GraphQLTypes, type InputType, type ValueTypes } from "../../zeus";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/rawDocumentSelector";

// Определяем объект вручную, чтобы избежать потери типов
const rawSelectBranchDocumentSelector = {
  ...rawDocumentSelector,
  meta: {
    ...rawDocumentMetaSelector, // Общая часть meta
    braname: true, // Уникальное дополнение
  },
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['SelectBranchDocument']> =
  rawSelectBranchDocumentSelector;

  // Передаём raw в селектор
export const generateSelectBranchDocumentSelector = Selector("SelectBranchDocument")(rawSelectBranchDocumentSelector);
