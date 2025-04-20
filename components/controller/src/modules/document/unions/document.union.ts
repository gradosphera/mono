import { createUnionType } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { FreeDecisionDocumentDTO } from '~/modules/document/documents-dto/free-decision-document.dto';
import { ProjectFreeDecisionDocumentDTO } from '~/modules/document/documents-dto/project-free-decision-document.dto';
import { ParticipantApplicationDecisionDocumentDTO } from '~/modules/document/documents-dto/participant-application-decision-document.dto';
import { ParticipantApplicationDocumentDTO } from '~/modules/document/documents-dto/participant-application-document.dto';

export type DocumentUnionType =
  | FreeDecisionDocumentDTO
  | ParticipantApplicationDecisionDocumentDTO
  | ParticipantApplicationDocumentDTO
  | ProjectFreeDecisionDocumentDTO
  | GeneratedDocumentDTO;

export const DocumentUnion = createUnionType({
  name: 'DocumentUnion',
  description: 'Объединение всех типов документов системы',
  types: () =>
    [
      FreeDecisionDocumentDTO,
      ParticipantApplicationDecisionDocumentDTO,
      ParticipantApplicationDocumentDTO,
      ProjectFreeDecisionDocumentDTO,
      GeneratedDocumentDTO, //универсальный документ, который не содержит дополнительных параметров генерации (например, используется во всех базовых соглашений с пользователем)
    ] as const,
  resolveType(value) {
    if (value instanceof FreeDecisionDocumentDTO) {
      return FreeDecisionDocumentDTO;
    }
    if (value instanceof ParticipantApplicationDecisionDocumentDTO) {
      return ParticipantApplicationDecisionDocumentDTO;
    }
    if (value instanceof ParticipantApplicationDocumentDTO) {
      return ParticipantApplicationDocumentDTO;
    }
    if (value instanceof ProjectFreeDecisionDocumentDTO) {
      return ProjectFreeDecisionDocumentDTO;
    }
    if (value instanceof GeneratedDocumentDTO) {
      return GeneratedDocumentDTO;
    }
    return null;
  },
});
