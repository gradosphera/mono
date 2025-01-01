export interface GetDocumentsInputDomainInterface {
  type?: 'newsubmitted' | 'newresolved';
  query: Record<string, unknown>;
  page?: number;
  limit?: number;
}
