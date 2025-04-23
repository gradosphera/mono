import { createUnionType } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '../dto/generated-document.dto';
import { FreeDecisionDocumentDTO } from '../documents-dto/free-decision-document.dto';
import { ProjectFreeDecisionDocumentDTO } from '../documents-dto/project-free-decision-document.dto';
import { ParticipantApplicationDecisionDocumentDTO } from '../documents-dto/participant-application-decision-document.dto';
import { ParticipantApplicationDocumentDTO } from '../documents-dto/participant-application-document.dto';
import { AssetContributionStatementDocumentDTO } from '../documents-dto/asset-contribution-statement-document.dto';
import { AssetContributionDecisionDocumentDTO } from '../documents-dto/asset-contribution-decision-document.dto';
import { AssetContributionActDocumentDTO } from '../documents-dto/asset-contribution-act-document.dto';
import { ReturnByAssetStatementDocumentDTO } from '../documents-dto/return-by-asset-statement-document.dto';
import { ReturnByAssetDecisionDocumentDTO } from '../documents-dto/return-by-asset-decision-document.dto';
import { ReturnByAssetActDocumentDTO } from '../documents-dto/return-by-asset-act-document.dto';
import { AnnualGeneralMeetingAgendaDocumentDTO } from '../documents-dto/annual-general-meeting-agenda-document.dto';
import { AnnualGeneralMeetingDecisionDocumentDTO } from '../documents-dto/annual-general-meeting-decision-document.dto';
import { AnnualGeneralMeetingNotificationDocumentDTO } from '../documents-dto/annual-general-meeting-notification-document.dto';
import { AnnualGeneralMeetingSovietDecisionDocumentDTO } from '../documents-dto/annual-general-meeting-soviet-decision-document.dto';
import { AnnualGeneralMeetingVotingBallotDocumentDTO } from '../documents-dto/annual-general-meeting-voting-ballot-document.dto';
import { SelectBranchDocumentDTO } from '../documents-dto/select-branch-document.dto';
import { Cooperative } from 'cooptypes';

// Соответствие registry_id документов
const DOCUMENT_REGISTRY_TYPES = {
  // Протокол решения совета
  [Cooperative.Registry.FreeDecision.registry_id]: FreeDecisionDocumentDTO,
  // Решение совета о приёме пайщика в кооператив
  [Cooperative.Registry.DecisionOfParticipantApplication.registry_id]: ParticipantApplicationDecisionDocumentDTO,
  // Заявление о вступлении в кооператив
  [Cooperative.Registry.ParticipantApplication.registry_id]: ParticipantApplicationDocumentDTO,
  // Проект решения совета
  [Cooperative.Registry.ProjectFreeDecision.registry_id]: ProjectFreeDecisionDocumentDTO,
  // Заявление о внесении имущественного паевого взноса
  [Cooperative.Registry.AssetContributionStatement.registry_id]: AssetContributionStatementDocumentDTO,
  // Решение совета об утверждении акта приёмки имущества в качестве паевого взноса
  [Cooperative.Registry.AssetContributionDecision.registry_id]: AssetContributionDecisionDocumentDTO,
  // Акт приёмки имущества в качестве паевого взноса
  [Cooperative.Registry.AssetContributionAct.registry_id]: AssetContributionActDocumentDTO,
  // Заявление о возврате паенакоплений
  [Cooperative.Registry.ReturnByAssetStatement.registry_id]: ReturnByAssetStatementDocumentDTO,
  // Решение совета о возврате паенакоплений
  [Cooperative.Registry.ReturnByAssetDecision.registry_id]: ReturnByAssetDecisionDocumentDTO,
  // Акт возврата паенакоплений
  [Cooperative.Registry.ReturnByAssetAct.registry_id]: ReturnByAssetActDocumentDTO,
  // Повестка дня общего собрания
  [Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id]: AnnualGeneralMeetingAgendaDocumentDTO,
  // Протокол решения общего собрания пайщиков
  [Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id]: AnnualGeneralMeetingDecisionDocumentDTO,
  // Уведомление о проведении общего собрания пайщиков
  [Cooperative.Registry.AnnualGeneralMeetingNotification.registry_id]: AnnualGeneralMeetingNotificationDocumentDTO,
  // Решение совета о созыве общего собрания
  [Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id]: AnnualGeneralMeetingSovietDecisionDocumentDTO,
  // Бюллетень для голосования на общем собрании пайщиков
  [Cooperative.Registry.AnnualGeneralMeetingVotingBallot.registry_id]: AnnualGeneralMeetingVotingBallotDocumentDTO,
  // Заявление о выборе кооперативного участка
  [Cooperative.Registry.SelectBranchStatement.registry_id]: SelectBranchDocumentDTO,
  // Базовые документы без специфичных DTO используют GeneratedDocumentDTO
  [Cooperative.Registry.WalletAgreement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.RegulationElectronicSignature.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.PrivacyPolicy.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.UserAgreement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.CoopenomicsAgreement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.SosediAgreement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.InvestmentAgreement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.InvestByResultStatement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.InvestByResultAct.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.InvestByMoneyStatement.registry_id]: GeneratedDocumentDTO,
  [Cooperative.Registry.InvestMembershipConvertation.registry_id]: GeneratedDocumentDTO,
};

// Список registry_id для всех документов
const DOCUMENT_REGISTRY_IDS = Object.keys(DOCUMENT_REGISTRY_TYPES).map(Number);

// Список типов документов для union
const DOCUMENT_TYPES = Object.values(DOCUMENT_REGISTRY_TYPES);

export const DocumentUnion = createUnionType({
  name: 'DocumentUnion',
  description: 'Объединение всех типов документов системы',
  types: () => [...DOCUMENT_TYPES, GeneratedDocumentDTO],
  resolveType(value) {
    // Получаем registry_id из документа
    const registry_id = value?.meta?.registry_id;

    // Определение по registry_id
    if (registry_id && DOCUMENT_REGISTRY_IDS.includes(registry_id)) {
      return DOCUMENT_REGISTRY_TYPES[registry_id];
    }

    // Если не удалось определить тип по registry_id, используем GeneratedDocumentDTO
    return GeneratedDocumentDTO;
  },
});
