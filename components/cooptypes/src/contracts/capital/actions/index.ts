// Актуальные действия контракта Capital из capital.hpp

// Управление конфигурацией
export * as SetConfig from './setConfig'

// Управление проектами
export * as CreateProject from './createProject'
export * as OpenProject from './openProject'
export * as StartProject from './startProject'
export * as CompleteProject from './completeProject'
export * as CompleteVoting from './completeVoting'
export * as FinalVoting from './finalVoting'
export * as SubmitVote from './submitVote'
export * as CloseProject from './closeProject'
export * as DeleteProject from './deleteProject'
export * as SetMaster from './setMaster'
export * as SetPlan from './setPlan'
export * as ExpandExpenses from './expandExpenses'

// Конвертация сегментов
export * as ConvertSegment from './convertSegment'

// Возврат из проекта (createwthd2, capauthwthd2, capdeclwthd2, approvewthd2)
export * as CreateWithdrawProject from './createWithdrawProject'

// Возврат из программы (createwthd3, capauthwthd3, approvewthd3, capdeclwthd3)
export * as CreateWithdrawProgram from './createWithdrawProgram'

// Результаты
export * as PushResult from './pushResult'
export * as SignAct1 from './signAct1'
export * as SignAct2 from './signAct2'

// Авторы
export * as AddAuthor from './addAuthor'

// Коммиты
export * as CreateCommit from './createCommit'

// Долги
export * as CreateDebt from './createDebt'

// Регистрация участников
export * as RegisterContributor from './registerContributor'

// Приложения к договору УХД
export * as SignAppendix from './signAppendix'

// Инвестиции в проекты
export * as CreateInvest from './createInvest'
export * as ReturnUnused from './returnUnused'

// Программные инвестиции
export * as CreateProgramInvest from './createProgramInvest'

// Аллокация программных инвестиций
export * as Allocate from './allocate'
export * as Deallocate from './deallocate'

// Расходы
export * as CreateExpense from './createExpense'

// Членские взносы
export * as FundProject from './fundProject'
export * as RefreshProject from './refreshProject'
export * as FundProgram from './fundProgram'
export * as RefreshProgram from './refreshProgram'

// CRPS
export * as RefreshSegment from './refreshSegment'

// Участники проектов
export * as AddContributor from './addContributor'
