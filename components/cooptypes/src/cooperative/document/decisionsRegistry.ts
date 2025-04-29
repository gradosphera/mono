import {
  AnnualGeneralMeetingDecision,
  AnnualGeneralMeetingSovietDecision, // 300
  DecisionOfParticipantApplication, // 501
  FreeDecision, // 600
  // InvestByMoneyStatement, // 1005
  // InvestByResultAct, // 1002
  // // InvestByResultDecision, // ???
  // InvestMembershipConvertation, // 1010
  // ReturnByAssetAct, // 802
  // ReturnByAssetDecision, // 801
  // ReturnByAssetStatement, // 800
} from '../registry'
// Здесь можно добавить остальные импорты, если появятся новые действия

/**
 * Реестр решений совета: ключ — действие, значение — registry_id документа
 */
export const decisionsRegistry: Record<string, number> = {
  joincoop: DecisionOfParticipantApplication.registry_id, // регистрация пайщика
  freedecision: FreeDecision.registry_id,

  creategm: AnnualGeneralMeetingSovietDecision.registry_id, // предложение повестки планового общего собрания
  completegm: AnnualGeneralMeetingDecision.registry_id, // решение общего собрания пайщиков
  // capitalinvst: InvestByResultDecision.registry_id, // заявление на инвестиции по договору УХД
  // createresult: InvestByResultAct.registry_id, // клайм прироста капитализации из задания
  // createdebt: InvestByMoneyStatement.registry_id, // взять ссуду под залог будущего задания
  // capresexpns: InvestMembershipConvertation.registry_id, // произвести выплату по расходам задания
  // capwthdrprog: ReturnByAssetStatement.registry_id, // возврат накопленных членских взносов по программе на капиталиста
  // capwthdrproj: ReturnByAssetDecision.registry_id, // возврат накопленных членских взносов по проекту на актора
  // capwthdrres: ReturnByAssetAct.registry_id, // возврат из задания
  // Добавить остальные действия и их registry_id по мере необходимости
}
