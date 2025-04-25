// import {
//   AnnualGeneralMeetingAgenda,
//   AnnualGeneralMeetingDecision,
//   AnnualGeneralMeetingNotification,
//   AnnualGeneralMeetingSovietDecision,
//   AnnualGeneralMeetingVotingBallot,
//   AssetContributionAct,
//   AssetContributionDecision,
//   AssetContributionStatement,
//   CoopenomicsAgreement,
//   DecisionOfParticipantApplication,
//   FreeDecision,
//   InvestByMoneyStatement,
//   InvestByResultAct,
//   InvestByResultStatement,
//   InvestMembershipConvertation,
//   InvestmentAgreement,
//   ParticipantApplication,
//   PrivacyPolicy,
//   ProjectFreeDecision,
//   RegulationElectronicSignature,
//   ReturnByAssetAct,
//   ReturnByAssetDecision,
//   ReturnByAssetStatement,
//   SelectBranchStatement,
//   SosediAgreement,
//   UserAgreement,
//   WalletAgreement,
// } from '../registry'

// /**
//  * Полный реестр всех типов документов: registry_id документа и соответствующий неймспейс
//  */

// export const documentsRegistry = {
//   // Соглашения и базовые документы
//   1: WalletAgreement, // Соглашение о кошельке
//   2: RegulationElectronicSignature, // Положение об электронной подписи
//   3: PrivacyPolicy, // Политика конфиденциальности
//   4: UserAgreement, // Пользовательское соглашение
//   50: CoopenomicsAgreement, // Соглашение с Coopenomics

//   // Заявления и документы пайщиков
//   100: ParticipantApplication, // Заявление о вступлении в кооператив
//   101: SelectBranchStatement, // Заявление о выборе кооперативного участка

//   // Общие собрания
//   300: AnnualGeneralMeetingAgenda, // Повестка дня общего собрания
//   301: AnnualGeneralMeetingSovietDecision, // Решение совета о созыве общего собрания
//   302: AnnualGeneralMeetingNotification, // Уведомление о проведении общего собрания пайщиков
//   303: AnnualGeneralMeetingVotingBallot, // Бюллетень для голосования на общем собрании пайщиков
//   304: AnnualGeneralMeetingDecision, // Протокол решения общего собрания пайщиков

//   // Решения совета
//   501: DecisionOfParticipantApplication, // Решение совета о приёме пайщика в кооператив
//   599: ProjectFreeDecision, // Проект решения совета
//   600: FreeDecision, // Протокол решения совета

//   // Документы паевых взносов
//   700: AssetContributionStatement, // Заявление о внесении имущественного паевого взноса
//   701: AssetContributionDecision, // Решение совета об утверждении акта приёмки имущества в качестве паевого взноса
//   702: AssetContributionAct, // Акт приёмки имущества в качестве паевого взноса

//   // Документы возврата паенакоплений
//   800: ReturnByAssetStatement, // Заявление о возврате паенакоплений
//   801: ReturnByAssetDecision, // Решение совета о возврате паенакоплений
//   802: ReturnByAssetAct, // Акт возврата паенакоплений

//   // Инвестиционные документы
//   1000: InvestmentAgreement, // Договор инвестирования
//   1001: InvestByResultStatement, // Заявление на инвестиции по договору УХД
//   1002: InvestByResultAct, // Акт прироста капитализации из задания
//   1005: InvestByMoneyStatement, // Заявление на ссуду под залог будущего задания
//   1010: InvestMembershipConvertation, // Выплата по расходам задания

//   // Прочие документы
//   699: SosediAgreement, // Соглашение с Соседями
// }
