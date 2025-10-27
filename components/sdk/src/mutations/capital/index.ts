/** Установить конфигурацию CAPITAL контракта */
export * as SetConfig from './setConfig'
/** Создать проект в CAPITAL контракте */
export * as CreateProject from './createProject'
/** Получить ссуду в CAPITAL контракте */
export * as CreateDebt from './createDebt'
/** Финансировать программу CAPITAL контракта */
export * as FundProgram from './fundProgram'
/** Финансировать проект CAPITAL контракта */
export * as FundProject from './fundProject'
/** Обновить CRPS пайщика в программе CAPITAL контракта */
export * as RefreshProgram from './refreshProgram'
/** Обновить CRPS пайщика в проекте CAPITAL контракта */
export * as RefreshProject from './refreshProject'
/** Создать коммит в CAPITAL контракте */
export * as CreateCommit from './createCommit'
/** Одобрить коммит в CAPITAL контракте */
export * as ApproveCommit from './approveCommit'
/** Отклонить коммит в CAPITAL контракте */
export * as DeclineCommit from './declineCommit'
/** Обновить сегмент в CAPITAL контракте */
export * as RefreshSegment from './refreshSegment'
/** Инвестировать в проект CAPITAL контракта */
export * as CreateProjectInvest from './createProjectInvest'
/** Зарегистрировать участника в CAPITAL контракте */
export * as RegisterContributor from './registerContributor'
/** Импортировать участника в CAPITAL контракт */
export * as ImportContributor from './importContributor'
/** Подписать приложение в CAPITAL контракте */
export * as MakeClearance from './makeClearance'
/** Установить мастера проекта в CAPITAL контракте */
export * as SetMaster from './setMaster'
/** Добавить автора проекта в CAPITAL контракте */
export * as AddAuthor from './addAuthor'
/** Установить план проекта в CAPITAL контракте */
export * as SetPlan from './setPlan'
/** Запустить проект в CAPITAL контракте */
export * as StartProject from './startProject'
/** Открыть проект для инвестиций в CAPITAL контракте */
export * as OpenProject from './openProject'
/** Закрыть проект от инвестиций в CAPITAL контракте */
export * as CloseProject from './closeProject'
/** Остановить проект в CAPITAL контракте */
export * as StopProject from './stopProject'
/** Удалить проект в CAPITAL контракте */
export * as DeleteProject from './deleteProject'
/** Редактировать проект в CAPITAL контракте */
export * as EditProject from './editProject'
/** Создать проектный имущественный взнос в CAPITAL контракте */
export * as CreateProjectProperty from './createProjectProperty'
/** Создать программный имущественный взнос в CAPITAL контракте */
export * as CreateProgramProperty from './createProgramProperty'
/** Внести результат в CAPITAL контракте */
export * as PushResult from './pushResult'
/** Конвертировать сегмент в CAPITAL контракте */
export * as ConvertSegment from './convertSegment'
/** Запустить голосование в CAPITAL контракте */
export * as StartVoting from './startVoting'
/** Проголосовать в CAPITAL контракте */
export * as SubmitVote from './submitVote'
/** Завершить голосование в CAPITAL контракте */
export * as CompleteVoting from './completeVoting'
/** Рассчитать голоса в CAPITAL контракте */
export * as CalculateVotes from './calculateVotes'
/** Создать историю в CAPITAL контракте */
export * as CreateStory from './createStory'
/** Обновить историю в CAPITAL контракте */
export * as UpdateStory from './updateStory'
/** Удалить историю в CAPITAL контракте */
export * as DeleteStory from './deleteStory'
/** Создать задачу в CAPITAL контракте */
export * as CreateIssue from './createIssue'
/** Обновить задачу в CAPITAL контракте */
export * as UpdateIssue from './updateIssue'
/** Удалить задачу в CAPITAL контракте */
export * as DeleteIssue from './deleteIssue'
/** Создать цикл в CAPITAL контракте */
export * as CreateCycle from './createCycle'
/** Создать расход в CAPITAL контракте */
export * as CreateExpense from './createExpense'

