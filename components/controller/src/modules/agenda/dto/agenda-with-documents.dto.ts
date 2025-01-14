import { ObjectType, Field } from '@nestjs/graphql';
import { DocumentPackageDTO } from './document-package.dto';
import type { AgendaWithDocumentsDomainInterface } from '~/domain/agenda/interfaces/agenda-with-documents-domain.interface';
import { BlockchainActionDTO } from './blockchain-action.dto';
import { BlockchainDecisionDTO } from './blockchain-decision.dto';

@ObjectType('AgendaWithDocuments')
export class AgendaWithDocumentsDTO implements AgendaWithDocumentsDomainInterface {
  @Field(() => BlockchainDecisionDTO, {
    description: 'Запись в таблице блокчейна о вопросе на голосовании',
  })
  table!: BlockchainDecisionDTO;

  @Field(() => BlockchainActionDTO, {
    description: 'Действие, которое привело к появлению вопроса на голосовании',
  })
  action!: BlockchainActionDTO;

  @Field(() => DocumentPackageDTO, {
    description: 'Пакет документов, включающий разные подсекции',
  })
  documents!: DocumentPackageDTO;
}
