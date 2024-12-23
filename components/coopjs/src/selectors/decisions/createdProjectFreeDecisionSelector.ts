import type { ModelTypes } from "../../../dist";
import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type GraphQLTypes, type InputType, type ValueTypes } from "../../zeus";
import { rawDocumentMetaSelector, rawDocumentSelector } from "../common/rawDocumentSelector";

// Определяем объект вручную, чтобы избежать потери типов
const rawFreeProjectSelector = {
  decision: true,
  header: true,
  id: true,
  question: true,
};

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['CreatedProjectFreeDecision']> =
rawFreeProjectSelector;

  // Передаём raw в селектор
export const createdProjectFreeDecisionSelector = Selector("CreatedProjectFreeDecision")(rawFreeProjectSelector);
