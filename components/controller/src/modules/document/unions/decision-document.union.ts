import { createUnionType } from '@nestjs/graphql';
import { FreeDecisionDocumentDTO } from '../documents-dto/free-decision-document.dto';
import { ParticipantApplicationDecisionDocumentDTO } from '../documents-dto/participant-application-decision-document.dto';
import { AssetContributionDecisionDocumentDTO } from '../documents-dto/asset-contribution-decision-document.dto';
import { ReturnByAssetDecisionDocumentDTO } from '../documents-dto/return-by-asset-decision-document.dto';
import { AnnualGeneralMeetingDecisionDocumentDTO } from '../documents-dto/annual-general-meeting-decision-document.dto';
import { AnnualGeneralMeetingSovietDecisionDocumentDTO } from '../documents-dto/annual-general-meeting-soviet-decision-document.dto';
import { ProjectFreeDecisionDocumentDTO } from '../documents-dto/project-free-decision-document.dto';
import { GeneratedDocumentDTO } from '../dto/generated-document.dto';
import { Cooperative } from 'cooptypes';

// Соответствие registry_id документов для решений
const DECISION_REGISTRY_TYPES = {
  // Протокол решения совета
  [Cooperative.Registry.FreeDecision.registry_id]: FreeDecisionDocumentDTO,
  // Решение совета о приёме пайщика в кооператив
  [Cooperative.Registry.DecisionOfParticipantApplication.registry_id]: ParticipantApplicationDecisionDocumentDTO,
  // Решение совета об утверждении акта приёмки имущества в качестве паевого взноса
  [Cooperative.Registry.AssetContributionDecision.registry_id]: AssetContributionDecisionDocumentDTO,
  // Решение совета о возврате паенакоплений
  [Cooperative.Registry.ReturnByAssetDecision.registry_id]: ReturnByAssetDecisionDocumentDTO,
  // Протокол решения общего собрания пайщиков
  [Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id]: AnnualGeneralMeetingDecisionDocumentDTO,
  // Решение совета о созыве общего собрания
  [Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id]: AnnualGeneralMeetingSovietDecisionDocumentDTO,
  // Проект решения совета
  [Cooperative.Registry.ProjectFreeDecision.registry_id]: ProjectFreeDecisionDocumentDTO,
};

// Список registry_id для документов решений
const DECISION_REGISTRY_IDS = Object.keys(DECISION_REGISTRY_TYPES).map(Number);

// Список типов документов для union
const DECISION_DOCUMENT_TYPES = Object.values(DECISION_REGISTRY_TYPES);

export const DecisionDocumentUnion = createUnionType({
  name: 'DecisionDocumentUnion',
  description: 'Объединение типов документов протоколов решения совета',
  types: () => [...DECISION_DOCUMENT_TYPES, GeneratedDocumentDTO],
  resolveType(value) {
    // Получаем registry_id из документа
    const registry_id = value?.meta?.registry_id;

    // Проверяем, что registry_id принадлежит к решениям
    if (registry_id && DECISION_REGISTRY_IDS.includes(registry_id)) {
      return DECISION_REGISTRY_TYPES[registry_id];
    }

    // Возвращаем GeneratedDocumentDTO как запасной вариант, чтобы не возвращать null
    return GeneratedDocumentDTO;
  },
});
