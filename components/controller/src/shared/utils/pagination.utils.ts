import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';

/**
 * Утилита для работы с пагинацией
 * Рассчитывает параметры пагинации на основе входных данных
 */
export class PaginationUtils {
  /**
   * Создать результат пагинации из данных репозитория
   * @param items Элементы текущей страницы
   * @param totalCount Общее количество элементов
   * @param options Параметры пагинации
   * @returns Результат с пагинацией
   */
  static createPaginationResult<T>(
    items: T[],
    totalCount: number,
    options: PaginationInputDomainInterface
  ): PaginationResultDomainInterface<T> {
    const { page = 1, limit = 10 } = options;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Получить параметры для SQL запроса
   * @param options Параметры пагинации
   * @returns Параметры для LIMIT и OFFSET
   */
  static getSqlPaginationParams(options: PaginationInputDomainInterface): { limit: number; offset: number } {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    return {
      limit,
      offset,
    };
  }

  /**
   * Проверить корректность параметров пагинации
   * @param options Параметры пагинации
   * @returns Проверенные параметры
   */
  static validatePaginationOptions(options: PaginationInputDomainInterface): PaginationInputDomainInterface {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = options;

    // Проверка корректности параметров
    if (page < 1) {
      throw new Error('Номер страницы должен быть больше 0');
    }

    if (limit < 1 || limit > 1000) {
      throw new Error('Количество элементов на странице должно быть от 1 до 1000');
    }

    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      throw new Error('Направление сортировки должно быть ASC или DESC');
    }

    return {
      page,
      limit,
      sortBy,
      sortOrder,
    };
  }
}
