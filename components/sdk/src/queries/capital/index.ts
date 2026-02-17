/** Запросы для CAPITAL контракта */
export * as GetCapitalCandidates from './getCapitalCandidates'

/** Получить коммит по HASH */
export * as GetCommit from './getCommit'

/** Получить все коммиты с фильтрацией */
export * as GetCommits from './getCommits'

/** Получить участника по ID */
export * as GetContributor from './getContributor'

/** Получить всех участников с фильтрацией */
export * as GetContributors from './getContributors'

/** Получить все циклы с фильтрацией */
export * as GetCycles from './getCycles'

/** Получить долг по ID */
export * as GetDebt from './getDebt'

/** Получить все долги с фильтрацией */
export * as GetDebts from './getDebts'

/** Получить расход по ID */
export * as GetExpense from './getExpense'

/** Получить все расходы с фильтрацией */
export * as GetExpenses from './getExpenses'

/** Получить инвестицию по ID */
export * as GetInvest from './getInvest'

/** Получить все инвестиции с фильтрацией */
export * as GetInvests from './getInvests'

/** Получить задачу по HASH */
export * as GetIssue from './getIssue'

/** Получить логи по задаче с пагинацией */
export * as GetIssueLogs from './getIssueLogs'

/** Получить все задачи с фильтрацией */
export * as GetIssues from './getIssues'

/** Получить состояние онбординга CAPITAL */
export * as GetOnboardingState from './getOnboardingState'

/** Получить программную инвестицию по ID */
export * as GetProgramInvest from './getProgramInvest'

/** Получить все программные инвестиции с фильтрацией */
export * as GetProgramInvests from './getProgramInvests'

/** Получить проект по ID */
export * as GetProject from './getProject'

/** Получить логи по проекту с фильтрацией и пагинацией */
export * as GetProjectLogs from './getProjectLogs'

/** Получить все проекты с фильтрацией */
export * as GetProjects from './getProjects'

/** Получить проект с полными отношениями */
export * as GetProjectWithRelations from './getProjectWithRelations'

/** Получить результат по ID */
export * as GetResult from './getResult'

/** Получить все результаты с фильтрацией */
export * as GetResults from './getResults'

/** Получить сегмент по фильтрам */
export * as GetSegment from './getSegment'

/** Получить все сегменты с фильтрацией */
export * as GetSegments from './getSegments'

/** Получить состояние CAPITAL контракта */
export * as GetState from './getState'

/** Получить все истории с фильтрацией */
export * as GetStories from './getStories'

/** Получить историю по HASH */
export * as GetStory from './getStory'

/** Получить пагинированный список записей времени */
export * as GetTimeEntries from './getTimeEntries'

/** Получить пагинированный список агрегированных записей времени по задачам */
export * as GetTimeEntriesByIssues from './getTimeEntriesByIssues'

/** Получить гибкую статистику времени с пагинацией */
export * as GetTimeStats from './getTimeStats'

/** Получить голос по ID */
export * as GetVote from './getVote'

/** Получить все голоса с фильтрацией */
export * as GetVotes from './getVotes'
