import type { SovietContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Интерфейс данных одобрения из блокчейна
 */
export type IApprovalBlockchainData = Omit<SovietContract.Tables.Approvals.IApproval, 'document'> & {
  document: ISignedDocumentDomainInterface;
};
