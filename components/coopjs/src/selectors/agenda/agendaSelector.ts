import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus";
import { rawBlockchainActionSelector } from "../common";
import { rawBlockchainDecisionSelector } from "../decisions/blockchainDecisionSelector";
import { rawDocumentPackageSelector } from "../documents/documentPackageSelector";

export const rawAgendaSelector = {
  action:      rawBlockchainActionSelector,
  documents:     rawDocumentPackageSelector,
  table: rawBlockchainDecisionSelector,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['AgendaWithDocuments']> = rawAgendaSelector;

export type agendaModel = ModelTypes['AgendaWithDocuments'];
export const agendaSelector = Selector('AgendaWithDocuments')(rawAgendaSelector);
