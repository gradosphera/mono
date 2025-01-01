export interface PaginationResultLegacy<T = any> {
  results: [T];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
