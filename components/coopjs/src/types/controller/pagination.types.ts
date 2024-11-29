export type ZPaginationResult<T = any> = {
  items: Array<T>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export type ZPaginationSelector<T = any> = {
  items: T;
  totalCount: boolean;
  totalPages: boolean;
  currentPage: boolean;
};
