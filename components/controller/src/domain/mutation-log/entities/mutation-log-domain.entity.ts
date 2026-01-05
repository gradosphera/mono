import type {
  IMutationLogDomainInterface,
  ICreateMutationLogDomainInterface,
} from '../interfaces/mutation-log-domain.interface';

/**
 * Доменная сущность лога мутации
 * Представляет запись о выполнении GraphQL мутации
 */
export class MutationLogDomainEntity implements IMutationLogDomainInterface {
  _id!: string;
  coopname?: string;
  mutation_name!: string;
  username!: string;
  arguments!: Record<string, any>;
  duration_ms!: number;
  status!: 'success' | 'error';
  error_message?: string;
  created_at!: Date;

  /**
   * Конструктор для создания сущности лога мутации из данных БД
   */
  constructor(data: IMutationLogDomainInterface) {
    this._id = data._id;
    this.coopname = data.coopname;
    this.mutation_name = data.mutation_name;
    this.username = data.username;
    this.arguments = data.arguments;
    this.duration_ms = data.duration_ms;
    this.status = data.status;
    this.error_message = data.error_message;
    this.created_at = data.created_at;
  }

  /**
   * Статический метод для создания нового лога
   */
  static create(params: ICreateMutationLogDomainInterface): Omit<MutationLogDomainEntity, '_id' | 'created_at'> {
    return {
      coopname: params.coopname,
      mutation_name: params.mutation_name,
      username: params.username,
      arguments: params.arguments,
      duration_ms: params.duration_ms,
      status: params.status,
      error_message: params.error_message,
    } as Omit<MutationLogDomainEntity, '_id' | 'created_at'>;
  }
}
