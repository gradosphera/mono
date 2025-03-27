import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus/index";
import { rawEntrepreneurSelector } from "../common/entrepreneurSelector";
import { rawIndividualSelector } from "../common/individualSelector";
import { rawOrganizationSelector } from "../common/organizationSelector";
import { rawDocumentSelector } from "../common/documentSelector";
import { rawFreeDecisionDocumentSelector } from "../decisions";
import { rawParticipantApplicationDecisionDocumentSelector } from "../participants/participantApplicationDecisionSelector";
import { rawParticipantApplicationDocumentSelector } from "./participantApplicationSelector";
import { projectFreeDecisionDocumentSelector } from "./projectFreeDecisionSelector";
import { rawBlockchainActionSelector } from "../common/blockchainActionSelector";

/** 
 * Для Decision — используется union из FreeDecisionDocument и ParticipantApplicationDecisionDocument.
 * Каждая ветка раскрывает поля конкретного типа.
 */
export const rawDecisionDocumentSelector = {
  ['...on FreeDecisionDocument']: rawFreeDecisionDocumentSelector,
  ['...on ParticipantApplicationDecisionDocument']: rawParticipantApplicationDecisionDocumentSelector
};

/**
 * Для Statement — отдельный набор полей (если отличается).
 * Если StatementDocument не юнион, то достаточно такого же формата,
 * либо кастомный, если поля иные, чем у Act.
 */
export const rawStatementDocumentSelector = {
  ['...on ParticipantApplicationDocument']: rawParticipantApplicationDocumentSelector,
  ['...on ProjectFreeDecisionDocument']: projectFreeDecisionDocumentSelector,
};

/**
 * Расширенные действия в блокчейне, общие для Act / Decision / Statement.
 */
export const rawExtendedBlockchainActionSelector = {
  ...rawBlockchainActionSelector,
  user: {
    ['...on Entrepreneur']: rawEntrepreneurSelector,
    ['...on Individual']: rawIndividualSelector,
    ['...on Organization']: rawOrganizationSelector
  },
};

/** ActDetail — для поля document указываем rawDocumentSelector (обычный). */
export const rawActDetailSelector = {
  action:   rawExtendedBlockchainActionSelector,
  document: rawDocumentSelector,
};

/** DecisionDetail — для поля document указываем union (rawDecisionDocumentSelector). */
export const rawDecisionDetailSelector = {
  action:        rawExtendedBlockchainActionSelector,
  document:      rawDecisionDocumentSelector,
  votes_against: rawExtendedBlockchainActionSelector,
  votes_for:     rawExtendedBlockchainActionSelector,
};

/** StatementDetail — для поля document указываем rawStatementDocumentSelector. */
export const rawStatementDetailSelector = {
  action:   rawExtendedBlockchainActionSelector,
  document: rawStatementDocumentSelector,
};

/**
 * DocumentPackage, собирающий всё воедино:
 * - acts (ActDetail)
 * - decision (DecisionDetail)
 * - links (обычный документ)
 * - statement (StatementDetail)
 */
export const rawDocumentPackageSelector = {
  acts:      rawActDetailSelector,
  decision:  rawDecisionDetailSelector,
  links:     rawDocumentSelector,
  statement: rawStatementDetailSelector,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['DocumentPackage']> = rawDocumentPackageSelector;

export type documentPackageModel = ModelTypes['DocumentPackage'];
export const documentPackageSelector = Selector('DocumentPackage')(rawDocumentPackageSelector);
