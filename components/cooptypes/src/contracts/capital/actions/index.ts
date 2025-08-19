// Актуальные действия контракта Capital из capital.hpp

// Управление конфигурацией
export * as SetConfig from './setConfig'

// Управление проектами
export * as CreateProject from './createProject'
export * as OpenProject from './openProject'
export * as StartProject from './startProject'
export * as StartVoting from './startVoting'
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
// Программные имущественные взносы (новые действия)
export * as CreateProgramProperty from './createProgramProperty'
export * as Act1ProgramProperty from './act1ProgramProperty'
export * as Act2ProgramProperty from './act2ProgramProperty'

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
export * as CreateProjectInvest from './createInvest'
export * as ReturnUnused from './returnUnused'

// Программные инвестиции
export * as CreateProgramInvest from './createProgramInvest'
// Проектные имущественные взносы (новые действия)
export * as CreateProjectProperty from './createProjectProperty'

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
