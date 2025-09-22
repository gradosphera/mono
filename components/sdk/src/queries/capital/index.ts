/** Запросы для CAPITAL контракта */

/** Получить все голоса с фильтрацией */
export * as GetVotes from './getVotes'

/** Получить голос по ID */
export * as GetVote from './getVote'

/** Получить все проекты с фильтрацией */
export * as GetProjects from './getProjects'

/** Получить проект по ID */
export * as GetProject from './getProject'

/** Получить проект с полными отношениями */
export * as GetProjectWithRelations from './getProjectWithRelations'

/** Получить всех вкладчиков с фильтрацией */
export * as GetContributors from './getContributors'

/** Получить вкладчика по ID */
export * as GetContributor from './getContributor'

/** Получить все инвестиции с фильтрацией */
export * as GetInvests from './getInvests'

/** Получить инвестицию по ID */
export * as GetInvest from './getInvest'

/** Получить все программные инвестиции с фильтрацией */
export * as GetProgramInvests from './getProgramInvests'

/** Получить программную инвестицию по ID */
export * as GetProgramInvest from './getProgramInvest'

/** Получить все долги с фильтрацией */
export * as GetDebts from './getDebts'

/** Получить долг по ID */
export * as GetDebt from './getDebt'

/** Получить все результаты с фильтрацией */
export * as GetResults from './getResults'

/** Получить результат по ID */
export * as GetResult from './getResult'

/** Получить все расходы с фильтрацией */
export * as GetExpenses from './getExpenses'

/** Получить расход по ID */
export * as GetExpense from './getExpense'

/** Получить гибкую статистику времени с пагинацией */
export * as GetTimeStats from './getTimeStats'

/** Получить пагинированный список записей времени */
export * as GetTimeEntries from './getTimeEntries'

/** Получить пагинированный список агрегированных записей времени по задачам */
export * as GetTimeEntriesByIssues from './getTimeEntriesByIssues'

/** Получить коммит по HASH */
export * as GetCommit from './getCommit'

/** Получить все истории с фильтрацией */
export * as GetStories from './getStories'

/** Получить историю по HASH */
export * as GetStory from './getStory'

/** Получить все задачи с фильтрацией */
export * as GetIssues from './getIssues'

/** Получить задачу по HASH */
export * as GetIssue from './getIssue'

/** Получить все коммиты с фильтрацией */
export * as GetCommits from './getCommits'

/** Получить все циклы с фильтрацией */
export * as GetCycles from './getCycles'

/** Получить состояние CAPITAL контракта */
export * as GetState from './getState'
