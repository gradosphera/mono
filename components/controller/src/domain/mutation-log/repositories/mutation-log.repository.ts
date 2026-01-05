import type { MutationLogDomainEntity } from '../entities/mutation-log-domain.entity';
import type {
  IMutationLogFilterDomainInterface,
  ICreateMutationLogDomainInterface,
} from '../interfaces/mutation-log-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';

/**
 * Интерфейс репозитория логов мутаций
 */
export interface MutationLogRepository {
  /**
   * Создание новой записи лога мутации
   */
  create(log: ICreateMutationLogDomainInterface): Promise<MutationLogDomainEntity>;

  /**
   * Поиск лога по ID
   */
  findById(id: string): Promise<MutationLogDomainEntity | null>;

  /**
   * Получение всех логов с фильтрацией и пагинацией
   */
  findAll(
    filter?: IMutationLogFilterDomainInterface,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<MutationLogDomainEntity>>;

  /**
   * Получение логов по имени мутации
   */
  findByMutationName(
    mutationName: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<MutationLogDomainEntity>>;

  /**
   * Получение логов по пользователю
   */
  findByUsername(
    username: string,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<MutationLogDomainEntity>>;

  /**
   * Удаление лога
   */
  delete(id: string): Promise<void>;
}

export const MUTATION_LOG_REPOSITORY = Symbol('MutationLogRepository');
