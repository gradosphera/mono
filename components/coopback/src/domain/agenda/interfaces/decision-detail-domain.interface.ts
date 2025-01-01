import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import type { ExtendedBlockchainActionDomainInterface } from './extended-blockchain-action-domain.interface';

export interface DecisionDetailDomainInterface {
  action: ExtendedBlockchainActionDomainInterface;
  document: GeneratedDocumentDomainInterface;
  votes_for: ExtendedBlockchainActionDomainInterface[];
  votes_against: ExtendedBlockchainActionDomainInterface[];
}
