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
import { rawStorySelector } from './storySelector'
import { rawIssueSelector } from './issueSelector'
import { rawCommitSelector } from './commitSelector'
import { rawCycleSelector } from './cycleSelector'
import { rawExpenseSelector } from './expenseSelector'
import { rawTimeEntrySelector } from './timeEntrySelector'
import { rawTimeEntriesByIssuesSelector } from './timeEntriesByIssuesSelector'

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

// Пагинированный селектор для историй
const rawStoriesPaginationSelector = { ...paginationSelector, items: rawStorySelector }
const _validateStories: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalStoriesPaginationResult']> = rawStoriesPaginationSelector
export type storiesPaginationModel = ModelTypes['PaginatedCapitalStoriesPaginationResult']
export const storiesPaginationSelector = Selector('PaginatedCapitalStoriesPaginationResult')(rawStoriesPaginationSelector)

// Пагинированный селектор для задач
const rawIssuesPaginationSelector = { ...paginationSelector, items: rawIssueSelector }
const _validateIssues: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalIssuesPaginationResult']> = rawIssuesPaginationSelector
export type issuesPaginationModel = ModelTypes['PaginatedCapitalIssuesPaginationResult']
export const issuesPaginationSelector = Selector('PaginatedCapitalIssuesPaginationResult')(rawIssuesPaginationSelector)

// Пагинированный селектор для коммитов
const rawCommitsPaginationSelector = { ...paginationSelector, items: rawCommitSelector }
const _validateCommits: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalCommitsPaginationResult']> = rawCommitsPaginationSelector
export type commitsPaginationModel = ModelTypes['PaginatedCapitalCommitsPaginationResult']
export const commitsPaginationSelector = Selector('PaginatedCapitalCommitsPaginationResult')(rawCommitsPaginationSelector)

// Пагинированный селектор для циклов
const rawCyclesPaginationSelector = { ...paginationSelector, items: rawCycleSelector }
const _validateCycles: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalCyclesPaginationResult']> = rawCyclesPaginationSelector
export type cyclesPaginationModel = ModelTypes['PaginatedCapitalCyclesPaginationResult']
export const cyclesPaginationSelector = Selector('PaginatedCapitalCyclesPaginationResult')(rawCyclesPaginationSelector)

// Пагинированный селектор для расходов
const rawExpensesPaginationSelector = { ...paginationSelector, items: rawExpenseSelector }
const _validateExpenses: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalExpensesPaginationResult']> = rawExpensesPaginationSelector
export type expensesPaginationModel = ModelTypes['PaginatedCapitalExpensesPaginationResult']
export const expensesPaginationSelector = Selector('PaginatedCapitalExpensesPaginationResult')(rawExpensesPaginationSelector)

// Пагинированный селектор для записей времени
const rawTimeEntriesPaginationSelector = { ...paginationSelector, items: rawTimeEntrySelector }
const _validateTimeEntries: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalTimeEntriesPaginationResult']> = rawTimeEntriesPaginationSelector
export type timeEntriesPaginationModel = ModelTypes['PaginatedCapitalTimeEntriesPaginationResult']
export const timeEntriesPaginationSelector = Selector('PaginatedCapitalTimeEntriesPaginationResult')(rawTimeEntriesPaginationSelector)

// Пагинированный селектор для агрегированных записей времени по задачам
const rawTimeEntriesByIssuesPaginationSelector = { ...paginationSelector, items: rawTimeEntriesByIssuesSelector }
const _validateTimeEntriesByIssues: MakeAllFieldsRequired<ValueTypes['PaginatedCapitalTimeEntriesByIssuesPaginationResult']> = rawTimeEntriesByIssuesPaginationSelector
export type timeEntriesByIssuesPaginationModel = ModelTypes['PaginatedCapitalTimeEntriesByIssuesPaginationResult']
export const timeEntriesByIssuesPaginationSelector = Selector('PaginatedCapitalTimeEntriesByIssuesPaginationResult')(rawTimeEntriesByIssuesPaginationSelector)
