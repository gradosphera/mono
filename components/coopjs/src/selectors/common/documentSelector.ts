import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

export const rawDocumentMetaSelector = {
  block_num: true,
  coopname: true,
  created_at: true,
  generator: true,
  lang: true,
  links: true,
  registry_id: true,
  timezone: true,
  title: true,
  username: true,
  version: true,
};

export const rawDocumentSelector = {
  binary: true,
  full_title: true,
  hash: true,
  html: true,
  meta: rawDocumentMetaSelector, // Общая часть meta
};


// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['GeneratedDocument']> =
rawDocumentSelector;

  // Передаём raw в селектор
export const documentSelector = Selector('GeneratedDocument')(rawDocumentSelector);
