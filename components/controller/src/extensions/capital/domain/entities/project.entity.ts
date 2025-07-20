export enum ProjectStatus {
  WAITING = 'waiting',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  REVIEW = 'review',
  DISTRIBUTION = 'distribution',
  CLOSED = 'closed',
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
