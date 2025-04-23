import type { Ref } from 'vue';
import type { Cooperative } from 'cooptypes';

export type IComplexDocument = Cooperative.Document.IComplexDocument;

// Типы документов в системе
export type DocumentType = 'newresolved' | 'newsubmitted';

// Интерфейс для фильтрации документов
export interface IDocumentFilter {
  receiver: string;
  [key: string]: any;
}

// Интерфейс для запроса документов
export interface IGetDocuments {
  filter: IDocumentFilter;
  type: DocumentType;
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
  loadDocuments: (filter: Record<string, any>, type?: DocumentType, hidden?: boolean) => Promise<IComplexDocument[]>;
  changeDocumentType: (type: DocumentType, filter: Record<string, any>) => Promise<void>;
}

