export enum ContributorRole {
  AUTHOR = 'author',
  CREATOR = 'creator',
  INVESTOR = 'investor',
  MASTER = 'master',
  COORDINATOR = 'coordinator',
}

export interface ContributorDomainEntity {
  id: string;
  userId: string; // связь с основной системой пользователей

  // Персональные настройки
  personalHourCost: number; // стоимость часа (по умолчанию 2000 RUB)

  // Общая статистика по участию
  totalInvestedAmount: number;
  totalWorkedHours: number;
  totalEarnedAmount: number;

  // Роли в разных проектах
  roles: ContributorRole[];

  // Статус в системе
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
