export enum CycleStatus {
  WAITING = 'waiting',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  REVIEW = 'review',
  DISTRIBUTION = 'distribution',
  CLOSED = 'closed',
}

export interface CycleDomainEntity {
  id: string;
  name: string;
  description?: string;
  status: CycleStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
