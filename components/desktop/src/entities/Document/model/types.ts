import type { Queries, Zeus } from '@coopenomics/sdk';

export type IDocumentPackageAggregate = Zeus.ModelTypes['DocumentPackageAggregate'];
export type IDocumentAggregate = Zeus.ModelTypes['DocumentAggregate'];
export type ZGetDocumentsResult = Queries.Documents.GetDocuments.IOutput[typeof Queries.Documents.GetDocuments.name];
export type IGetDocuments = Queries.Documents.GetDocuments.IInput['data']
export type ISignedDocument2 = Zeus.ModelTypes['SignedDigitalDocument']
export type ISignedChainDocument = Zeus.ModelTypes['SignedBlockchainDocument']

// Информация о пагинации
export interface IPagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Типы документов в системе
export type DocumentType = 'newsubmitted' | 'newresolved';


