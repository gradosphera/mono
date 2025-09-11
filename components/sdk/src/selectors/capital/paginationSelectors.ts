import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { paginationSelector } from '../../utils/paginationSelector'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawVoteSelector } from './voteSelector'
import { rawProjectSelector } from './projectSelector'
import { rawContributorSelector } from './contributorSelector'
import { rawInvestSelector } from './investSelector'
import { rawProgramInvestSelector } from './programInvestSelector'
import { rawDebtSelector } from './debtSelector'
import { rawResultSelector } from './resultSelector'

// Пагинированный селектор для голосований
const rawVotesPaginationSelector = { ...paginationSelector, items: rawVoteSelector }
const _validateVotes: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalVotesPaginationResult']> = rawVotesPaginationSelector
export type votesPaginationModel = ModelTypes['PaginatedCapitalVotesPaginationResult']
export const votesPaginationSelector = Selector('PaginatedCapitalVotesPaginationResult')(rawVotesPaginationSelector)

// Пагинированный селектор для проектов
const rawProjectsPaginationSelector = { ...paginationSelector, items: rawProjectSelector }
const _validateProjects: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalProjectsPaginationResult']> = rawProjectsPaginationSelector
export type projectsPaginationModel = ModelTypes['PaginatedCapitalProjectsPaginationResult']
export const projectsPaginationSelector = Selector('PaginatedCapitalProjectsPaginationResult')(rawProjectsPaginationSelector)

// Пагинированный селектор для вкладчиков
const rawContributorsPaginationSelector = { ...paginationSelector, items: rawContributorSelector }
const _validateContributors: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalContributorsPaginationResult']> = rawContributorsPaginationSelector
export type contributorsPaginationModel = ModelTypes['PaginatedCapitalContributorsPaginationResult']
export const contributorsPaginationSelector = Selector('PaginatedCapitalContributorsPaginationResult')(rawContributorsPaginationSelector)

// Пагинированный селектор для инвестиций
const rawInvestsPaginationSelector = { ...paginationSelector, items: rawInvestSelector }
const _validateInvests: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalInvestsPaginationResult']> = rawInvestsPaginationSelector
export type investsPaginationModel = ModelTypes['PaginatedCapitalInvestsPaginationResult']
export const investsPaginationSelector = Selector('PaginatedCapitalInvestsPaginationResult')(rawInvestsPaginationSelector)

// Пагинированный селектор для программных инвестиций
const rawProgramInvestsPaginationSelector = { ...paginationSelector, items: rawProgramInvestSelector }
const _validateProgramInvests: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalProgramInvestsPaginationResult']> = rawProgramInvestsPaginationSelector
export type programInvestsPaginationModel = ModelTypes['PaginatedCapitalProgramInvestsPaginationResult']
export const programInvestsPaginationSelector = Selector('PaginatedCapitalProgramInvestsPaginationResult')(rawProgramInvestsPaginationSelector)

// Пагинированный селектор для долгов
const rawDebtsPaginationSelector = { ...paginationSelector, items: rawDebtSelector }
const _validateDebts: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalDebtsPaginationResult']> = rawDebtsPaginationSelector
export type debtsPaginationModel = ModelTypes['PaginatedCapitalDebtsPaginationResult']
export const debtsPaginationSelector = Selector('PaginatedCapitalDebtsPaginationResult')(rawDebtsPaginationSelector)

// Пагинированный селектор для результатов
const rawResultsPaginationSelector = { ...paginationSelector, items: rawResultSelector }
const _validateResults: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalResultsPaginationResult']> = rawResultsPaginationSelector
export type resultsPaginationModel = ModelTypes['PaginatedCapitalResultsPaginationResult']
export const resultsPaginationSelector = Selector('PaginatedCapitalResultsPaginationResult')(rawResultsPaginationSelector)
