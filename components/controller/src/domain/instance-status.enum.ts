import { registerEnumType } from '@nestjs/graphql';

/**
 * Жизненный цикл статусов инстанса кооператива
 */
export enum InstanceStatus {
  /** Ожидание - новый кооператив, еще не обрабатывается */
  PENDING = 'pending',

  /** Аренда - процесс аренды сервера запущен */
  RENT = 'rent',

  /** Установка - сервер арендован, идет установка через Ansible */
  INSTALL = 'install',

  /** Активный - установка завершена, кооператив работает */
  ACTIVE = 'active',

  /** Заблокирован - кооператив заблокирован в блокчейне */
  BLOCKED = 'blocked',

  /** Ошибка - возникла ошибка в процессе */
  ERROR = 'error',
}

/**
 * Переходы между статусами
 */
export const INSTANCE_STATUS_TRANSITIONS: Record<InstanceStatus, InstanceStatus[]> = {
  [InstanceStatus.PENDING]: [InstanceStatus.RENT, InstanceStatus.ERROR],
  [InstanceStatus.RENT]: [InstanceStatus.INSTALL, InstanceStatus.ERROR],
  [InstanceStatus.INSTALL]: [InstanceStatus.ACTIVE, InstanceStatus.ERROR],
  [InstanceStatus.ACTIVE]: [InstanceStatus.BLOCKED, InstanceStatus.ERROR],
  [InstanceStatus.BLOCKED]: [InstanceStatus.PENDING, InstanceStatus.ERROR],
  [InstanceStatus.ERROR]: [InstanceStatus.PENDING],
};

// Регистрируем enum для GraphQL
registerEnumType(InstanceStatus, {
  name: 'InstanceStatus',
  description: 'Статусы жизненного цикла инстанса кооператива',
});
