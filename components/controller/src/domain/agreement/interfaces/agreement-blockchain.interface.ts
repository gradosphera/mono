import type { SovietContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Интерфейс данных соглашения из блокчейна
 */
export type IAgreementBlockchainData = Omit<SovietContract.Tables.Agreements.IAgreement, 'document'> & {
  document: ISignedDocumentDomainInterface;
};
