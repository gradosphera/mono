// Статусы проекта синхронизированные с блокчейн контрактом
export enum ProjectStatus {
  PENDING = 'pending', // Проект создан
  ACTIVE = 'active', // Проект активен для коммитов
  VOTING = 'voting', // Проект на голосовании
  COMPLETED = 'completed', // Проект завершен
  CLOSED = 'closed', // Проект закрыт
}

export interface ProjectDomainEntity {
  id: string;
  cycleId: string;
  title: string;
  description: string;
  status: ProjectStatus;

  // Авторы проекта и их доли
  authors: Array<{
    contributorId: string;
    sharePercent: number;
  }>;

  // Мастер проекта
  masterId?: string;

  // Финансовые показатели
  plannedHours: number;
  plannedExpenses: number;
  actualHours: number;
  actualExpenses: number;

  // Расчетные показатели
  totalInvestment: number;
  availableInvestment: number;

  createdAt: Date;
  updatedAt: Date;
}
