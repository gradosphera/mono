import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import type { ExtendedBlockchainActionDomainInterface } from './extended-blockchain-action-domain.interface';

export interface ActDetailDomainInterface {
  action?: ExtendedBlockchainActionDomainInterface;
  document?: GeneratedDocumentDomainInterface;
}
