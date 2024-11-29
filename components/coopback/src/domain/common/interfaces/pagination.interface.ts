export interface PaginationInputDomainInterface {
  /** Номер страницы */
  page: number;

  /** Количество элементов на странице */
  limit: number;

  /** Ключ сортировки (например, "name") */
  sortBy?: string;

  /** Направление сортировки ("ASC" или "DESC") */
  sortOrder: 'ASC' | 'DESC';
}

export interface PaginationResultDomainInterface<T> {
  /** Список элементов на текущей странице */
  items: T[];

  /** Общее количество элементов */
  totalCount: number;

  /** Общее количество страниц */
  totalPages: number;

  /** Текущая страница */
  currentPage: number;
}
