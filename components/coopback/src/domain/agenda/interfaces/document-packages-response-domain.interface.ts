import type { DocumentPackageDomainInterface } from './document-package-domain.interface';

export interface DocumentPackagesResponseDomainInterface {
  results: DocumentPackageDomainInterface[];
  page: number;
  limit: number;
}
