import { LogEventType } from '../enums/log-event-type.enum';
import type { ILogDomainInterface } from '../interfaces/log-domain.interface';

/**
 * Доменная сущность лога
 * Представляет событие изменения в системе капитала
 */
export class LogDomainEntity implements ILogDomainInterface {
  _id!: string;
  coopname!: string;
  project_hash!: string;
  event_type!: LogEventType;
  initiator!: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  message!: string;
  created_at!: Date;

  /**
   * Конструктор для создания сущности лога
   */
  constructor(data: ILogDomainInterface) {
    this._id = data._id;
    this.coopname = data.coopname;
    this.project_hash = data.project_hash.toLowerCase();
    this.event_type = data.event_type;
    this.initiator = data.initiator;
    this.reference_id = data.reference_id;
    this.metadata = data.metadata;
    this.message = data.message;
    this.created_at = data.created_at;
  }

  /**
   * Статический метод для создания нового лога
   */
  static create(params: {
    coopname: string;
    project_hash: string;
    event_type: LogEventType;
    initiator: string;
    reference_id?: string;
    metadata?: Record<string, any>;
  }): Omit<LogDomainEntity, '_id' | 'created_at'> {
    const message = LogDomainEntity.generateMessage(params.event_type, params);

    return {
      coopname: params.coopname,
      project_hash: params.project_hash.toLowerCase(),
      event_type: params.event_type,
      initiator: params.initiator,
      reference_id: params.reference_id,
      metadata: params.metadata,
      message,
    } as Omit<LogDomainEntity, '_id' | 'created_at'>;
  }

  /**
   * Генерирует человекочитаемое сообщение на основе типа события и метаданных
   */
  private static generateMessage(
    eventType: LogEventType,
    params: {
      initiator: string;
      metadata?: Record<string, any>;
    }
  ): string {
    const { initiator, metadata = {} } = params;

    switch (eventType) {
      case LogEventType.AUTHOR_ADDED:
        return `Пайщик #${initiator} добавил соавтора ${metadata.author_username || 'неизвестно'}`;

      case LogEventType.PROJECT_CREATED:
        return `Пайщик #${initiator} создал проект "${metadata.title || 'без названия'}"`;

      case LogEventType.COMPONENT_CREATED:
        return `Пайщик #${initiator} создал компонент "${metadata.title || 'без названия'}"`;

      case LogEventType.COMMIT_RECEIVED:
        return `Пайщик #${initiator} отправил коммит на сумму ${metadata.amount || '0'} ${metadata.symbol || ''}`;

      case LogEventType.INVESTMENT_RECEIVED:
        return `Пайщик #${initiator} инвестировал ${metadata.amount || '0'} ${metadata.symbol || ''}`;

      case LogEventType.PROJECT_MASTER_ASSIGNED:
        return `Пайщик #${metadata.master || 'неизвестно'} назначен мастером проекта`;

      case LogEventType.COMPONENT_MASTER_ASSIGNED:
        return `Пайщик #${metadata.master || 'неизвестно'} назначен мастером компонента`;

      case LogEventType.RESULT_CONTRIBUTION_RECEIVED:
        return `Пайщик #${initiator} совершил взнос результатом на сумму ${metadata.amount || '0'} ${metadata.symbol || ''}`;

      default:
        return `Событие ${eventType} инициировано пользователем ${initiator}`;
    }
  }
}
