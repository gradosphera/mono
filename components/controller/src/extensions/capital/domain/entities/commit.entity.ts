export enum CommitStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface CommitDomainEntity {
  id: string;
  assignmentId: string;

  // Автор коммита
  creatorId: string;

  // Содержание коммита
  title: string;
  description: string;
  externalRepoUrl?: string; // ссылка на внешний репозиторий
  externalDbReference?: string; // ссылка на внешнюю базу данных

  // Временные затраты
  hoursSpent: number;
  hourRate: number; // ставка создателя на момент коммита
  totalCost: number; // hoursSpent * hourRate

  // Статус и обработка
  status: CommitStatus;

  // Информация о мастере
  reviewedBy?: string; // ID мастера, который принял/отклонил
  reviewComment?: string;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
