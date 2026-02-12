/** Добавить автора проекта в CAPITAL контракте */
export * as AddAuthor from './addAuthor'
/** Одобрить коммит в CAPITAL контракте */
export * as ApproveCommit from './approveCommit'
/** Рассчитать голоса в CAPITAL контракте */
export * as CalculateVotes from './calculateVotes'
/** Закрыть проект от инвестиций в CAPITAL контракте */
export * as CloseProject from './closeProject'
/** Завершить регистрацию в Capital через отправку документов в блокчейн */
export * as CompleteCapitalRegistration from './completeCapitalRegistration'
/** Завершить шаг онбординга CAPITAL */
export * as CompleteOnboardingStep from './completeOnboardingStep'
/** Завершить голосование в CAPITAL контракте */
export * as CompleteVoting from './completeVoting'
/** Конвертировать сегмент в CAPITAL контракте */
export * as ConvertSegment from './convertSegment'
/** Создать коммит в CAPITAL контракте */
export * as CreateCommit from './createCommit'
/** Создать цикл в CAPITAL контракте */
export * as CreateCycle from './createCycle'
/** Получить ссуду в CAPITAL контракте */
export * as CreateDebt from './createDebt'
/** Создать расход в CAPITAL контракте */
export * as CreateExpense from './createExpense'
/** Создать задачу в CAPITAL контракте */
export * as CreateIssue from './createIssue'
/** Создать программный имущественный взнос в CAPITAL контракте */
export * as CreateProgramProperty from './createProgramProperty'
/** Создать проект в CAPITAL контракте */
export * as CreateProject from './createProject'
/** Инвестировать в проект CAPITAL контракта */
export * as CreateProjectInvest from './createProjectInvest'
/** Создать проектный имущественный взнос в CAPITAL контракте */
export * as CreateProjectProperty from './createProjectProperty'
/** Создать историю в CAPITAL контракте */
export * as CreateStory from './createStory'
/** Отклонить коммит в CAPITAL контракте */
export * as DeclineCommit from './declineCommit'
/** Удалить задачу в CAPITAL контракте */
export * as DeleteIssue from './deleteIssue'
/** Удалить проект в CAPITAL контракте */
export * as DeleteProject from './deleteProject'
/** Удалить историю в CAPITAL контракте */
export * as DeleteStory from './deleteStory'
/** Редактировать участника */
export * as EditContributor from './editContributor'
/** Редактировать проект в CAPITAL контракте */
export * as EditProject from './editProject'
/** Финализировать проект в CAPITAL контракте */
export * as FinalizeProject from './finalizeProject'
/** Финансировать программу CAPITAL контракта */
export * as FundProgram from './fundProgram'
/** Сгенерировать соглашение о капитализации */
export * as GenerateCapitalizationAgreement from './generateCapitalizationAgreement'
/** Сгенерировать заявление об инвестировании в капитализацию */
export * as GenerateCapitalizationMoneyInvestStatement from './generateCapitalizationMoneyInvestStatement'
/** Сгенерировать акт об инвестировании имуществом в капитализацию */
export * as GenerateCapitalizationPropertyInvestAct from './generateCapitalizationPropertyInvestAct'
/** Сгенерировать решение об инвестировании имуществом в капитализацию */
export * as GenerateCapitalizationPropertyInvestDecision from './generateCapitalizationPropertyInvestDecision'
/** Сгенерировать заявление об инвестировании имуществом в капитализацию */
export * as GenerateCapitalizationPropertyInvestStatement from './generateCapitalizationPropertyInvestStatement'
/** Сгенерировать заявление о конвертации из капитализации в основной кошелек */
export * as GenerateCapitalizationToMainWalletConvertStatement from './generateCapitalizationToMainWalletConvertStatement'
/** Сгенерировать пачку документов для завершения регистрации в Capital */
export * as GenerateCapitalRegistrationDocuments from './generateCapitalRegistrationDocuments'
/** Сгенерировать генерационное соглашение для компонента */
export * as GenerateComponentGenerationContract from './generateComponentGenerationContract'
/** Сгенерировать решение о расходе */
export * as GenerateExpenseDecision from './generateExpenseDecision'
/** Сгенерировать заявление о расходе */
export * as GenerateExpenseStatement from './generateExpenseStatement'
/** Сгенерировать генерационное соглашение */
export * as GenerateGenerationContract from './generateGenerationContract'
/** Сгенерировать заявление об инвестировании в генерацию */
export * as GenerateGenerationMoneyInvestStatement from './generateGenerationMoneyInvestStatement'
/** Сгенерировать акт об инвестировании имуществом в генерацию */
export * as GenerateGenerationPropertyInvestAct from './generateGenerationPropertyInvestAct'
/** Сгенерировать решение об инвестировании имуществом в генерацию */
export * as GenerateGenerationPropertyInvestDecision from './generateGenerationPropertyInvestDecision'

