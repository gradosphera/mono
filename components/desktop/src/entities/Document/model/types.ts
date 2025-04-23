import type { Ref } from 'vue';
import type { Cooperative } from 'cooptypes';
import type { Queries } from '@coopenomics/sdk';

export type IComplexDocument = Cooperative.Document.IComplexDocument;
export type ZComplexDocument = Queries.Documents.GetDocuments.IOutput[typeof Queries.Documents.GetDocuments.name];

// Информация о пагинации
export interface IPagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Типы документов в системе
export type DocumentType = 'newresolved' | 'newsubmitted';

// Интерфейс для фильтрации документов
export interface IDocumentFilter {
  receiver: string;
  additionalFilters?: Record<string, any>;
}

// Интерфейс для запроса документов
export interface IGetDocuments {
  filter: IDocumentFilter;
  type: DocumentType;
  limit?: number;
  page?: number;
}

// Состояние документов в хранилище
export interface IDocumentState {
  documents: IComplexDocument[];
  loading: boolean;
}

// Интерфейс хранилища документов
export interface IDocumentStore {
  documents: Ref<IComplexDocument[]>;
  loading: Ref<boolean>;
  documentType: Ref<DocumentType>;
  pagination: Ref<IPagination>;
  loadDocuments: (filter: Record<string, any>, type?: DocumentType, hidden?: boolean) => Promise<IComplexDocument[]>;
  changeDocumentType: (type: DocumentType, filter: Record<string, any>) => Promise<void>;
}

