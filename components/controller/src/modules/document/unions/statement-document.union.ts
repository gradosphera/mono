import { createUnionType } from '@nestjs/graphql';
import { ParticipantApplicationDocumentDTO } from '../documents-dto/participant-application-document.dto';
import { ProjectFreeDecisionDocumentDTO } from '../documents-dto/project-free-decision-document.dto';
import { AssetContributionStatementDocumentDTO } from '../documents-dto/asset-contribution-statement-document.dto';
import { ReturnByAssetStatementDocumentDTO } from '../documents-dto/return-by-asset-statement-document.dto';
import { SelectBranchDocumentDTO } from '../documents-dto/select-branch-document.dto';
import { GeneratedDocumentDTO } from '../dto/generated-document.dto';

// Соответствие registry_id документов для заявлений
const STATEMENT_REGISTRY_TYPES = {
  // Заявление о вступлении в кооператив
  100: ParticipantApplicationDocumentDTO,
  // Проект решения совета
  599: ProjectFreeDecisionDocumentDTO,
  // Заявление о внесении имущественного паевого взноса
  700: AssetContributionStatementDocumentDTO,
  // Заявление о возврате паенакоплений
  800: ReturnByAssetStatementDocumentDTO,
  // Заявление о выборе кооперативного участка
  101: SelectBranchDocumentDTO,
};

// Список registry_id для документов заявлений
const STATEMENT_REGISTRY_IDS = Object.keys(STATEMENT_REGISTRY_TYPES).map(Number);

// Список типов документов для union
const STATEMENT_DOCUMENT_TYPES = Object.values(STATEMENT_REGISTRY_TYPES);

export const StatementDocumentUnion = createUnionType({
  name: 'StatementDocumentUnion',
  description:
    'Объединение типов документов заявлений, или других документов, за которыми следует появление протокола решения совета',
  types: () => [...STATEMENT_DOCUMENT_TYPES, GeneratedDocumentDTO],
  resolveType(value) {
    // Определение по registry_id
    if (value?.meta?.registry_id && STATEMENT_REGISTRY_IDS.includes(value.meta.registry_id)) {
      return STATEMENT_REGISTRY_TYPES[value.meta.registry_id];
    }

    // Возвращаем GeneratedDocumentDTO как запасной вариант, чтобы не возвращать null
    return GeneratedDocumentDTO;
  },
});
