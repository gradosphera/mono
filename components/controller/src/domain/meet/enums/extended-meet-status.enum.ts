import { registerEnumType } from '@nestjs/graphql';

// Расширенные статусы собрания
export enum ExtendedMeetStatus {
  // Начальное состояние
  NONE = 'none',

  // Базовые статусы блокчейна
  CREATED = 'created',
  AUTHORIZED = 'authorized',
  PRECLOSED = 'preclosed',
  CLOSED = 'closed',

  // Дополнительные статусы
  WAITING_FOR_OPENING = 'waitingForOpening', // Ожидает открытия
  VOTING_IN_PROGRESS = 'votingInProgress', // Голосование идет
  EXPIRED_NO_QUORUM = 'expiredNoQuorum', // Истекло без кворума
  VOTING_COMPLETED = 'votingCompleted', // Ожидает подписей
  ONRESTART = 'onrestart', // Ожидаем утверждения новой даты собрания
}

// Регистрируем перечисление для GraphQL
registerEnumType(ExtendedMeetStatus, {
  name: 'ExtendedMeetStatus',
  description: 'Расширенный статус собрания на основе дат и состояния',
  valuesMap: {
    NONE: {
      description: 'Неопределенное состояние',
    },
    CREATED: {
      description: 'Создано',
    },
    AUTHORIZED: {
      description: 'Авторизовано',
    },
    PRECLOSED: {
      description: 'Предварительно закрыто',
    },
    CLOSED: {
      description: 'Закрыто',
    },
    ONRESTART: {
      description: 'Ожидаем утверждения новой даты собрания',
    },
    WAITING_FOR_OPENING: {
      description: 'Ожидает открытия',
    },
    VOTING_IN_PROGRESS: {
      description: 'Голосование идет',
    },
    EXPIRED_NO_QUORUM: {
      description: 'Истекло без кворума',
    },
    VOTING_COMPLETED: {
      description: 'Голосование завершено, ожидает подписей',
    },
  },
});
