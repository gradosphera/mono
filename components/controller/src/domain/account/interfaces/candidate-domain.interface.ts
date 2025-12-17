import { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Домен-интерфейс кандидата в пайщики
 */
export interface CandidateDomainInterface {
  username: string;
  coopname: string;
  braname?: string;
  status: string;
  type: string; // Тип пользователя: individual, organization, entrepreneur
  created_at: Date;
  documents?: {
    statement?: ISignedDocumentDomainInterface;
    wallet_agreement?: ISignedDocumentDomainInterface;
    signature_agreement?: ISignedDocumentDomainInterface;
    privacy_agreement?: ISignedDocumentDomainInterface;
    user_agreement?: ISignedDocumentDomainInterface;
    capitalization_agreement?: ISignedDocumentDomainInterface;
  };
  registration_hash: string;
  referer?: string;
  public_key: string;
  meta?: string;
}
