import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawBlockchainActionSelector } from '../common/blockchainActionSelector'
import { rawEntrepreneurSelector } from '../common/entrepreneurSelector'
import { rawIndividualSelector } from '../common/individualSelector'
import { rawOrganizationSelector } from '../common/organizationSelector'
import { rawDocumentAggregateSelector } from '../documents/documentAggregateSelector'

/**
 * Расширенные действия в блокчейне, общие для Act / Decision / Statement.
 */
export const rawExtendedBlockchainActionSelector = {
  ...rawBlockchainActionSelector,
  user: {
    '...on Entrepreneur': rawEntrepreneurSelector,
    '...on Individual': rawIndividualSelector,
    '...on Organization': rawOrganizationSelector,
  },
}

/** ActDetailAggregate — для поля documentAggregate указываем union типов актов. */
export const rawActDetailAggregateSelector = {
  action: rawExtendedBlockchainActionSelector,
  documentAggregate: rawDocumentAggregateSelector,
}

/** DecisionDetailAggregate — для поля documentAggregate указываем union (rawDecisionDocumentAggregateSelector). */
export const rawDecisionDetailAggregateSelector = {
  action: rawExtendedBlockchainActionSelector,
  documentAggregate: rawDocumentAggregateSelector,
  votes_against: rawExtendedBlockchainActionSelector,
  votes_for: rawExtendedBlockchainActionSelector,
}

/** StatementDetailAggregate — для поля documentAggregate указываем rawStatementDocumentAggregateSelector. */
export const rawStatementDetailAggregateSelector = {
  action: rawExtendedBlockchainActionSelector,
  documentAggregate: rawDocumentAggregateSelector,
}

/**
 * DocumentPackageAggregate, собирающий всё воедино:
 * - acts (ActDetailAggregate)
 * - decision (DecisionDetailAggregate)
 * - links (документный агрегат)
 * - statement (StatementDetailAggregate)
 */
export const rawDocumentPackageAggregateSelector = {
  acts: rawActDetailAggregateSelector,
  decision: rawDecisionDetailAggregateSelector,
  links: rawDocumentAggregateSelector,
  statement: rawStatementDetailAggregateSelector,
}

const _validate: MakeAllFieldsRequired<ValueTypes['DocumentPackageAggregate']> = rawDocumentPackageAggregateSelector

export type documentPackageAggregateModel = ModelTypes['DocumentPackageAggregate']
export const documentPackageAggregateSelector = Selector('DocumentPackageAggregate')(rawDocumentPackageAggregateSelector)
