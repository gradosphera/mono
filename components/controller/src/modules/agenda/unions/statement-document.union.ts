import { createUnionType } from '@nestjs/graphql';
import { ParticipantApplicationDocumentDTO } from '~/modules/participant/dto/participant-application-document.dto';
import { ProjectFreeDecisionDocumentDTO } from '~/modules/free-decision/dto/project-free-decision-document.dto';

export type StatementDocumentUnionType = ParticipantApplicationDocumentDTO | ProjectFreeDecisionDocumentDTO;

export const StatementDocumentUnion = createUnionType({
  name: 'StatementDocumentUnion',
  description:
    'Объединение типов документов заявлений, или других документов, за которыми следует появление протокола решения совета',
  types: () => [ParticipantApplicationDocumentDTO, ProjectFreeDecisionDocumentDTO] as const,
  resolveType(value) {
    if (value instanceof ParticipantApplicationDocumentDTO) {
      return ParticipantApplicationDocumentDTO;
    }
    if (value instanceof ProjectFreeDecisionDocumentDTO) {
      return ProjectFreeDecisionDocumentDTO;
    }
    return null;
  },
});
