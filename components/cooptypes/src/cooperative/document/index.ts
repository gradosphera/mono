import type { SovietContract } from '../../contracts'
import type { IAction, IExtendedAction } from '../blockchain'
import {
  AnnualGeneralMeetingAgenda,
  AnnualGeneralMeetingDecision,
  AnnualGeneralMeetingNotification,
  AnnualGeneralMeetingSovietDecision,
  AnnualGeneralMeetingVotingBallot,
  AssetContributionAct,
  AssetContributionDecision,
  AssetContributionStatement,
  CoopenomicsAgreement,
  DecisionOfParticipantApplication,
  FreeDecision,
  InvestByMoneyStatement,
  InvestByResultAct,
  InvestByResultStatement,
  InvestMembershipConvertation,
  InvestmentAgreement,
  ParticipantApplication,
  PrivacyPolicy,
  ProjectFreeDecision,
  RegulationElectronicSignature,
  ReturnByAssetAct,
  ReturnByAssetDecision,
  ReturnByAssetStatement,
  SelectBranchStatement,
  SosediAgreement,
  UserAgreement,
  WalletAgreement,
} from '../registry'

export interface IGenerationOptions {
  skip_save?: boolean
  lang?: string
}

export type LangType = 'ru'

export interface IChainDocument {
  hash: string
  public_key: string
  signature: string
  meta: string
}

// Определение базового интерфейса для мета-информации
export interface IMetaDocument {
  title: string
  registry_id: number
  lang: string
  generator: string
  version: string
  coopname: string
  username: string
  created_at: string
  block_num: number
  timezone: string
  links: string[]
}

export interface ISignedDocument<T = any> {
  hash: string
  public_key: string
  signature: string
  meta: IMetaDocument & T
}

export interface IGeneratedDocument<T = any> {
  full_title: string
  html: string
  hash: string
  meta: IMetaDocument & T
  binary: Uint8Array
}

export interface ZGeneratedDocument<T = any> {
  full_title: string
  html: string
  hash: string
  meta: IMetaDocument & T
  binary: string
}

export interface IComplexStatement {
  action: IExtendedAction
  document: IGeneratedDocument
}

export interface IComplexDecision {
  action: IExtendedAction
  document: IGeneratedDocument
  votes_for: IExtendedAction[]
  votes_against: IExtendedAction[]
}

export interface IComplexAct {
  action?: IExtendedAction
  document?: IGeneratedDocument
}

export interface IComplexDocument {
  statement: IComplexStatement
  decision: IComplexDecision
  acts: IComplexAct[]
  links: IGeneratedDocument[]
}

export interface IGetComplexDocuments {
  results: IComplexDocument[]
  page: number
  limit: number
}

export interface IAgenda {
  table: SovietContract.Tables.Decisions.IDecision
  action: IAction
}

export interface IComplexAgenda extends IAgenda {
  documents: IComplexDocument
}

export interface IGetResponse<T> {
  results: T[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

/**
 * Общий интерфейс для генерации/регенерации документа
 */
export interface IGenerate extends Omit<Partial<IMetaDocument>, 'title'> {
  registry_id: number
  coopname: string
  username: string
  [key: string]: any
}

/**
 * Интерфейс генерации заявления на вступление в кооператив
 */
export interface IGenerateJoinCoop extends IGenerate {
  signature: string
  skip_save: boolean
}

/**
 * Интерфейс генерации решения совета
 */
export interface IGenerateJoinCoopDecision extends IGenerate {
  decision_id: number
}

/**
 * Интерфейс генерации соглашения
 */
export interface IGenerateWalletAgreement extends IGenerate {
  registry_id: number
}

export interface IDecisionData {
  id: number
  date: string
  time: string
  votes_for: number
  votes_against: number
  votes_abstained: number
  voters_percent: number
  // decision: SovietContract.Tables.Decisions.IDecision
}

export interface IProjectData {
  id: string
  question: string
  decision: string
}

export interface IIntellectualResult {
  quantity: number
  name: string
  currency: string
  unit_price: number
  total_price: number
  description: string
}

export interface IUHDContract {
  number: string
  date: string
}

export interface IContributionAmount {
  amount: number
  currency: string
  words: string
}

export * from './decisionsRegistry'

/**
 * Полный реестр всех типов документов: registry_id документа и соответствующий неймспейс
 */
export const documentsRegistry = {
  // Соглашения и базовые документы
  1: WalletAgreement, // Соглашение о кошельке
  2: RegulationElectronicSignature, // Положение об электронной подписи
  3: PrivacyPolicy, // Политика конфиденциальности
  4: UserAgreement, // Пользовательское соглашение
  50: CoopenomicsAgreement, // Соглашение с Coopenomics

  // Заявления и документы пайщиков
  100: ParticipantApplication, // Заявление о вступлении в кооператив
  101: SelectBranchStatement, // Заявление о выборе кооперативного участка

  // Общие собрания
  300: AnnualGeneralMeetingAgenda, // Повестка дня общего собрания
  301: AnnualGeneralMeetingSovietDecision, // Решение совета о созыве общего собрания
  302: AnnualGeneralMeetingNotification, // Уведомление о проведении общего собрания пайщиков
  303: AnnualGeneralMeetingVotingBallot, // Бюллетень для голосования на общем собрании пайщиков
  304: AnnualGeneralMeetingDecision, // Протокол решения общего собрания пайщиков

  // Решения совета
  501: DecisionOfParticipantApplication, // Решение совета о приёме пайщика в кооператив
  599: ProjectFreeDecision, // Проект решения совета
  600: FreeDecision, // Протокол решения совета

  // Документы паевых взносов
  700: AssetContributionStatement, // Заявление о внесении имущественного паевого взноса
  701: AssetContributionDecision, // Решение совета об утверждении акта приёмки имущества в качестве паевого взноса
  702: AssetContributionAct, // Акт приёмки имущества в качестве паевого взноса

  // Документы возврата паенакоплений
  800: ReturnByAssetStatement, // Заявление о возврате паенакоплений
  801: ReturnByAssetDecision, // Решение совета о возврате паенакоплений
  802: ReturnByAssetAct, // Акт возврата паенакоплений

  // Инвестиционные документы
  1000: InvestmentAgreement, // Договор инвестирования
  1001: InvestByResultStatement, // Заявление на инвестиции по договору УХД
  1002: InvestByResultAct, // Акт прироста капитализации из задания
  1005: InvestByMoneyStatement, // Заявление на ссуду под залог будущего задания
  1010: InvestMembershipConvertation, // Выплата по расходам задания

  // Прочие документы
  699: SosediAgreement, // Соглашение с Соседями
}