/** Сгенерировать соглашение о капитализации */
export * as GenerateCapitalizationAgreement from './generateCapitalizationAgreement'
/** Сгенерировать генерационное соглашение */
export * as GenerateGenerationAgreement from './generateGenerationAgreement'
/** Сгенерировать приложение к генерационному соглашению */
export * as GenerateAppendixGenerationAgreement from './generateAppendixGenerationAgreement'
/** Сгенерировать заявление о расходе */
export * as GenerateExpenseStatement from './generateExpenseStatement'
/** Сгенерировать решение о расходе */
export * as GenerateExpenseDecision from './generateExpenseDecision'
/** Сгенерировать заявление об инвестировании в генерацию */
export * as GenerateGenerationMoneyInvestStatement from './generateGenerationMoneyInvestStatement'
/** Сгенерировать заявление о возврате неиспользованных средств генерации */
export * as GenerateGenerationMoneyReturnUnusedStatement from './generateGenerationMoneyReturnUnusedStatement'
/** Сгенерировать заявление об инвестировании в капитализацию */
export * as GenerateCapitalizationMoneyInvestStatement from './generateCapitalizationMoneyInvestStatement'
/** Сгенерировать заявление о вкладе результатов */
export * as GenerateResultContributionStatement from './generateResultContributionStatement'
/** Сгенерировать решение о вкладе результатов */
export * as GenerateResultContributionDecision from './generateResultContributionDecision'
/** Сгенерировать акт о вкладе результатов */
export * as GenerateResultContributionAct from './generateResultContributionAct'
/** Сгенерировать заявление о получении займа */
export * as GenerateGetLoanStatement from './generateGetLoanStatement'
/** Сгенерировать решение о получении займа */
export * as GenerateGetLoanDecision from './generateGetLoanDecision'
/** Сгенерировать заявление об инвестировании имуществом в генерацию */
export * as GenerateGenerationPropertyInvestStatement from './generateGenerationPropertyInvestStatement'
/** Сгенерировать решение об инвестировании имуществом в генерацию */
export * as GenerateGenerationPropertyInvestDecision from './generateGenerationPropertyInvestDecision'
/** Сгенерировать акт об инвестировании имуществом в генерацию */
export * as GenerateGenerationPropertyInvestAct from './generateGenerationPropertyInvestAct'
/** Сгенерировать заявление об инвестировании имуществом в капитализацию */
export * as GenerateCapitalizationPropertyInvestStatement from './generateCapitalizationPropertyInvestStatement'
/** Сгенерировать решение об инвестировании имуществом в капитализацию */
export * as GenerateCapitalizationPropertyInvestDecision from './generateCapitalizationPropertyInvestDecision'
/** Сгенерировать акт об инвестировании имуществом в капитализацию */
export * as GenerateCapitalizationPropertyInvestAct from './generateCapitalizationPropertyInvestAct'
/** Сгенерировать заявление о конвертации из генерации в основной кошелек */
export * as GenerateGenerationToMainWalletConvertStatement from './generateGenerationToMainWalletConvertStatement'
/** Сгенерировать заявление о конвертации из генерации в проектный кошелек */
export * as GenerateGenerationToProjectConvertStatement from './generateGenerationToProjectConvertStatement'
/** Сгенерировать заявление о конвертации из генерации в капитализацию */
export * as GenerateGenerationToCapitalizationConvertStatement from './generateGenerationToCapitalizationConvertStatement'
/** Сгенерировать заявление о конвертации из капитализации в основной кошелек */
export * as GenerateCapitalizationToMainWalletConvertStatement from './generateCapitalizationToMainWalletConvertStatement'
/** Подписать акт о вкладе результатов участником */
export * as SignActAsContributor from './signActAsContributor'
/** Подписать акт о вкладе результатов председателем */
export * as SignActAsChairman from './signActAsChairman'
/** Редактировать участника */
export * as EditContributor from './editContributor'