export enum AssignmentStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface AssignmentDomainEntity {
  id: string;
  projectId: string;

  // Основная информация
  title: string;
  description: string;
  status: AssignmentStatus;

  // Ответственные
  masterId: string; // мастер, ответственный за задание
  assignedCreators: string[]; // ID создателей, назначенных на задание

  // Планирование
  estimatedHours: number;
  estimatedExpenses: number;

  // Фактические показатели
  actualHours: number;
  actualExpenses: number;

  // Финансирование
  allocatedInvestment: number;
  availableForLoan: number;

  // Критерии выполнения
  stories: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
