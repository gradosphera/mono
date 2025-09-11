import { CapitalContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';

/**
 * Блокчейн порт для CAPITAL контракта
 * Определяет интерфейс взаимодействия с блокчейном
 */
export interface CapitalBlockchainPort {
  /**
   * Установка конфигурации CAPITAL контракта
   */
  setConfig(data: CapitalContract.Actions.SetConfig.ISetConfig): Promise<TransactResult>;

  /**
   * Получение состояния CAPITAL контракта (включая конфигурацию)
   */
  getConfig(coopname: string): Promise<CapitalContract.Tables.State.IState | null>;

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  importContributor(data: CapitalContract.Actions.ImportContributor.IImportContributor): Promise<TransactResult>;

  /**
   * Создание проекта в CAPITAL контракте
   */
  createProject(data: CapitalContract.Actions.CreateProject.ICreateProject): Promise<TransactResult>;

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  registerContributor(data: CapitalContract.Actions.RegisterContributor.IRegisterContributor): Promise<TransactResult>;

  /**
   * Подписание приложения в CAPITAL контракте
   */
  makeClearance(data: CapitalContract.Actions.GetClearance.IGetClearance): Promise<TransactResult>;

  /**
   * Создание коммита в CAPITAL контракте
   */
  createCommit(data: CapitalContract.Actions.CreateCommit.ICommit): Promise<TransactResult>;

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  refreshSegment(data: CapitalContract.Actions.RefreshSegment.IRefreshSegment): Promise<TransactResult>;

  /**
   * Инвестирование в проект CAPITAL контракта
   */
  createProjectInvest(data: CapitalContract.Actions.CreateProjectInvest.ICreateInvest): Promise<TransactResult>;

  /**
   * Создание долга в CAPITAL контракте
   */
  createDebt(data: CapitalContract.Actions.CreateDebt.ICreateDebt): Promise<TransactResult>;

  /**
   * Создание проектного имущественного взноса в CAPITAL контракте
   */
  createProjectProperty(data: CapitalContract.Actions.CreateProjectProperty.ICreateProjectProperty): Promise<TransactResult>;

  /**
   * Создание программного имущественного взноса в CAPITAL контракте
   */
  createProgramProperty(data: CapitalContract.Actions.CreateProgramProperty.ICreateProgramProperty): Promise<TransactResult>;

  /**
   * Запуск голосования в CAPITAL контракте
   */
  startVoting(data: CapitalContract.Actions.StartVoting.IStartVoting): Promise<TransactResult>;

  /**
   * Голосование в CAPITAL контракте
   */
  submitVote(data: CapitalContract.Actions.SubmitVote.ISubmitVote): Promise<TransactResult>;

  /**
   * Завершение голосования в CAPITAL контракте
   */
  completeVoting(data: CapitalContract.Actions.CompleteVoting.ICompleteVoting): Promise<TransactResult>;

  /**
   * Расчет голосов в CAPITAL контракте
   */
  calculateVotes(data: CapitalContract.Actions.CalculateVotes.IFinalVoting): Promise<TransactResult>;

  /**
   * Внесение результата в CAPITAL контракте
   */
  pushResult(data: CapitalContract.Actions.PushResult.IPushResult): Promise<TransactResult>;

  /**
   * Конвертация сегмента в CAPITAL контракте
   */
  convertSegment(data: CapitalContract.Actions.ConvertSegment.IConvertSegment): Promise<TransactResult>;

  /**
   * Финансирование программы в CAPITAL контракте
   */
  fundProgram(data: CapitalContract.Actions.FundProgram.IFundProgram): Promise<TransactResult>;

  /**
   * Финансирование проекта в CAPITAL контракте
   */
  fundProject(data: CapitalContract.Actions.FundProject.IFundProject): Promise<TransactResult>;

  /**
   * Обновление CRPS пайщика в программе CAPITAL контракта
   */
  refreshProgram(data: CapitalContract.Actions.RefreshProgram.IRefreshProgram): Promise<TransactResult>;

  /**
   * Обновление CRPS пайщика в проекте CAPITAL контракта
   */
  refreshProject(data: CapitalContract.Actions.RefreshProject.IRefreshProject): Promise<TransactResult>;

  /**
   * Установка мастера проекта CAPITAL контракта
   */
  setMaster(data: CapitalContract.Actions.SetMaster.ISetMaster): Promise<TransactResult>;

  /**
   * Добавление автора проекта CAPITAL контракта
   */
  addAuthor(data: CapitalContract.Actions.AddAuthor.IAddAuthor): Promise<TransactResult>;

  /**
   * Установка плана проекта CAPITAL контракта
   */
  setPlan(data: CapitalContract.Actions.SetPlan.ISetPlan): Promise<TransactResult>;

  /**
   * Запуск проекта CAPITAL контракта
   */
  startProject(data: CapitalContract.Actions.StartProject.IStartProject): Promise<TransactResult>;

  /**
   * Открытие проекта для инвестиций CAPITAL контракта
   */
  openProject(data: CapitalContract.Actions.OpenProject.IOpenProject): Promise<TransactResult>;

  /**
   * Удаление проекта CAPITAL контракта
   */
  deleteProject(data: CapitalContract.Actions.DeleteProject.IDeleteProject): Promise<TransactResult>;

  /**
   * Создание расхода CAPITAL контракта
   */
  createExpense(data: CapitalContract.Actions.CreateExpense.ICreateExpense): Promise<TransactResult>;
}

/**
 * Символ для dependency injection
 */
export const CAPITAL_BLOCKCHAIN_PORT = Symbol('CapitalBlockchainPort');