/** Сгенерировать заявление об инвестировании имуществом в генерацию */
export * as GenerateGenerationPropertyInvestStatement from './generateGenerationPropertyInvestStatement'
/** Сгенерировать заявление о конвертации из генерации в капитализацию */
export * as GenerateGenerationToCapitalizationConvertStatement from './generateGenerationToCapitalizationConvertStatement'
/** Сгенерировать заявление о конвертации из генерации в основной кошелек */
export * as GenerateGenerationToMainWalletConvertStatement from './generateGenerationToMainWalletConvertStatement'
/** Сгенерировать заявление о конвертации из генерации в проектный кошелек */
export * as GenerateGenerationToProjectConvertStatement from './generateGenerationToProjectConvertStatement'
/** Сгенерировать решение о получении займа */
export * as GenerateGetLoanDecision from './generateGetLoanDecision'
/** Сгенерировать заявление о получении займа */
export * as GenerateGetLoanStatement from './generateGetLoanStatement'
/** Сгенерировать генерационное соглашение для проекта */
export * as GenerateProjectGenerationContract from './generateProjectGenerationContract'
/** Сгенерировать акт о вкладе результатов */
export * as GenerateResultContributionAct from './generateResultContributionAct'
/** Сгенерировать решение о вкладе результатов */
export * as GenerateResultContributionDecision from './generateResultContributionDecision'
/** Сгенерировать заявление о вкладе результатов */
export * as GenerateResultContributionStatement from './generateResultContributionStatement'
/** Импортировать участника в CAPITAL контракт */
export * as ImportContributor from './importContributor'
/** Подписать приложение в CAPITAL контракте */
export * as MakeClearance from './makeClearance'
/** Обновить CRPS пайщика в программе CAPITAL контракта */
export * as OpenProject from './openProject'
/** Открыть проект для инвестиций в CAPITAL контракте */
export * as PushResult from './pushResult'
/** Внести результат в CAPITAL контракте */
export * as RefreshProgram from './refreshProgram'
/** Обновить сегмент в CAPITAL контракте */
export * as RefreshSegment from './refreshSegment'
/** Зарегистрировать участника в CAPITAL контракте */
export * as RegisterContributor from './registerContributor'
/** Установить конфигурацию CAPITAL контракта */
export * as SetConfig from './setConfig'
/** Установить мастера проекта в CAPITAL контракте */
export * as SetMaster from './setMaster'
/** Установить план проекта в CAPITAL контракте */
export * as SetPlan from './setPlan'
/** Подписать акт о вкладе результатов председателем */
export * as SignActAsChairman from './signActAsChairman'
/** Подписать акт о вкладе результатов участником */
export * as SignActAsContributor from './signActAsContributor'
/** Запустить проект в CAPITAL контракте */
export * as StartProject from './startProject'
/** Запустить голосование в CAPITAL контракте */
export * as StartVoting from './startVoting'
/** Остановить проект в CAPITAL контракте */
export * as StopProject from './stopProject'
/** Проголосовать в CAPITAL контракте */
export * as SubmitVote from './submitVote'
/** Обновить задачу в CAPITAL контракте */
export * as UpdateIssue from './updateIssue'

/** Обновить историю в CAPITAL контракте */
export * as UpdateStory from './updateStory'
