import { createUnionType } from '@nestjs/graphql';
import { FreeDecisionDocumentDTO } from '../documents-dto/free-decision-document.dto';
import { ParticipantApplicationDecisionDocumentDTO } from '../documents-dto/participant-application-decision-document.dto';

export type DecisionDocumentUnionType = FreeDecisionDocumentDTO | ParticipantApplicationDecisionDocumentDTO;

export const DecisionDocumentUnion = createUnionType({
  name: 'DecisionDocumentUnion',
  description: 'Объединение типов документов протоколов решения совета',
  types: () => [FreeDecisionDocumentDTO, ParticipantApplicationDecisionDocumentDTO] as const,
  resolveType(value) {
    if (value instanceof FreeDecisionDocumentDTO) {
      return FreeDecisionDocumentDTO;
    }
    if (value instanceof ParticipantApplicationDecisionDocumentDTO) {
      return ParticipantApplicationDecisionDocumentDTO;
    }
    return null;
  },
});
