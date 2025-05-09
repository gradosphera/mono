// domain/account/repository/candidate.repository.ts

import type { CandidateDomainInterface } from '../interfaces/candidate-domain.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface CandidateRepository {
  findByUsername(username: string): Promise<CandidateDomainInterface | null>;
  findByRegistrationHash(hash: string): Promise<CandidateDomainInterface | null>;
  create(data: CandidateDomainInterface): Promise<CandidateDomainInterface>;
  update(username: string, data: Partial<CandidateDomainInterface>): Promise<CandidateDomainInterface | null>;
  saveDocument(
    username: string,
    documentType: 'statement' | 'wallet_agreement' | 'signature_agreement' | 'privacy_agreement' | 'user_agreement',
    document: ISignedDocumentDomainInterface
  ): Promise<void>;
}

export const CANDIDATE_REPOSITORY = Symbol('CandidateRepository');
